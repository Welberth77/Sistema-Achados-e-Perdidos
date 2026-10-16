import express from 'express';
import {
  listarRelatos, meusRelatos, obterRelato, listarCorrespondencias, criarRelato,
} from '../controllers/relatosController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const staff = exigePapel('ADMINISTRADOR', 'SERVIDOR');

// Rotas específicas antes das com parâmetro.
router.get('/meus', autenticarToken, meusRelatos);          // qualquer autenticado (aluno)
router.post('/', autenticarToken, criarRelato);             // qualquer autenticado (aluno)
router.get('/', autenticarToken, staff, listarRelatos);     // staff: todos os relatos
router.get('/:id', autenticarToken, staff, obterRelato);
router.get('/:id/correspondencias', autenticarToken, staff, listarCorrespondencias);

export default router;
