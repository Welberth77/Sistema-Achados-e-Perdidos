import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarCasos } from '../../services/casos.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Select from '../../components/Select.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const STATUS = [
  { value: '', label: 'Todos os status' },
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'ENCERRADO', label: 'Encerrado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

function dataCurta(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
}

export default function Casos() {
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  async function carregar() {
    setLoading(true);
    try {
      setDados(await listarCasos({ status }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colunas = [
    { key: 'codigo', header: 'Código', className: 'font-medium tabular-nums' },
    { key: 'item', header: 'Item', render: (row) => (row.item ? `${row.item.codigo} — ${row.item.titulo}` : '—') },
    { key: 'responsavel', header: 'Responsável', render: (row) => row.responsavel?.nome || '—' },
    { key: 'data_abertura', header: 'Abertura', render: (row) => dataCurta(row.data_abertura), className: 'tabular-nums text-muted' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Casos</h1>
          <p className="mt-1 text-sm text-muted">Ocorrências que reúnem item, relato, custódia e devolução.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-3">
        <Select label="Status" options={STATUS} value={status} onChange={(e) => setStatus(e.target.value)} />
        <Button variant="outline" onClick={carregar}>Filtrar</Button>
      </div>

      <Table
        columns={colunas}
        data={dados}
        loading={loading}
        onRowClick={(row) => navigate(`/casos/${row.id}`)}
        emptyMessage="Nenhum caso encontrado."
      />
    </div>
  );
}
