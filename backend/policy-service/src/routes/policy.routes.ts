import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { upload } from '../services/upload.service';
import { uploadHandler, getHandler, listHandler, deleteHandler } from '../controllers/policy.controller';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file'), uploadHandler);
router.get('/', listHandler);
router.get('/:id', getHandler);
router.delete('/:id', deleteHandler);

export default router;
