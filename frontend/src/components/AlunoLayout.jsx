import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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

const links = [
  { to: '/inicio', label: 'Procurar achados' },
  { to: '/meus-relatos', label: 'Meus relatos' },
  { to: '/relatar', label: 'Relatar perda' },
];

export default function AlunoLayout() {
  const { usuario } = useAuth();
  const { escuro, alternar } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-primary text-primary-fg dark:border-white/10">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => navigate('/inicio')}
            className="flex items-center gap-2 rounded-md text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-white/15 text-xs font-bold text-white">AP</span>
            <span className="text-sm font-semibold">Achados &amp; Perdidos</span>
          </button>

          <nav aria-label="Navegação" className="hidden gap-1 sm:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                    isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={alternar}
              aria-label={escuro ? 'Ativar tema claro' : 'Ativar tema escuro'}
              aria-pressed={escuro}
              className="grid h-9 w-9 place-items-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {escuro ? <IconeSol /> : <IconeLua />}
            </button>
            <span className="mx-1 hidden text-sm font-medium text-white sm:inline">{usuario?.nome || 'Usuário'}</span>
            <LogoutButton />
          </div>
        </div>
        {/* nav em telas pequenas */}
        <nav aria-label="Navegação" className="flex gap-1 border-t border-white/10 px-4 py-2 sm:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-white/20 text-white' : 'text-white/80'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
