import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarItens } from '../../services/itens.js';
import { listarCategorias } from '../../services/categorias.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const STATUS = [
  { value: '', label: 'Todos os status' },
  { value: 'RECEBIDO', label: 'Recebido' },
  { value: 'EM_CUSTODIA', label: 'Em custódia' },
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'EM_DEVOLUCAO', label: 'Em devolução' },
  { value: 'DEVOLVIDO', label: 'Devolvido' },
  { value: 'DESCARTADO', label: 'Descartado' },
];

export default function Consulta() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({
    q: '',
    categoria_id: '',
    status: '',
    data_inicio: '',
    data_fim: '',
  });
  const [resultado, setResultado] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  const set = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor }));

  async function buscar() {
    setLoading(true);
    try {
      setResultado(await listarItens(filtros));
      setBuscou(true);
    } finally {
      setLoading(false);
    }
  }

  function limpar() {
    setFiltros({ q: '', categoria_id: '', status: '', data_inicio: '', data_fim: '' });
    setResultado([]);
    setBuscou(false);
  }

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
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Consulta de itens</h1>
        <p className="mt-1 text-sm text-muted">Busque itens achados combinando vários critérios.</p>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-surface p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <Input
              label="Termo"
              placeholder="Título ou descrição…"
              value={filtros.q}
              onChange={(e) => set('q', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
            />
          </div>

          <Select
            label="Categoria"
            className="w-full"
            value={filtros.categoria_id}
            onChange={(e) => set('categoria_id', e.target.value)}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>

          <Select
            label="Status"
            className="w-full"
            options={STATUS}
            value={filtros.status}
            onChange={(e) => set('status', e.target.value)}
          />

          <Input
            label="Encontrado de"
            type="date"
            value={filtros.data_inicio}
            onChange={(e) => set('data_inicio', e.target.value)}
          />
          <Input
            label="Encontrado até"
            type="date"
            value={filtros.data_fim}
            onChange={(e) => set('data_fim', e.target.value)}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={buscar} loading={loading}>Buscar</Button>
          <Button variant="ghost" onClick={limpar}>Limpar</Button>
        </div>
      </div>

      {buscou && (
        <p className="mb-2 text-sm text-muted">
          {resultado.length} resultado{resultado.length === 1 ? '' : 's'} encontrado
          {resultado.length === 1 ? '' : 's'}.
        </p>
      )}

      {buscou ? (
        <Table
          columns={colunas}
          data={resultado}
          loading={loading}
          emptyMessage="Nenhum item corresponde aos filtros."
          onRowClick={(row) => navigate(`/itens/${row.id}`)}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          Use os filtros acima e clique em <span className="font-medium text-fg">Buscar</span> para consultar os itens.
        </div>
      )}
    </div>
  );
}
