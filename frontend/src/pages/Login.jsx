import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/Sessao.jsx';

export default function Login() {
  const sessao = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const solicitado = location.state?.destino;
  const destino =
    typeof solicitado === 'string' &&
    solicitado.startsWith('/') &&
    !solicitado.startsWith('//') &&
    solicitado.split('?')[0] !== '/login'
      ? solicitado
      : '/itens';

  if (sessao.token) {
    return <Navigate to={destino} replace />;
  }

  async function entrar(evento) {
    evento.preventDefault();
    if (enviando) return;

    setErro('');
    setEnviando(true);

    try {
      await sessao.entrar(email.trim(), senha);
      setSenha('');
      navigate(destino, { replace: true });
    } catch (falha) {
      setErro(
        falha.response?.data?.error?.message ||
          'Não foi possível entrar. Confira se o backend está rodando.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Achados e Perdidos</h1>
        <p className="mb-6 text-gray-600">Entre para acessar o sistema.</p>

        {erro && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {erro}
          </p>
        )}

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium">E-mail</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-medium">Senha</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
