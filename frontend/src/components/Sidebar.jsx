import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/registradores', label: 'Registradores' },
  { to: '/itens', label: 'Itens' },
  { to: '/relatos', label: 'Relatos' },
  { to: '/consulta', label: 'Consulta' },
  { to: '/casos', label: 'Casos' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r bg-white p-4">
      <div className="mb-6 text-xl font-bold">A&amp;P</div>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `rounded px-3 py-2 text-sm ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
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
