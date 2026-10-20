import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import LogoutButton from './LogoutButton.jsx';

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

export default function Navbar() {
  const { usuario } = useAuth();
  const { escuro, alternar } = useTheme();
  const inicial = (usuario?.nome || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-1 border-b border-border bg-surface/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={alternar}
        aria-label={escuro ? 'Ativar tema claro' : 'Ativar tema escuro'}
        aria-pressed={escuro}
        className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {escuro ? <IconeSol /> : <IconeLua />}
      </button>

      <div className="mx-1.5 h-6 w-px bg-border" aria-hidden="true" />

      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-xs font-bold text-link">
          {inicial}
        </span>
        <span className="hidden text-sm font-medium text-fg sm:inline">{usuario?.nome || 'Usuário'}</span>
      </div>

      <LogoutButton className="ml-1" />
    </header>
  );
}
