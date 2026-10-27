import { useEffect, useState } from 'react';
import { listarUsuarios, alterarPapel, excluirUsuario } from '../../services/usuarios.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Table from '../../components/Table.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';

const PAPEL = {
  ADMINISTRADOR: { label: 'Administrador', cls: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25' },
  SERVIDOR: { label: 'Servidor', cls: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/25' },
  USUARIO: { label: 'Comum', cls: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/20' },
};

const PAPEL_OPCOES = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'SERVIDOR', label: 'Servidor' },
  { value: 'USUARIO', label: 'Comum' },
];

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
  const { usuario: eu } = useAuth();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [salvandoId, setSalvandoId] = useState(null);
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  function carregar() {
    setLoading(true);
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
  }

  useEffect(() => {
    carregar();
  }, []);

  async function mudarPapel(id, papel) {
    setErroAcao('');
    setSalvandoId(id);
    try {
      await alterarPapel(id, papel);
      carregar();
    } catch (e) {
      setErroAcao(e.response?.data?.error || 'Não foi possível alterar o perfil.');
    } finally {
      setSalvandoId(null);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setErroAcao('');
    setExcluindo(true);
    try {
      await excluirUsuario(paraExcluir.id);
      setParaExcluir(null);
      carregar();
    } catch (e) {
      setErroAcao(e.response?.data?.error || 'Não foi possível excluir o usuário.');
    } finally {
      setExcluindo(false);
    }
  }

  const souEu = (u) => eu && String(eu.id) === String(u.id);

  const colunas = [
    { key: 'nome', header: 'Nome', className: 'font-medium' },
    { key: 'email', header: 'E-mail' },
    { key: 'papel', header: 'Perfil', render: (r) => <PapelBadge papel={r.papel} /> },
    { key: 'criado_em', header: 'Criado em', render: (r) => dataCurta(r.criado_em), className: 'tabular-nums text-muted' },
    {
      key: 'acoes',
      header: 'Ações',
      render: (u) =>
        souEu(u) ? (
          <span className="text-xs text-muted">Sua conta</span>
        ) : (
          <div className="flex items-center gap-2">
            <Select
              options={PAPEL_OPCOES}
              value={u.papel}
              disabled={salvandoId === u.id}
              onChange={(e) => mudarPapel(u.id, e.target.value)}
              aria-label={`Perfil de ${u.nome}`}
              className="text-xs"
            />
            <Button size="sm" variant="danger" onClick={() => setParaExcluir(u)}>Excluir</Button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Usuários</h1>
        <p className="mt-1 text-sm text-muted">
          Contas cadastradas no sistema. Você pode alterar o perfil ou excluir uma conta.
        </p>
      </div>

      {erroAcao && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erroAcao}
        </div>
      )}

      {erro ? (
        <div role="alert" className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erro}
        </div>
      ) : (
        <Table columns={colunas} data={dados} loading={loading} emptyMessage="Nenhum usuário encontrado." />
      )}

      <Modal
        open={!!paraExcluir}
        onClose={() => setParaExcluir(null)}
        title="Excluir usuário"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setParaExcluir(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmarExclusao} loading={excluindo}>Excluir</Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Excluir a conta de <span className="font-medium text-fg">{paraExcluir?.nome}</span>
          {paraExcluir?.email ? ` (${paraExcluir.email})` : ''}? Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
