import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navbar({ title = 'Achados e Perdidos' }) {
  const { usuario, logout } = useAuth();
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>{usuario?.nome || 'Usuário'}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
          {(usuario?.nome || 'U').charAt(0).toUpperCase()}
        </div>
        <button
          onClick={logout}
          className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
