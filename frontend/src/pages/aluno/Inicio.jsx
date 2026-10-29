import { useEffect, useMemo, useState } from 'react';
import { listarAchados } from '../../services/achados.js';
import { CATEGORIAS_PUBLICAS } from '../../services/publico.js';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import FiltroStatus from '../../components/FiltroStatus.jsx';

const POR_PAGINA = 12;

// Situações que o aluno pode ver (itens devolvidos/descartados não aparecem aqui).
const STATUS = [
  { value: 'RECEBIDO', label: 'Recebido' },
  { value: 'EM_CUSTODIA', label: 'Em custódia' },
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'EM_DEVOLUCAO', label: 'Em devolução' },
];

function dataCurta(iso) {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso);
}

function IconeCards() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconeLista() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function LinhaDetalhe({ rotulo, valor }) {
  return (
    <div className="flex gap-2 border-b border-border py-1.5 text-sm last:border-0">
      <span className="w-32 shrink-0 text-muted">{rotulo}</span>
      <span className="text-fg">{valor || '—'}</span>
    </div>
  );
}

export default function Inicio() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [statusSel, setStatusSel] = useState([]); // múltipla seleção de situações
  const [pagina, setPagina] = useState(1);
  const [detalhe, setDetalhe] = useState(null); // item selecionado para o modal
  const [vista, setVista] = useState(() => {
    try {
      return localStorage.getItem('achados_vista') === 'lista' ? 'lista' : 'cards';
    } catch {
      return 'cards';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('achados_vista', vista);
    } catch {
      // storage indisponível — mantém só em memória
    }
  }, [vista]);

  async function carregar() {
    setLoading(true);
    setErro('');
    try {
      const achados = await listarAchados({ q, categoria });
      setItens(achados.filter((i) => i.status !== 'DEVOLVIDO' && i.status !== 'DESCARTADO'));
      setPagina(1);
    } catch {
      setErro('Não foi possível carregar os itens.');
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
    setPagina(1);
  }

  function limparStatus() {
    setStatusSel([]);
    setPagina(1);
  }

  const catOptions = [
    { value: '', label: 'Todas as categorias' },
    ...CATEGORIAS_PUBLICAS.map((c) => ({ value: c, label: c })),
  ];

  // Filtro de situação aplicado no cliente (igual às telas de admin/servidor).
  const itensFiltrados = useMemo(
    () => (statusSel.length ? itens.filter((i) => statusSel.includes(i.status)) : itens),
    [itens, statusSel]
  );

  const totalPaginas = Math.max(1, Math.ceil(itensFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * POR_PAGINA;
  const visiveis = itensFiltrados.slice(inicio, inicio + POR_PAGINA);

  const btnVista = (ativa) =>
    `grid h-8 w-8 place-items-center rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      ativa ? 'bg-primary text-primary-fg' : 'text-muted hover:text-fg'
    }`;

  return (
    <div>
      <div className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Procure o que você perdeu</h1>
        <p className="mt-1 text-sm text-muted">
          Veja os itens achados e guardados. Achou o seu? Procure o setor responsável levando um
          documento para retirá-lo.
        </p>
      </div>

      <div className="mb-5 rounded-lg border border-border bg-surface p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <Input
              label="Pesquisar"
              placeholder="Ex.: mochila, celular, chave…"
              value={q}
              maxLength={120}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && carregar()}
            />
          </div>
          <Select label="Categoria" options={catOptions} value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          <Button variant="outline" onClick={carregar}>Buscar</Button>
        </div>

        <div className="mt-4">
          <FiltroStatus options={STATUS} value={statusSel} onToggle={toggleStatus} onClear={limparStatus} />
        </div>
      </div>

      {erro && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erro}
        </div>
      )}

      {/* Barra de resultados: contador + alternância de visualização */}
      {!erro && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {loading ? 'Carregando…' : `${itensFiltrados.length} ${itensFiltrados.length === 1 ? 'item' : 'itens'}`}
          </p>
          <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5" role="group" aria-label="Modo de visualização">
            <button type="button" className={btnVista(vista === 'cards')} aria-label="Ver em cards" aria-pressed={vista === 'cards'} onClick={() => setVista('cards')}>
              <IconeCards />
            </button>
            <button type="button" className={btnVista(vista === 'lista')} aria-label="Ver em lista" aria-pressed={vista === 'lista'} onClick={() => setVista('lista')}>
              <IconeLista />
            </button>
          </div>
        </div>
      )}

      {loading ? null : itensFiltrados.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          Nenhum item encontrado. Tente outra busca ou registre um relato de perda.
        </div>
      ) : vista === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((it) => (
            <article key={it.id} className="flex flex-col rounded-lg border border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-link">
                  {it.categoria?.nome || 'Sem categoria'}
                </span>
                <StatusBadge status={it.status} />
              </div>
              <button
                type="button"
                className="text-left font-medium text-fg underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
                onClick={() => setDetalhe(it)}
              >
                {it.titulo}
              </button>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-muted">Local</dt>
                  <dd className="text-fg">{it.local_encontrado || '—'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-muted">Encontrado</dt>
                  <dd className="tabular-nums text-fg">{dataCurta(it.data_encontrado)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {visiveis.map((it) => (
            <li key={it.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-link">
                {it.categoria?.nome || 'Sem categoria'}
              </span>
              <button
                type="button"
                className="font-medium text-fg underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
                onClick={() => setDetalhe(it)}
              >
                {it.titulo}
              </button>
              <span className="text-sm text-muted">{it.local_encontrado || '—'}</span>
              <span className="text-sm tabular-nums text-muted">{dataCurta(it.data_encontrado)}</span>
              <span className="ml-auto">
                <StatusBadge status={it.status} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Paginação */}
      {!loading && totalPaginas > 1 && (
        <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label="Paginação">
          <p className="text-sm text-muted">
            Página {paginaSegura} de {totalPaginas}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={paginaSegura <= 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={paginaSegura >= totalPaginas} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}>
              Próxima
            </Button>
          </div>
        </nav>
      )}

      {/* Detalhe do item */}
      <Modal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title="Detalhes do item"
        footer={<Button variant="outline" onClick={() => setDetalhe(null)}>Fechar</Button>}
      >
        {detalhe && (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-fg">{detalhe.titulo}</h3>
              <StatusBadge status={detalhe.status} />
            </div>
            <LinhaDetalhe rotulo="Código" valor={detalhe.codigo} />
            <LinhaDetalhe rotulo="Categoria" valor={detalhe.categoria?.nome} />
            <LinhaDetalhe rotulo="Descrição" valor={detalhe.descricao} />
            <LinhaDetalhe rotulo="Cor" valor={detalhe.cor} />
            <LinhaDetalhe rotulo="Marca" valor={detalhe.marca} />
            <LinhaDetalhe rotulo="Local" valor={detalhe.local_encontrado} />
            <LinhaDetalhe rotulo="Encontrado em" valor={dataCurta(detalhe.data_encontrado)} />
            <p className="mt-4 text-xs text-muted">
              Para retirar, procure o setor responsável levando um documento de identificação.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
