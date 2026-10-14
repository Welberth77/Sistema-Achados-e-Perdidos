import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarRelatos } from '../../services/relatos.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

// valores iguais ao enum relatos_perda.status do banco
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

  const colunas = [
    { key: 'codigo', header: 'Código' },
    { key: 'titulo', header: 'Título' },
    { key: 'categoria', header: 'Categoria', render: (row) => row.categoria?.nome || '—' },
    { key: 'local_perda', header: 'Local' },
    { key: 'data_perda', header: 'Data' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatos de perda</h1>
        {/* a tela de cadastro (/relatos/novo) é da outra parte do front */}
        <Button onClick={() => navigate('/relatos/novo')}>Novo relato</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="w-72">
          <Input
            placeholder="Pesquisar por título ou descrição..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && carregar()}
          />
        </div>
        <select
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={carregar}>Buscar</Button>
      </div>

      <Table
        columns={colunas}
        data={dados}
        loading={loading}
        onRowClick={(row) => navigate(`/relatos/${row.id}`)}
      />
    </div>
  );
}
