import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRouter from './routes/health.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Rotas da API
app.use('/api/health', healthRouter);

// Rotas futuras:
// app.use('/api/auth', authRouter);
// app.use('/api/itens', itensRouter);
// app.use('/api/registradores', registradoresRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
});

export default app;
