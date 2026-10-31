import { useState } from 'react';
import StatusBadge, { STATUS_CONFIG } from './StatusBadge.jsx';

const ITENS = ['RECEBIDO', 'EM_CUSTODIA', 'EM_ANALISE', 'EM_DEVOLUCAO', 'DEVOLVIDO', 'DESCARTADO'];

// Legenda expansível explicando o que cada situação significa.
export default function LegendaStatus({ statuses = ITENS, titulo = 'O que cada situação significa?' }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="text-sm">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        className="inline-flex items-center gap-1 font-medium text-link underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
      >
        {titulo}
        <span aria-hidden="true" className="text-xs">{aberto ? '▲' : '▼'}</span>
      </button>
      {aberto && (
        <ul className="mt-2 space-y-2 rounded-md border border-border bg-surface p-3">
          {statuses.map((s) => (
            <li key={s} className="flex flex-wrap items-center gap-2">
              <span className="w-32 shrink-0"><StatusBadge status={s} /></span>
              <span className="text-muted">{STATUS_CONFIG[s]?.desc || ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
