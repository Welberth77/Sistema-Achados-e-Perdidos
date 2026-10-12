import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import custodiaRouter from './routes/custodia.js';
import devolucaoRouter from './routes/devolucao.js';
import casosRouter from './routes/casos.js';

// 1. Inicializa o servidor Express
const app = express();

// 2. Middlewares globais
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// 3. Rotas da API
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/custodia', custodiaRouter);
app.use('/api/devolucao', devolucaoRouter);
app.use('/api/casos', casosRouter);

// 4. Rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// 5. Tratamento de erros globais
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
});

export default app;