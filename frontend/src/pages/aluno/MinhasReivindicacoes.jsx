import { useEffect, useState } from 'react';
import { minhasReivindicacoes } from '../../services/reivindicacoes.js';

function dataCurta(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
}

const BADGE = {
  PENDENTE: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300',
  APROVADA: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300',
  REJEITADA: 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300',
};
const ROTULO = { PENDENTE: 'Em análise', APROVADA: 'Aprovada', REJEITADA: 'Não aprovada' };

export default function MinhasReivindicacoes() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    minhasReivindicacoes()
      .then((dados) => {
        const arr = Array.isArray(dados) ? dados : [];
        setLista(arr);
        // marca as já decididas como "vistas" p/ limpar o aviso do menu
        try {
          const vistas = new Set(JSON.parse(localStorage.getItem('reivind_vistas') || '[]'));
          arr.forEach((r) => { if (r.status !== 'PENDENTE') vistas.add(r.id); });
          localStorage.setItem('reivind_vistas', JSON.stringify([...vistas]));
        } catch { /* ignora storage indisponível */ }
      })
      .catch(() => setErro('Não foi possível carregar suas solicitações.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Minhas solicitações</h1>
        <p className="mt-1 text-sm text-muted">
          Acompanhe aqui as solicitações de “esse item é meu” que você enviou e a resposta da equipe.
        </p>
      </div>

      {erro && (
        <div role="alert" className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erro}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando…</p>
      ) : lista.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-muted">
          Você ainda não enviou nenhuma solicitação.
        </div>
      ) : (
        <ul className="space-y-3">
          {lista.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-fg">{r.item?.codigo} — {r.item?.titulo}</p>
                  <p className="text-xs text-muted">Enviada em {dataCurta(r.criado_em)}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${BADGE[r.status] || BADGE.PENDENTE}`}>
                  {ROTULO[r.status] || r.status}
                </span>
              </div>

              {r.status === 'PENDENTE' && (
                <p className="mt-3 text-sm text-muted">
                  Sua solicitação está em análise pela equipe. Você verá a resposta aqui.
                </p>
              )}

              {r.status === 'APROVADA' && (
                <div className="mt-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-3 text-sm text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <p className="font-medium">Solicitação aprovada! 🎉</p>
                  <p className="mt-1">
                    Dirija-se ao setor de Achados e Perdidos levando um <strong>documento de identificação com foto</strong> e
                    uma <strong>prova de que o item é seu</strong> (nota fiscal, foto, número de série ou algum detalhe exclusivo que só o dono saberia).
                  </p>
                  {r.item?.local_encontrado && (
                    <p className="mt-1 text-xs">Referência — local onde o item foi encontrado: {r.item.local_encontrado}.</p>
                  )}
                  {r.caso_codigo && (
                    <p className="mt-1 text-xs">Ao retirar, informe o caso <strong>{r.caso_codigo}</strong>.</p>
                  )}
                </div>
              )}

              {r.status === 'REJEITADA' && (
                <p className="mt-3 text-sm text-muted">
                  A equipe não aprovou esta solicitação. Se você acredita que o item é seu, procure o setor de Achados e Perdidos para mais informações.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
