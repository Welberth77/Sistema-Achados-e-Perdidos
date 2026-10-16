import express from 'express';
import { listarCategorias } from '../controllers/categoriasController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', autenticarToken, listarCategorias);

export default router;
