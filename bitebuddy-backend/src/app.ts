import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRouter from "./services/auth/auth.router"
import uploadRouter from "./services/upload/upload.router"
import catalogRouter from "./services/catalog/catalog.router";
import ordersRouter from "./services/orders/orders.router";
import paymentRouter from "./services/payment/payment.router";

dotenv.config();

const app = express();

// Apply JSON parsing middleware only to non-upload routes
app.use('/api/upload', cors(), helmet(), morgan('dev'), uploadRouter);

// Apply JSON parsing to other routes
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BiteBuddy backend running' });
});

app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter )
app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);

export default app;
