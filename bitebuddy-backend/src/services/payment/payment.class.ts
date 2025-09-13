import Order from "../../services/orders/orders.schema";
import { getIO } from "../../realtime/socket"; // ✅ import socket service

export default class PaymentService {
  /**
   * Mock create payment
   * In real-world, call Stripe/PayPal API here.
   * Emits: payment_initiated
   */
  static async createPayment(orderId: string, userId: string) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new Error("Order not found");

    if (order.status !== "pending") {
      throw new Error("Payment not allowed for this order");
    }

    // Simulate provider response
    const mockPaymentId = `pay_${Date.now()}`;
    const payload = {
      paymentId: mockPaymentId,
      clientSecret: "mock_client_secret",
    };

    // ✅ Emit socket event: payment_initiated
    try {
      const io = getIO();
      io.to(String(order.user)).emit("orderUpdate", {
        orderId: String(order._id),
        status: order.status, // still "pending"
        event: "payment_initiated",
        when: new Date().toISOString(),
        ...payload,
      });
    } catch (e) {
      console.warn("Socket emit failed:", e);
    }

    return payload;
  }

  /**
   * Mock confirm payment (like webhook callback)
   * Emits: payment_confirmed
   */
  static async confirmPayment(orderId: string, paymentId: string) {
    const order = await Order.findById(orderId);
    console.log("Confirming payment for order:", orderId, "with paymentId:", paymentId);
    if (!order) throw new Error("Order not found");

    if (order.status !== "pending") {
      throw new Error("Order already processed");
    }

    order.status = "confirmed";
    await order.save();

    // ✅ Emit socket event: payment_confirmed
    try {
      const io = getIO();
      io.to(String(order.user)).emit("orderUpdate", {
        orderId: String(order._id),
        status: order.status, // "confirmed"
        event: "payment_confirmed",
        when: new Date().toISOString(),
        paymentId,
      });
    } catch (e) {
      console.warn("Socket emit failed:", e);
    }

    return { success: true, order };
  }
}
