import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarCasos } from '../../services/casos.js';
import Table from '../../components/Table.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import FiltroStatus from '../../components/FiltroStatus.jsx';
import { dataBR } from '../../utils/formato.js';

const STATUS = [
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'ENCERRADO', label: 'Encerrado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export default function Casos() {
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusSel, setStatusSel] = useState([]);

  async function carregar() {
    setLoading(true);
    try {
      setDados(await listarCasos({}));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleStatus(v) {
    setStatusSel((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  }

  const visiveis = useMemo(
    () => (statusSel.length ? dados.filter((d) => statusSel.includes(d.status)) : dados),
    [dados, statusSel]
  );

  const colunas = [
    { key: 'codigo', header: 'Código', className: 'font-medium tabular-nums' },
    { key: 'item', header: 'Item', render: (row) => (row.item ? `${row.item.codigo} — ${row.item.titulo}` : '—'), sortValue: (row) => row.item?.codigo || '' },
    { key: 'responsavel', header: 'Responsável', render: (row) => row.responsavel?.nome || '—', sortValue: (row) => row.responsavel?.nome || '' },
    { key: 'data_abertura', header: 'Abertura', render: (row) => dataBR(row.data_abertura), className: 'tabular-nums text-muted' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} />, sortValue: (row) => row.status },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Casos</h1>
          <p className="mt-1 text-sm text-muted">Ocorrências que reúnem item, relato, custódia e devolução.</p>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-surface p-3">
        <FiltroStatus options={STATUS} value={statusSel} onToggle={toggleStatus} onClear={() => setStatusSel([])} />
      </div>

      <Table
        columns={colunas}
        data={visiveis}
        loading={loading}
        onRowClick={(row) => navigate(`/casos/${row.id}`)}
        emptyMessage="Nenhum caso encontrado."
      />
    </div>
  );
}
