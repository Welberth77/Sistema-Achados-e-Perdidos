const ACCENTS = {
  link: 'bg-primary-soft text-link',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-400/10 dark:text-slate-300',
};

export default function CardEstatistica({ titulo, valor, icon, accent = 'link' }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
      {icon && (
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${ACCENTS[accent] || ACCENTS.link}`}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <div className="truncate text-sm text-muted">{titulo}</div>
        <div className="mt-0.5 text-2xl font-semibold tabular-nums text-fg">{valor}</div>
      </div>
    </div>
  );
}
