export default function Navbar({ title = 'Achados e Perdidos', user }) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>{user?.nome || 'Usuário'}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
          {(user?.nome || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}