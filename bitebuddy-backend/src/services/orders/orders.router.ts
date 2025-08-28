import { Router } from 'express';
import {
  placeOrder,
  listOrders,
  getOrder,
  updateStatus,
  cancelOrder,
} from './orders.controller';
import { requireRole } from '../../middlewares/roleMiddleware';
import authMiddleware from '../../middlewares/authMiddleware';

const router = Router();

/**
 * POST /api/orders
 * body: { items: [{ catalogItem: "<id>", quantity: 2 }, ... ] }
 */
router.post('/', authMiddleware, placeOrder);

/**
 * GET /api/orders
 * - Admin: all orders
 * - User: only their orders
 * Query params: page, limit, status
 */
router.get('/', authMiddleware, listOrders);

/**
 * GET /api/orders/:id
 */
router.get('/:id', authMiddleware, getOrder);

/**
 * PATCH /api/orders/:id/status
 * - Admin only
 * body: { status: 'confirmed' }
 */
router.patch('/:id/status', authMiddleware, requireRole(['admin']), updateStatus);

/**
 * POST /api/orders/:id/cancel
 * - User cancels their pending order
 */
router.post('/:id/cancel', authMiddleware, cancelOrder);

export default router;
