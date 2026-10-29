import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarItens, excluirItem } from '../../services/itens.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

const STATUS = [
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
  const [statusSel, setStatusSel] = useState([]);
  const [erroAcao, setErroAcao] = useState('');
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      setDados(await listarItens({ q }));
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

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setErroAcao('');
    setExcluindo(true);
    try {
      await excluirItem(paraExcluir.id);
      setParaExcluir(null);
      carregar();
    } catch (e) {
      setErroAcao(e.response?.data?.error || 'Não foi possível excluir o item.');
      setParaExcluir(null);
    } finally {
      setExcluindo(false);
    }
  }

  const colunas = [
    { key: 'codigo', header: 'Código', className: 'font-medium tabular-nums' },
    { key: 'titulo', header: 'Título' },
    { key: 'categoria', header: 'Categoria', render: (row) => row.categoria?.nome || '—', sortValue: (row) => row.categoria?.nome || '' },
    { key: 'local_encontrado', header: 'Local' },
    { key: 'data_encontrado', header: 'Data', className: 'tabular-nums text-muted' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} />, sortValue: (row) => row.status },
    {
      key: 'acoes',
      header: 'Ações',
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/itens/${row.id}/editar`)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => setParaExcluir(row)}>Excluir</Button>
        </div>
      ),
    },
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

      {erroAcao && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erroAcao}
        </div>
      )}

      <div className="mb-4 rounded-lg border border-border bg-surface p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <Input
              label="Pesquisar"
              placeholder="Título ou descrição…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && carregar()}
            />
          </div>
          <Button variant="outline" onClick={carregar}>Buscar</Button>
        </div>

        <div className="mt-3">
          <span className="mr-2 text-xs font-medium text-muted">Situação:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {STATUS.map((st) => {
              const ativo = statusSel.includes(st.value);
              return (
                <button
                  key={st.value}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => toggleStatus(st.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    ativo ? 'border-primary bg-primary-soft text-link' : 'border-border text-muted hover:text-fg'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
            {statusSel.length > 0 && (
              <button
                type="button"
                onClick={() => setStatusSel([])}
                className="rounded-full px-2 py-1 text-xs font-medium text-link underline-offset-2 hover:underline"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      <Table
        columns={colunas}
        data={visiveis}
        loading={loading}
        onRowClick={(row) => navigate(`/itens/${row.id}`)}
        emptyMessage="Nenhum item encontrado. Ajuste os filtros ou cadastre um novo item."
      />

      <ConfirmDialog
        open={!!paraExcluir}
        onClose={() => setParaExcluir(null)}
        onConfirm={confirmarExclusao}
        loading={excluindo}
        title="Excluir item"
        mensagem={`Excluir o item "${paraExcluir?.titulo ?? ''}" (${paraExcluir?.codigo ?? ''})? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
