import { Request, Response } from 'express';
import ordersService from './orders.class';
import mongoose from 'mongoose';

export const placeOrder = async (req: Request, res: Response) => {
  try {
    // Auth middleware must have put user info on req.user
    const user = (req as any).user;
    if (!user || !user.id) return res.status(401).json({ message: 'Not authenticated' });

    // body: { items: [ { catalogItem: 'id', quantity: 2 }, ... ] }
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    // Input validation is minimal here; robust validation recommended
    const created = await ordersService.createOrder(user.id, items);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Failed to create order' });
  }
};

export const listOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    const status = req.query.status as string | undefined;

    const result = await ordersService.getOrders({
      page,
      limit,
      userId: user?.id,
      role: user?.role,
      status,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const order = await ordersService.getOrderById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Authorization: admin OR owner
    if (user?.role !== 'admin' && String(order.user) !== user?.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    // Admin-only route (enforced by requireRole(['admin']))
    const id = req.params.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status required' });

    const updated = await ordersService.updateOrderStatus(id, status);
    if (!updated) return res.status(404).json({ message: 'Order not found' });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id;

    const canceled = await ordersService.cancelOrderByUser(id, user.id);
    res.json(canceled);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
