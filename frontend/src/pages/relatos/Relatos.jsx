import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarRelatos, excluirRelato } from '../../services/relatos.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { dataBR } from '../../utils/formato.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

const STATUS = [
  { value: '', label: 'Todos os status' },
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'CORRESPONDENCIA', label: 'Correspondência' },
  { value: 'ENCERRADO', label: 'Encerrado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export default function Relatos() {
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      setDados(await listarRelatos({ q, status }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setErroAcao('');
    setExcluindo(true);
    try {
      await excluirRelato(paraExcluir.id);
      setParaExcluir(null);
      carregar();
    } catch (e) {
      setErroAcao(e.response?.data?.error || 'Não foi possível excluir o relato.');
      setParaExcluir(null);
    } finally {
      setExcluindo(false);
    }
  }

  const colunas = [
    { key: 'codigo', header: 'Código', className: 'font-medium tabular-nums' },
    { key: 'titulo', header: 'Título' },
    { key: 'categoria', header: 'Categoria', render: (row) => row.categoria?.nome || '—' },
    { key: 'local_perda', header: 'Local' },
    { key: 'data_perda', header: 'Data', render: (row) => dataBR(row.data_perda), className: 'tabular-nums text-muted' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'acoes',
      header: 'Ações',
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/relatos/${row.id}/editar`)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => setParaExcluir(row)}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Relatos de perda</h1>
          <p className="mt-1 text-sm text-muted">Registros de itens que pessoas declararam ter perdido.</p>
        </div>
      </div>

      {erroAcao && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erroAcao}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-3">
        <div className="min-w-56 flex-1">
          <Input
            label="Pesquisar"
            placeholder="Título ou descrição…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && carregar()}
          />
        </div>
        <Select label="Status" options={STATUS} value={status} onChange={(e) => setStatus(e.target.value)} />
        <Button variant="outline" onClick={carregar}>Buscar</Button>
      </div>

      <Table
        columns={colunas}
        data={dados}
        loading={loading}
        onRowClick={(row) => navigate(`/relatos/${row.id}`)}
        emptyMessage="Nenhum relato encontrado."
      />

      <ConfirmDialog
        open={!!paraExcluir}
        onClose={() => setParaExcluir(null)}
        onConfirm={confirmarExclusao}
        loading={excluindo}
        title="Excluir relato"
        mensagem={`Excluir o relato "${paraExcluir?.titulo ?? ''}" (${paraExcluir?.codigo ?? ''})? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
