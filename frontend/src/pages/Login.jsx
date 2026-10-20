import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { emailValido } from '../utils/validacao.js';

// O que o sistema faz — conteúdo real do painel institucional.
const DESTAQUES = [
  { titulo: 'Registro de itens', texto: 'Cadastre o que foi encontrado, com categoria, local e data.' },
  { titulo: 'Custódia', texto: 'Acompanhe onde cada item está guardado e todo o histórico.' },
  { titulo: 'Devolução', texto: 'Entregue ao dono mediante comprovação de propriedade.' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState({});

  function validar() {
    const e = {};
    if (!email.trim()) e.email = 'Informe seu e-mail.';
    else if (!emailValido(email)) e.email = 'E-mail inválido.';
    if (!senha) e.senha = 'Informe sua senha.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function entrar(e) {
    e.preventDefault();
    setErro('');
    if (!validar()) return;
    setEnviando(true);
    try {
      const u = await login(email.trim(), senha);
      navigate(u?.papel === 'USUARIO' ? '/inicio' : destino, { replace: true });
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
    <div className="relative grid min-h-screen bg-bg lg:grid-cols-2">
      <ThemeToggle className="absolute right-4 top-4 z-20" />
      {/* Painel institucional (lado esquerdo) */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-white/15 text-sm font-bold">AP</span>
          <span className="text-base font-semibold">Achados &amp; Perdidos</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Gestão de achados e perdidos da instituição.
          </h1>
          <p className="mt-4 text-white/80">
            Do item encontrado à devolução ao dono — registro, custódia e casos em um só lugar.
          </p>

          <ul className="mt-8 space-y-4">
            {DESTAQUES.map((d) => (
              <li key={d.titulo} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-white/70" aria-hidden="true" />
                <div>
                  <p className="font-medium">{d.titulo}</p>
                  <p className="text-sm text-white/70">{d.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-white/60">Itens encontrados, donos reencontrados.</p>

        {/* motivo decorativo sutil */}
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />
      </section>

      {/* Painel do formulário (lado direito) */}
      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          {/* marca para telas pequenas (o painel esquerdo fica oculto) */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-bold text-primary-fg">AP</span>
            <span className="text-base font-semibold text-fg">Achados &amp; Perdidos</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-fg">Entrar</h2>
          <p className="mt-1 text-sm text-muted">Acesse com suas credenciais institucionais.</p>

          {erro && (
            <div
              role="alert"
              className="mt-5 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
            >
              {erro}
            </div>
          )}

          <form onSubmit={entrar} className="mt-6 space-y-4">
            <Input
              label="E-mail"
              type="email"
              autoComplete="username"
              placeholder="voce@achados.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={erros.email}
              required
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              error={erros.senha}
              required
            />
            <div className="flex justify-end">
              <Link to="/esqueci-senha" className="text-sm text-link hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Button type="submit" loading={enviando} className="w-full">
              Entrar
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted">
            Não tem conta?{' '}
            <Link to="/cadastro" className="font-medium text-link hover:underline">Criar conta</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
