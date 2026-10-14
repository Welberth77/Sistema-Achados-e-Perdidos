import express from 'express';
import {
  registrarCustodia,
  transferirCustodia,
  obterHistoricoCustodia
} from '../controllers/custodiaController.js';

const router = express.Router();

// POST /api/custodia/nova - Registar nova custódia[cite: 3]
router.post('/nova', registrarCustodia);

// PUT /api/custodia/:id/transferir - Transferir custódia existente[cite: 3]
router.put('/:id/transferir', transferirCustodia);

// GET /api/custodia/:id/historico - Consultar histórico de movimentações[cite: 3]
router.get('/:id/historico', obterHistoricoCustodia);

export default router;