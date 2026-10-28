import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const base = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/registradores', label: 'Registradores' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/itens', label: 'Itens' },
  { to: '/relatos', label: 'Relatos' },
  { to: '/consulta', label: 'Consulta' },
  { to: '/casos', label: 'Casos' },
];

export default function Sidebar() {
  const { usuario } = useAuth();
  const links =
    usuario?.papel === 'ADMINISTRADOR'
      ? [...base, { to: '/solicitacoes', label: 'Solicitações' }, { to: '/usuarios', label: 'Usuários' }]
      : base;

  return (
    <aside className="shrink-0 border-b border-border bg-surface md:w-60 md:border-b-0 md:border-r">
      <div className="hidden h-14 items-center gap-2 border-b border-border px-5 md:flex">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-fg">AP</span>
        <span className="text-sm font-semibold text-fg">Achados &amp; Perdidos</span>
      </div>
      <nav
        aria-label="Navegação principal"
        className="flex gap-1 overflow-x-auto p-2 md:flex-col md:gap-0.5 md:overflow-visible md:p-3"
      >
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive ? 'bg-primary-soft text-link' : 'text-muted hover:bg-surface-2 hover:text-fg'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
