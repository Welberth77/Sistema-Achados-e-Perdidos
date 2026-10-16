import { useEffect, useState } from 'react';
import api from '../services/api.js';
import CardEstatistica from '../components/CardEstatistica.jsx';

const CONEXAO = {
  verificando: { label: 'Verificando conexão…', dot: 'bg-amber-400' },
  conectado: { label: 'Backend conectado', dot: 'bg-emerald-500' },
  inesperado: { label: 'Resposta inesperada do backend', dot: 'bg-amber-400' },
  erro: { label: 'Sem conexão com o backend', dot: 'bg-rose-500' },
};

export default function Dashboard() {
  const [conexao, setConexao] = useState('verificando');

  useEffect(() => {
    api
      .get('/health')
      .then((res) => setConexao(res.data?.status === 'ok' ? 'conectado' : 'inesperado'))
      .catch(() => setConexao('erro'));
  }, []);

  const c = CONEXAO[conexao] || CONEXAO.verificando;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Visão geral dos itens, custódia e casos.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden="true" />
          {c.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardEstatistica titulo="Itens achados" valor="—" />
        <CardEstatistica titulo="Em custódia" valor="—" />
        <CardEstatistica titulo="Devolvidos" valor="—" />
        <CardEstatistica titulo="Casos em aberto" valor="—" />
        <CardEstatistica titulo="Casos encerrados" valor="—" />
      </div>

      <p className="mt-4 text-xs text-subtle">
        Os indicadores serão preenchidos quando o endpoint de resumo (/api/dashboard/resumo) estiver disponível.
      </p>
    </div>
  );
}
