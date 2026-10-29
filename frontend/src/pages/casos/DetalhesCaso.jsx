import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterCaso, encerrarCaso } from '../../services/casos.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Button from '../../components/Button.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

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
  const [confirmando, setConfirmando] = useState(false);
  const [encerrando, setEncerrando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');

  function carregar() {
    setLoading(true);
    obterCaso(id)
      .then(setCaso)
      .catch(() => setErro('Caso não encontrado.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function confirmarEncerramento() {
    setErroAcao('');
    setEncerrando(true);
    try {
      await encerrarCaso(id);
      setConfirmando(false);
      carregar();
    } catch (e) {
      setErroAcao(e.response?.data?.error || 'Não foi possível encerrar o caso.');
      setConfirmando(false);
    } finally {
      setEncerrando(false);
    }
  }

  if (loading) return <p className="text-muted">Carregando…</p>;
  if (erro)
    return (
      <div>
        <p className="mb-4 text-rose-600 dark:text-rose-400">{erro}</p>
        <Button variant="outline" onClick={() => navigate('/casos')}>Voltar</Button>
      </div>
    );

  const encerravel = caso.status !== 'ENCERRADO' && caso.status !== 'CANCELADO';
  const itemFinalizado = ['DEVOLVIDO', 'DESCARTADO'].includes(caso.item?.status);

  return (
    <div className="max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight tabular-nums text-fg">{caso.codigo}</h1>
        <StatusBadge status={caso.status} />
      </div>

      {erroAcao && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erroAcao}
        </div>
      )}

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

      {encerravel && !itemFinalizado && (
        <p className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
          Para encerrar o caso, o item vinculado precisa estar <span className="font-medium">devolvido</span> ou <span className="font-medium">descartado</span>.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate('/casos')}>Voltar</Button>
        {encerravel && (
          <Button onClick={() => setConfirmando(true)} disabled={!itemFinalizado}>Encerrar caso</Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmando}
        onClose={() => setConfirmando(false)}
        onConfirm={confirmarEncerramento}
        loading={encerrando}
        title="Encerrar caso"
        confirmLabel="Encerrar"
        mensagem={`Encerrar o caso ${caso.codigo}? Ele será marcado como concluído.`}
      />
    </div>
  );
}
