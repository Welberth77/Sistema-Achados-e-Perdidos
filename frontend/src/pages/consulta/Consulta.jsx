import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarItens } from '../../services/itens.js';
import { listarCategorias } from '../../services/categorias.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import FiltroStatus from '../../components/FiltroStatus.jsx';
import { hojeISO, LIM } from '../../utils/validacao.js';
import { dataBR } from '../../utils/formato.js';

const STATUS = [
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
  const [filtros, setFiltros] = useState({ q: '', categoria_id: '', data_inicio: '', data_fim: '' });
  const [statusSel, setStatusSel] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  const set = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor }));

  function toggleStatus(v) {
    setStatusSel((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  }

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
    setFiltros({ q: '', categoria_id: '', data_inicio: '', data_fim: '' });
    setStatusSel([]);
    setResultado([]);
    setBuscou(false);
  }

  const visiveis = useMemo(
    () => (statusSel.length ? resultado.filter((r) => statusSel.includes(r.status)) : resultado),
    [resultado, statusSel]
  );

  const colunas = [
    { key: 'codigo', header: 'Código', className: 'font-medium tabular-nums' },
    { key: 'titulo', header: 'Título' },
    { key: 'categoria', header: 'Categoria', render: (row) => row.categoria?.nome || '—', sortValue: (row) => row.categoria?.nome || '' },
    { key: 'local_encontrado', header: 'Local' },
    { key: 'data_encontrado', header: 'Data', render: (row) => dataBR(row.data_encontrado), className: 'tabular-nums text-muted' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} />, sortValue: (row) => row.status },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Consulta de itens</h1>
        <p className="mt-1 text-sm text-muted">Busque itens achados combinando vários critérios.</p>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-surface p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Input
              label="Termo"
              placeholder="Título ou descrição…"
              maxLength={LIM.termo}
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
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </Select>

          <Input label="Encontrado de" type="date" value={filtros.data_inicio} onChange={(e) => set('data_inicio', e.target.value)} max={hojeISO()} />
          <Input label="Encontrado até" type="date" value={filtros.data_fim} onChange={(e) => set('data_fim', e.target.value)} max={hojeISO()} />
        </div>

        <div className="mt-4">
          <FiltroStatus options={STATUS} value={statusSel} onToggle={toggleStatus} onClear={() => setStatusSel([])} />
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={buscar} loading={loading}>Buscar</Button>
          <Button variant="ghost" onClick={limpar}>Limpar</Button>
        </div>
      </div>

      {buscou && (
        <p className="mb-2 text-sm text-muted">
          {visiveis.length} resultado{visiveis.length === 1 ? '' : 's'} encontrado{visiveis.length === 1 ? '' : 's'}.
        </p>
      )}

      {buscou ? (
        <Table
          columns={colunas}
          data={visiveis}
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
