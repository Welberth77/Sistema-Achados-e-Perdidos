import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterCaso } from '../../services/casos.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Button from '../../components/Button.jsx';

function Linha({ rotulo, valor, onClick }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 last:border-0 sm:flex-row sm:gap-3">
      <span className="w-44 shrink-0 text-sm font-medium text-muted">{rotulo}</span>
      {onClick ? (
        <button
          className="text-left text-sm text-link underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
          onClick={onClick}
        >
          {valor || '—'}
        </button>
      ) : (
        <span className="text-sm text-fg">{valor || '—'}</span>
      )}
    </div>
  );
}

function dataHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR');
}

export default function DetalhesCaso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setLoading(true);
    obterCaso(id)
      .then(setCaso)
      .catch(() => setErro('Caso não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-muted">Carregando…</p>;
  if (erro)
    return (
      <div>
        <p className="mb-4 text-rose-600 dark:text-rose-400">{erro}</p>
        <Button variant="outline" onClick={() => navigate('/casos')}>Voltar</Button>
      </div>
    );

  return (
    <div className="max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight tabular-nums text-fg">{caso.codigo}</h1>
        <StatusBadge status={caso.status} />
      </div>

      <section className="mb-5 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Dados do caso</h2>
        <Linha rotulo="Descrição" valor={caso.descricao} />
        <Linha rotulo="Responsável" valor={caso.responsavel?.nome} />
        <Linha rotulo="Abertura" valor={dataHora(caso.data_abertura)} />
        <Linha rotulo="Encerramento" valor={dataHora(caso.data_encerramento)} />
      </section>

      <section className="mb-5 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Vínculos</h2>
        <Linha
          rotulo="Item achado"
          valor={caso.item ? `${caso.item.codigo} — ${caso.item.titulo}` : '—'}
          onClick={caso.item ? () => navigate(`/itens/${caso.item_achado_id}`) : undefined}
        />
        <Linha
          rotulo="Relato de perda"
          valor={caso.relato ? `${caso.relato.codigo} — ${caso.relato.titulo}` : '—'}
          onClick={caso.relato ? () => navigate(`/relatos/${caso.relato_perda_id}`) : undefined}
        />
      </section>

      <Button variant="outline" onClick={() => navigate('/casos')}>Voltar</Button>
    </div>
  );
}
