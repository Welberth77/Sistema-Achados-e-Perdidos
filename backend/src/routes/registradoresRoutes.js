import express from 'express';
import { listarRegistradores, criarRegistrador } from '../controllers/registradoresController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const staff = exigePapel('ADMINISTRADOR', 'SERVIDOR');

router.get('/', autenticarToken, staff, listarRegistradores);
router.post('/', autenticarToken, staff, criarRegistrador);

export default router;
