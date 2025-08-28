import mongoose from 'mongoose';
import Order, { IOrderItem, IOrder } from './orders.schema';
import Catalog from '../../services/catalog/catalog.schema'; 
import { getIO } from '../../realtime/socket'; // ✅ Import socket emitter

type CartItemInput = { catalogItem: string; quantity: number };

export default class OrderClass {
    /**
     * Create an order:
     * - Validate items exist
     * - Read prices and names from Catalog
     * - Compute total server-side
     * - Create order document (in a transaction if supported)
     * - Emit socket event (order_created)
     */
    static async createOrder(
        userId: string | mongoose.Types.ObjectId,
        itemsInput: CartItemInput[]
    ) {
        if (!itemsInput || itemsInput.length === 0) {
            throw new Error('No items provided');
        }

        // Detect if replica set is enabled (transactions supported)
        let session: mongoose.ClientSession | null = null;
        let canUseTransactions = false;

        try {
            if (!mongoose.connection.db) {
                throw new Error('Database connection is not established');
            }
            const adminDb = mongoose.connection.db.admin();
            const replStatus = await adminDb.replSetGetStatus().catch(() => null);
            canUseTransactions = !!replStatus;
        } catch (err) {
            canUseTransactions = false;
        }

        if (canUseTransactions) {
            session = await mongoose.startSession();
            session.startTransaction();
        }

        try {
            // Validate quantities and collect catalog IDs
            const ids = itemsInput.map((it) => it.catalogItem);
            const catalogDocs = await Catalog.find({ _id: { $in: ids } })
                .session(session ?? null);

            const map = new Map<string, any>();
            catalogDocs.forEach((d) => map.set(String(d._id), d));

            const orderItems: IOrderItem[] = [];
            let total = 0;

            for (const it of itemsInput) {
                const doc = map.get(it.catalogItem);
                if (!doc) {
                    throw new Error(`Catalog item ${it.catalogItem} not found`);
                }
                if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
                    throw new Error('Quantity must be a positive integer');
                }
                const price = doc.price;
                const name = doc.name;
                total += price * it.quantity;

                orderItems.push({
                    catalogItem: doc._id,
                    quantity: it.quantity,
                    price,
                    name,
                });
            }

            // Create order (with or without session)
            const created = await Order.create(
                [
                    {
                        user: userId,
                        items: orderItems,
                        totalPrice: total,
                    },
                ],
                session ? { session } : undefined
            );

            if (session) await session.commitTransaction();

            const order = created[0];

            // ✅ Emit socket event: order_created
            try {
                const io = getIO();
                io.to(String(order.user)).emit('orderUpdate', {
                    orderId: String(order._id),
                    status: order.status,
                    totalPrice: order.totalPrice,
                    event: 'order_created',
                    when: new Date().toISOString(),
                });
            } catch (e) {
                console.warn('Socket emit failed:', e);
            }

            return order;
        } catch (err) {
            if (session) {
                try {
                    await session.abortTransaction();
                } catch (e) {
                    // ignore
                }
            }
            throw err;
        } finally {
            if (session) session.endSession();
        }
    }

    static async getOrders({
        page = 1,
        limit = 10,
        userId,
        role,
        status,
    }: {
        page?: number;
        limit?: number;
        userId?: string;
        role?: string;
        status?: string;
    }) {
        const filter: any = {};
        if (role !== 'admin') {
            filter.user = userId;
        }
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments(filter),
        ]);

        return { items, total, page, pages: Math.ceil(total / limit) };
    }

    static async getOrderById(id: string) {
        return Order.findById(id);
    }

    /**
     * Update status (admin)
     * Emits socket event: order_status_updated
     */
    static async updateOrderStatus(id: string, status: IOrder['status']) {
        const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (updated) {
            try {
                const io = getIO();
                io.to(String(updated.user)).emit('orderUpdate', {
                    orderId: String(updated._id),
                    status: updated.status,
                    event: 'order_status_updated',
                    when: new Date().toISOString(),
                });
            } catch (e) {
                console.warn('Socket emit failed:', e);
            }
        }
        return updated;
    }

    /**
     * Cancel order by user (only if pending)
     * Emits socket event: order_cancelled
     */
    static async cancelOrderByUser(id: string, userId: string) {
        const order = await Order.findOne({ _id: id, user: userId });
        if (!order) throw new Error('Order not found');

        if (order.status !== 'pending') {
            throw new Error('Only pending orders can be cancelled');
        }

        order.status = 'cancelled';
        await order.save();

        // ✅ Emit socket event
        try {
            const io = getIO();
            io.to(String(order.user)).emit('orderUpdate', {
                orderId: String(order._id),
                status: order.status,
                event: 'order_cancelled',
                when: new Date().toISOString(),
            });
        } catch (e) {
            console.warn('Socket emit failed:', e);
        }

        return order;
    }
}
