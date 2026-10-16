import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarCatalogoPublico, CATEGORIAS_PUBLICAS } from '../../services/publico.js';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';

function dataCurta(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
}

export default function Catalogo() {
  const navigate = useNavigate();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('');

  async function carregar() {
    setLoading(true);
    try {
      setItens(await listarCatalogoPublico({ categoria }));
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
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-fg">Perdeu algo no campus?</h1>
        <p className="mt-2 text-muted">
          Veja os itens que já foram encontrados e estão guardados. Para dizer que um item é seu e
          ver os detalhes, entre ou crie uma conta.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <Select label="Categoria" options={catOptions} value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        <Button variant="outline" onClick={carregar}>Filtrar</Button>
      </div>

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : itens.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          Nenhum item encontrado nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((it) => (
            <article key={it.id} className="flex flex-col rounded-lg border border-border bg-surface p-4">
              <span className="self-start rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-link">
                {it.categoria}
              </span>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-muted">Local</dt>
                  <dd className="text-fg">{it.local}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-muted">Encontrado</dt>
                  <dd className="tabular-nums text-fg">{dataCurta(it.data)}</dd>
                </div>
              </dl>
              <div className="mt-4 border-t border-border pt-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-link underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
                >
                  É meu? Entrar para ver detalhes
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-lg border border-border bg-surface p-6 text-center">
        <p className="font-medium text-fg">Não encontrou seu item?</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Crie uma conta e registre um relato de perda — você é avisado se algo parecido for encontrado.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={() => navigate('/cadastro')}>Criar conta</Button>
          <Button variant="outline" onClick={() => navigate('/login')}>Já tenho conta</Button>
        </div>
      </div>
    </div>
  );
}
