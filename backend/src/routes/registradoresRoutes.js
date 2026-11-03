import express from 'express';
import {
  listarRegistradores, obterRegistrador, criarRegistrador, atualizarRegistrador, excluirRegistrador,
} from '../controllers/registradoresController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const staff = exigePapel('ADMINISTRADOR', 'SERVIDOR');
const admin = exigePapel('ADMINISTRADOR');

// Ver a lista: equipe (admin/servidor). Gerenciar: só ADMINISTRADOR.
router.get('/', autenticarToken, staff, listarRegistradores);
router.get('/:id', autenticarToken, staff, obterRegistrador);
router.post('/', autenticarToken, admin, criarRegistrador);
router.put('/:id', autenticarToken, admin, atualizarRegistrador);
router.delete('/:id', autenticarToken, admin, excluirRegistrador);

export default router;
