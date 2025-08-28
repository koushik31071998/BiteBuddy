import { Router } from "express";
import PaymentController from "./payment.controller";
import authMiddleware from "../../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, PaymentController.createPayment);
router.post("/confirm", authMiddleware, PaymentController.confirmPayment);

export default router;
