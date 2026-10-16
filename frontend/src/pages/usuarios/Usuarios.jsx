import { useEffect, useState } from 'react';
import { listarUsuarios } from '../../services/usuarios.js';
import Table from '../../components/Table.jsx';

const PAPEL = {
  ADMINISTRADOR: { label: 'Administrador', cls: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25' },
  SERVIDOR: { label: 'Servidor', cls: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/25' },
  USUARIO: { label: 'Comum', cls: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/20' },
};

function PapelBadge({ papel }) {
  const p = PAPEL[papel] || { label: papel || '—', cls: 'bg-slate-100 text-slate-600 ring-slate-500/20' };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${p.cls}`}>
      {p.label}
    </span>
  );
}

function dataCurta(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
}

export default function Usuarios() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarUsuarios()
      .then(setDados)
      .catch((e) =>
        setErro(
          e.response?.status === 403
            ? 'Acesso restrito ao administrador.'
            : 'Não foi possível carregar os usuários.'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const colunas = [
    { key: 'nome', header: 'Nome', className: 'font-medium' },
    { key: 'email', header: 'E-mail' },
    { key: 'papel', header: 'Perfil', render: (r) => <PapelBadge papel={r.papel} /> },
    { key: 'criado_em', header: 'Criado em', render: (r) => dataCurta(r.criado_em), className: 'tabular-nums text-muted' },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Usuários</h1>
        <p className="mt-1 text-sm text-muted">Contas cadastradas no sistema e seus perfis.</p>
      </div>

      {erro ? (
        <div role="alert" className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erro}
        </div>
      ) : (
        <Table columns={colunas} data={dados} loading={loading} emptyMessage="Nenhum usuário encontrado." />
      )}
    </div>
  );
}
