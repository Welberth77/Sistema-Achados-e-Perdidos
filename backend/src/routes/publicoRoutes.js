import express from 'express';
import { listarCatalogoPublico } from '../controllers/publicoController.js';

const router = express.Router();

// Sem autenticação: catálogo público.
router.get('/itens', listarCatalogoPublico);

export default router;
