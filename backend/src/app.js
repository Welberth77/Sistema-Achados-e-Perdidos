import relatosRouter from './routes/relatos.js';
import itensRouter from './routes/itens.js';
import registradoresRouter from './routes/registradores.js';
import authRouter, { autenticar } from './routes/auth.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRouter from './routes/health.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

// As próximas rotas da API exigem autenticação.
app.use('/api', autenticar);
app.use('/api/relatos', relatosRouter);
app.use('/api/itens', itensRouter);
app.use('/api/registradores', registradoresRouter);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Rota não encontrada',
      details: [],
    },
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusInformado = err.status || err.statusCode;
  const status =
    Number.isInteger(statusInformado) && statusInformado >= 400 && statusInformado <= 599
      ? statusInformado
      : 500;

  const erros = {
    400: ['BAD_REQUEST', 'Requisição malformada.'],
    401: ['UNAUTHORIZED', 'Autenticação necessária.'],
    403: ['FORBIDDEN', 'Você não tem permissão para esta ação.'],
    404: ['NOT_FOUND', 'Recurso não encontrado.'],
    409: ['CONFLICT', 'Conflito ao processar a requisição.'],
    413: ['PAYLOAD_TOO_LARGE', 'Corpo da requisição muito grande.'],
    422: ['VALIDATION_ERROR', 'Confira os dados enviados.'],
  };

  if (status >= 500) {
    console.error(err);
  }

  const [code, message] =
    status >= 500
      ? ['INTERNAL_ERROR', 'Erro interno do servidor.']
      : erros[status] || ['REQUEST_ERROR', 'Não foi possível processar a requisição.'];

  return res.status(status).json({
    error: { code, message, details: [] },
  });
});

export default app;
