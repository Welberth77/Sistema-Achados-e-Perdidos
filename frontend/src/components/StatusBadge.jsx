// Status em MAIÚSCULAS, iguais aos CHECKs do banco (item, relato, caso, devolução).
// Cada status mapeia para um "tom" semântico; os tons têm variante clara e escura.
const TONES = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/25',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25',
  teal: 'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/25',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25',
};

const CONFIG = {
  RECEBIDO: { label: 'Recebido', tone: 'blue' },
  EM_CUSTODIA: { label: 'Em custódia', tone: 'amber' },
  EM_ANALISE: { label: 'Em análise', tone: 'violet' },
  EM_DEVOLUCAO: { label: 'Em devolução', tone: 'teal' },
  DEVOLVIDO: { label: 'Devolvido', tone: 'green' },
  DESCARTADO: { label: 'Descartado', tone: 'slate' },
  ABERTO: { label: 'Aberto', tone: 'blue' },
  CORRESPONDENCIA: { label: 'Correspondência', tone: 'violet' },
  SUGERIDA: { label: 'Sugerida', tone: 'violet' },
  ENCERRADO: { label: 'Encerrado', tone: 'slate' },
  CANCELADO: { label: 'Cancelado', tone: 'rose' },
  AGUARDANDO_COMPROVACAO: { label: 'Aguardando comprovação', tone: 'amber' },
  AUTORIZADO: { label: 'Autorizado', tone: 'teal' },
  INICIADA: { label: 'Iniciada', tone: 'blue' },
  PROPRIEDADE_COMPROVADA: { label: 'Propriedade comprovada', tone: 'teal' },
  AUTORIZADA: { label: 'Autorizada', tone: 'teal' },
  CONCLUIDA: { label: 'Concluída', tone: 'green' },
  CANCELADA: { label: 'Cancelada', tone: 'rose' },
};

export default function StatusBadge({ status }) {
  const c = CONFIG[status] || { label: String(status || '—'), tone: 'slate' };
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[c.tone]}`}
    >
      {c.label}
    </span>
  );
}
