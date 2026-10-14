import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarCasos } from '../../services/casos.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

// valores iguais ao enum casos.status do banco
const STATUS = [
  { value: '', label: 'Todos os status' },
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'AGUARDANDO_COMPROVACAO', label: 'Aguardando comprovação' },
  { value: 'AUTORIZADO', label: 'Autorizado' },
  { value: 'DEVOLVIDO', label: 'Devolvido' },
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
    { key: 'codigo', header: 'Código' },
    { key: 'item', header: 'Item', render: (row) => row.item ? `${row.item.codigo} — ${row.item.titulo}` : '—' },
    { key: 'responsavel', header: 'Responsável', render: (row) => row.responsavel?.nome || '—' },
    { key: 'data_abertura', header: 'Abertura', render: (row) => dataCurta(row.data_abertura) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Casos</h1>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <select
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={carregar}>Filtrar</Button>
      </div>

      <Table
        columns={colunas}
        data={dados}
        loading={loading}
        onRowClick={(row) => navigate(`/casos/${row.id}`)}
      />
    </div>
  );
}
