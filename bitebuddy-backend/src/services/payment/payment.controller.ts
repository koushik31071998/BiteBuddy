import { Request, Response } from "express";
import PaymentService from "./payment.class";

export default class PaymentController {
  static async createPayment(req: Request, res: Response) {
    try {
      const { orderId } = req.body;
      const userId = (req as any).user.id;
      const result = await PaymentService.createPayment(orderId, userId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async confirmPayment(req: Request, res: Response) {
    try {
      const { orderId, paymentId } = req.body;

      const result = await PaymentService.confirmPayment(orderId, paymentId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}
