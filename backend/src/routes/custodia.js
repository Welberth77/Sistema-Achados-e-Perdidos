import { Router } from 'express';
import { registrarCustodia } from '../controllers/custodiaController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Aplica a validação JWT para todas as rotas de custódia
router.use(autenticarToken);

router.post('/', registrarCustodia);

export default router;