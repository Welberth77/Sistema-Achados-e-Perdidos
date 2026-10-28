import { useEffect, useState } from 'react';
import { obterResumo } from '../services/dashboard.js';
import CardEstatistica from '../components/CardEstatistica.jsx';

const S = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {p}
  </svg>
);
const IC = {
  box: S(<><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" /></>),
  shield: S(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />),
  check: S(<><path d="M20 6 9 17l-5-5" /></>),
  trash: S(<><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></>),
  bell: S(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>),
  folder: S(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />),
  users: S(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" /></>),
  badge: S(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 8h3M15 12h3M7 16h10" /></>),
  tag: S(<><path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><circle cx="7" cy="7" r="1.2" /></>),
  search: S(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>),
};

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

  const grupos = [
    {
      titulo: 'Itens',
      cards: [
        { titulo: 'Itens achados', valor: v(resumo?.itens_achados), icon: IC.box, accent: 'link' },
        { titulo: 'Em custódia', valor: v(resumo?.em_custodia), icon: IC.shield, accent: 'amber' },
        { titulo: 'Em análise', valor: v(resumo?.em_analise), icon: IC.search, accent: 'violet' },
        { titulo: 'Devolvidos', valor: v(resumo?.devolvidos), icon: IC.check, accent: 'emerald' },
        { titulo: 'Descartados', valor: v(resumo?.descartados), icon: IC.trash, accent: 'slate' },
      ],
    },
    {
      titulo: 'Fluxo',
      cards: [
        { titulo: 'Relatos em aberto', valor: v(resumo?.relatos_abertos), icon: IC.bell, accent: 'violet' },
        { titulo: 'Relatos (total)', valor: v(resumo?.relatos_total), icon: IC.bell, accent: 'link' },
        { titulo: 'Casos em aberto', valor: v(resumo?.casos_abertos), icon: IC.folder, accent: 'amber' },
        { titulo: 'Casos encerrados', valor: v(resumo?.casos_encerrados), icon: IC.check, accent: 'emerald' },
      ],
    },
    {
      titulo: 'Cadastros',
      cards: [
        { titulo: 'Usuários', valor: v(resumo?.usuarios), icon: IC.users, accent: 'link' },
        { titulo: 'Registradores', valor: v(resumo?.registradores), icon: IC.badge, accent: 'link' },
        { titulo: 'Categorias', valor: v(resumo?.categorias), icon: IC.tag, accent: 'link' },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Visão geral dos itens, relatos, casos e cadastros.</p>
      </div>

      {erro && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erro}
        </div>
      )}

      <div className="space-y-8">
        {grupos.map((g) => (
          <section key={g.titulo}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{g.titulo}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.cards.map((c) => (
                <CardEstatistica key={c.titulo} titulo={c.titulo} valor={c.valor} icon={c.icon} accent={c.accent} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
