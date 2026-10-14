import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarItens } from '../../services/itens.js';
import { listarCategorias } from '../../services/categorias.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
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
    { key: 'codigo', header: 'Código' },
    { key: 'titulo', header: 'Título' },
    { key: 'categoria', header: 'Categoria', render: (row) => row.categoria?.nome || '—' },
    { key: 'local_encontrado', header: 'Local' },
    { key: 'data_encontrado', header: 'Data' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Consulta de itens</h1>

      <div className="mb-6 rounded border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <Input
              label="Termo"
              placeholder="Título ou descrição..."
              value={filtros.q}
              onChange={(e) => set('q', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
            />
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Categoria</span>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900"
              value={filtros.categoria_id}
              onChange={(e) => set('categoria_id', e.target.value)}
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Status</span>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900"
              value={filtros.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>

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
          <Button variant="secondary" onClick={limpar}>Limpar</Button>
        </div>
      </div>

      {buscou && (
        <p className="mb-2 text-sm text-gray-600">
          {resultado.length} resultado{resultado.length === 1 ? '' : 's'} encontrado{resultado.length === 1 ? '' : 's'}.
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
        <div className="rounded border border-dashed p-8 text-center text-sm text-gray-500">
          Use os filtros acima e clique em <span className="font-medium">Buscar</span> para consultar os itens.
        </div>
      )}
    </div>
  );
}
