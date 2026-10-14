import express from 'express';
import { registrarDevolucao } from '../controllers/devolucaoController.js';

const router = express.Router();

router.post('/nova', registrarDevolucao);

export default router;