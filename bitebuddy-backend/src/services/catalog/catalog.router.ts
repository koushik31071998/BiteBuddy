import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem
} from './catalog.controller';
import authMiddleware from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createItem); // Create
router.get('/', getItems); // Read all
router.get('/:id', getItemById); // Read one
router.put('/:id', authMiddleware, updateItem); // Update
router.delete('/:id', authMiddleware, deleteItem); // Delete

export default router;
