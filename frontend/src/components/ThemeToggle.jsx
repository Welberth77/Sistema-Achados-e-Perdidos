import { useTheme } from '../contexts/ThemeContext.jsx';

function IconeSol() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function IconeLua() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

// Botão de alternância de tema (claro/escuro) reutilizável nas telas sem layout.
export default function ThemeToggle({ className = '' }) {
  const { escuro, alternar } = useTheme();
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={escuro ? 'Ativar tema claro' : 'Ativar tema escuro'}
      aria-pressed={escuro}
      className={`grid h-9 w-9 place-items-center rounded-md border border-border bg-surface text-muted shadow-sm transition-colors hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {escuro ? <IconeSol /> : <IconeLua />}
    </button>
  );
}
