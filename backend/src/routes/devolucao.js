import { Router } from 'express';
import { registrarDevolucao } from '../controllers/devolucaoController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(autenticarToken);
router.post('/', registrarDevolucao);

export default router;