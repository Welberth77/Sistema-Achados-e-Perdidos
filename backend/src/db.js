import 'dotenv/config';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada no .env');
}

pg.types.setTypeParser(20, (valor) => {
  const numero = Number(valor);

  if (!Number.isSafeInteger(numero)) {
    throw new RangeError('Inteiro do banco fora do intervalo seguro.');
  }

  return numero;
});

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (erro) => {
  console.error('Erro inesperado na conexão PostgreSQL:', erro.message);
});

export default pool;
