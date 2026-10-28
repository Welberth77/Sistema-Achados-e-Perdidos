import express from 'express';
import {
  listarRegistradores, obterRegistrador, criarRegistrador, atualizarRegistrador, excluirRegistrador,
} from '../controllers/registradoresController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const staff = exigePapel('ADMINISTRADOR', 'SERVIDOR');

router.get('/', autenticarToken, staff, listarRegistradores);
router.get('/:id', autenticarToken, staff, obterRegistrador);
router.post('/', autenticarToken, staff, criarRegistrador);
router.put('/:id', autenticarToken, staff, atualizarRegistrador);
router.delete('/:id', autenticarToken, staff, excluirRegistrador);

export default router;
