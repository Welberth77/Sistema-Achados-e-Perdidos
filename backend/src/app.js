import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRouter from './routes/health.js';
import authRouter from './routes/authRoutes.js';
import custodiaRouter from './routes/custodiaRoutes.js';
import devolucaoRouter from './routes/devolucaoRoutes.js';
import casosRouter from './routes/casosRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import usuariosRouter from './routes/usuariosRoutes.js';
import relatosRouter from './routes/relatosRoutes.js';

const app = express();

// Middlewares globais
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Rotas da API
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/custodia', custodiaRouter);
app.use('/api/devolucoes', devolucaoRouter);
app.use('/api/casos', casosRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/relatos', relatosRouter);

// Rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros globais
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
});

export default app;