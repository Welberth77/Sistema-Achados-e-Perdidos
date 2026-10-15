import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await login(email, senha);
      navigate(destino, { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setErro('E-mail ou senha inválidos.');
      } else {
        setErro('Não foi possível entrar. Verifique se o servidor está no ar.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">Achados e Perdidos</h1>
        <p className="mb-6 text-sm text-gray-500">Entre com suas credenciais</p>

        {erro && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <Button type="submit" loading={enviando} className="mt-6 w-full">
          Entrar
        </Button>
      </form>
    </div>
  );
}
