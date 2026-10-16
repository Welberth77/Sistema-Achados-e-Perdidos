import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarItens } from '../../services/itens.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

// valores iguais ao enum itens_achados.status do banco
const STATUS = [
  { value: '', label: 'Todos os status' },
  { value: 'RECEBIDO', label: 'Recebido' },
  { value: 'EM_CUSTODIA', label: 'Em custódia' },
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'EM_DEVOLUCAO', label: 'Em devolução' },
  { value: 'DEVOLVIDO', label: 'Devolvido' },
  { value: 'DESCARTADO', label: 'Descartado' },
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
    { key: 'codigo', header: 'Código', className: 'font-medium tabular-nums' },
    { key: 'titulo', header: 'Título' },
    { key: 'categoria', header: 'Categoria', render: (row) => row.categoria?.nome || '—' },
    { key: 'local_encontrado', header: 'Local' },
    { key: 'data_encontrado', header: 'Data', className: 'tabular-nums text-muted' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Itens</h1>
          <p className="mt-1 text-sm text-muted">Itens achados registrados no sistema.</p>
        </div>
        <Button onClick={() => navigate('/itens/novo')}>Novo item</Button>
      </div>

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
        <Select
          label="Status"
          options={STATUS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Button variant="outline" onClick={carregar}>
          Buscar
        </Button>
      </div>

      <Table
        columns={colunas}
        data={dados}
        loading={loading}
        onRowClick={(row) => navigate(`/itens/${row.id}`)}
        emptyMessage="Nenhum item encontrado. Ajuste os filtros ou cadastre um novo item."
      />
    </div>
  );
}
