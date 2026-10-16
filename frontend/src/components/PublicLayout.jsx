import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import Button from './Button.jsx';

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

// Layout das páginas públicas (sem login): cabeçalho simples + conteúdo + rodapé.
export default function PublicLayout() {
  const { autenticado } = useAuth();
  const { escuro, alternar } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-fg">
              AP
            </span>
            <span className="text-sm font-semibold">Achados &amp; Perdidos</span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={alternar}
              aria-label={escuro ? 'Ativar tema claro' : 'Ativar tema escuro'}
              aria-pressed={escuro}
              className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {escuro ? <IconeSol /> : <IconeLua />}
            </button>
            <div className="mx-1.5 h-6 w-px bg-border" aria-hidden="true" />
            {autenticado ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>Ir para o painel</Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>Entrar</Button>
                <Button size="sm" onClick={() => navigate('/cadastro')}>Criar conta</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 text-sm text-muted sm:px-6">
          Sistema de Achados e Perdidos
        </div>
      </footer>
    </div>
  );
}
