import { useAuth } from '../auth/Sessao.jsx';

export default function Navbar() {
  const { usuario, sair } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold">Achados e Perdidos</h1>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>{usuario?.nome || 'Usuário'}</span>
        <button type="button" onClick={sair} className="rounded border px-3 py-1 hover:bg-gray-100">
          Sair
        </button>
      </div>
    </header>
  );
}
