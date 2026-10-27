import { useEffect, useState } from 'react';
import { obterResumo } from '../services/dashboard.js';
import CardEstatistica from '../components/CardEstatistica.jsx';

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    obterResumo()
      .then(setResumo)
      .catch(() => setErro('Não foi possível carregar os números do painel.'))
      .finally(() => setLoading(false));
  }, []);

  const v = (n) => (loading ? '…' : (n ?? '—'));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Visão geral dos itens, custódia e casos.</p>
      </div>

      {erro && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardEstatistica titulo="Itens achados" valor={v(resumo?.itens_achados)} />
        <CardEstatistica titulo="Em custódia" valor={v(resumo?.em_custodia)} />
        <CardEstatistica titulo="Devolvidos" valor={v(resumo?.devolvidos)} />
        <CardEstatistica titulo="Casos em aberto" valor={v(resumo?.casos_abertos)} />
        <CardEstatistica titulo="Casos encerrados" valor={v(resumo?.casos_encerrados)} />
      </div>
    </div>
  );
}
