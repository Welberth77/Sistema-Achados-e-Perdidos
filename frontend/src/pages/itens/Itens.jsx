import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarItens } from '../../services/itens.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const STATUS = [
  { value: '', label: 'Todos os status' },
  { value: 'achado', label: 'Achado' },
  { value: 'em_custodia', label: 'Em custódia' },
  { value: 'devolvido', label: 'Devolvido' },
  { value: 'descartado', label: 'Descartado' },
  { value: 'doado', label: 'Doado' },
  { value: 'expirado', label: 'Expirado' },
];

export default function Itens() {
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  async function carregar() {
    setLoading(true);
    try {
      setDados(await listarItens({ q, status }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colunas = [
    { key: 'descricao', header: 'Descrição' },
    { key: 'categoria', header: 'Categoria' },
    { key: 'localAproximado', header: 'Local' },
    { key: 'data', header: 'Data' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Itens</h1>
        <Button onClick={() => navigate('/itens/novo')}>Novo item</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="w-72">
          <Input
            placeholder="Pesquisar por descrição ou categoria..."
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
        onRowClick={(row) => navigate(`/itens/${row.id}`)}
      />
    </div>
  );
}