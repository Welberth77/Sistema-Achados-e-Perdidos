// Status em MAIÚSCULAS, iguais aos CHECKs do banco (item, relato, caso, devolução).
// Cada status tem um "tom" semântico e uma descrição (mostrada em tooltip e na legenda).
const TONES = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/25',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25',
  teal: 'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/25',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25',
};

export const STATUS_CONFIG = {
  // Itens achados
  RECEBIDO: { label: 'Recebido', tone: 'blue', desc: 'Recém-registrado no setor, ainda não guardado formalmente.' },
  EM_CUSTODIA: { label: 'Em custódia', tone: 'amber', desc: 'Guardado no setor, aguardando o dono aparecer.' },
  EM_ANALISE: { label: 'Em análise', tone: 'violet', desc: 'Em verificação (ex.: conferindo se bate com um relato).' },
  EM_DEVOLUCAO: { label: 'Em devolução', tone: 'teal', desc: 'Em processo de entrega ao dono.' },
  DEVOLVIDO: { label: 'Devolvido', tone: 'green', desc: 'Item já entregue ao dono.' },
  DESCARTADO: { label: 'Descartado', tone: 'slate', desc: 'Não foi reclamado e foi descartado.' },
  // Relatos / casos
  ABERTO: { label: 'Aberto', tone: 'blue', desc: 'Registrado e aguardando.' },
  CORRESPONDENCIA: { label: 'Correspondência', tone: 'violet', desc: 'Há um item achado que combina com o relato.' },
  SUGERIDA: { label: 'Sugerida', tone: 'violet', desc: 'Sugestão automática de um item parecido.' },
  ENCERRADO: { label: 'Encerrado', tone: 'slate', desc: 'Concluído / finalizado.' },
  CANCELADO: { label: 'Cancelado', tone: 'rose', desc: 'Cancelado.' },
  // Devoluções (quando exibidas)
  AGUARDANDO_COMPROVACAO: { label: 'Aguardando comprovação', tone: 'amber', desc: 'Aguardando a comprovação de propriedade.' },
  AUTORIZADO: { label: 'Autorizado', tone: 'teal', desc: 'Devolução autorizada.' },
  INICIADA: { label: 'Iniciada', tone: 'blue', desc: 'Devolução iniciada.' },
  PROPRIEDADE_COMPROVADA: { label: 'Propriedade comprovada', tone: 'teal', desc: 'Propriedade do item comprovada.' },
  AUTORIZADA: { label: 'Autorizada', tone: 'teal', desc: 'Devolução autorizada.' },
  CONCLUIDA: { label: 'Concluída', tone: 'green', desc: 'Devolução concluída.' },
  CANCELADA: { label: 'Cancelada', tone: 'rose', desc: 'Devolução cancelada.' },
};

export default function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || { label: String(status || '—'), tone: 'slate', desc: '' };
  return (
    <span
      title={c.desc || c.label}
      className={`inline-flex cursor-default items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[c.tone]}`}
    >
      {c.label}
    </span>
  );
}
