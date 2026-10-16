import { useEffect, useState } from 'react';
import { listarAchados } from '../../services/achados.js';
import { CATEGORIAS_PUBLICAS } from '../../services/publico.js';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

function dataCurta(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
}

export default function Inicio() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');

  async function carregar() {
    setLoading(true);
    setErro('');
    try {
      setItens(await listarAchados({ q, categoria }));
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

  const catOptions = [
    { value: '', label: 'Todas as categorias' },
    ...CATEGORIAS_PUBLICAS.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div>
      <div className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Procure o que você perdeu</h1>
        <p className="mt-1 text-sm text-muted">
          Veja os itens achados e guardados. Achou o seu? Procure o setor responsável levando um
          documento para retirá-lo.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-3">
        <div className="min-w-56 flex-1">
          <Input
            label="Pesquisar"
            placeholder="Ex.: mochila, celular, chave…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && carregar()}
          />
        </div>
        <Select label="Categoria" options={catOptions} value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        <Button variant="outline" onClick={carregar}>Buscar</Button>
      </div>

      {erro && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erro}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : itens.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          Nenhum item encontrado. Tente outra busca ou registre um relato de perda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((it) => (
            <article key={it.id} className="flex flex-col rounded-lg border border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-link">
                  {it.categoria?.nome || 'Sem categoria'}
                </span>
                <StatusBadge status={it.status} />
              </div>
              <p className="font-medium text-fg">{it.titulo}</p>
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
      )}
    </div>
  );
}
