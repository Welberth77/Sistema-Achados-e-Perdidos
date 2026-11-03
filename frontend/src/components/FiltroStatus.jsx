// Filtro de situação por múltipla seleção (chips). value = array de status selecionados.
export default function FiltroStatus({ options = [], value = [], onToggle, onClear, label = 'Situação' }) {
  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center gap-3">
          <span className="text-sm font-medium text-fg">{label}</span>
          {value.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-link underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
            >
              Limpar ({value.length})
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2.5">
        {options.map((st) => {
          const ativo = value.includes(st.value);
          return (
            <button
              key={st.value}
              type="button"
              aria-pressed={ativo}
              onClick={() => onToggle(st.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                ativo
                  ? 'border-primary bg-primary text-primary-fg shadow-sm'
                  : 'border-border-strong bg-surface text-fg hover:border-primary hover:text-link'
              }`}
            >
              {ativo && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
              {st.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
