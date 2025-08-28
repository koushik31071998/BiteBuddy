import { Router } from 'express';
import { uploadFile } from './upload.controller';
import authMiddleware from '../../middlewares/authMiddleware';  

const router = Router();

router.post('/image', authMiddleware, uploadFile);

export default router;
