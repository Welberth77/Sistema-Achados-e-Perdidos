import { Router } from 'express';
import { obterCasoConsolidado, encerrarCaso } from '../controllers/casosController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(autenticarToken);
router.get('/:id', obterCasoConsolidado);
router.patch('/:id/encerrar', encerrarCaso);

export default router;