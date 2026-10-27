import { useState } from 'react';
import { Link } from 'react-router-dom';
import { emailValido, LIM } from '../utils/validacao.js';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    if (!email.trim()) {
      setErro('Informe seu e-mail.');
      return;
    }
    if (!emailValido(email)) {
      setErro('E-mail inválido.');
      return;
    }
    setEnviando(true);
    try {
      // TODO: integrar com POST /api/auth/esqueci-senha quando o backend oferecer recuperação de senha.
      await new Promise((r) => setTimeout(r, 500));
      setOk(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <ThemeToggle className="absolute right-4 top-4 z-20" />
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-fg">
            AP
          </span>
          <span className="text-base font-semibold text-fg">Achados &amp; Perdidos</span>
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-fg">Recuperar senha</h1>
        <p className="mt-1 text-sm text-muted">
          Informe seu e-mail e enviaremos instruções para redefinir a senha.
        </p>

        {ok ? (
          <div
            role="status"
            className="mt-6 rounded-md border border-border bg-surface p-4 text-sm text-muted"
          >
            Se houver uma conta associada a <span className="font-medium text-fg">{email.trim()}</span>,
            enviamos as instruções de recuperação. Verifique seu e-mail.
          </div>
        ) : (
          <>
            {erro && (
              <div
                role="alert"
                className="mt-5 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
              >
                {erro}
              </div>
            )}
            <form onSubmit={enviar} className="mt-6 space-y-4">
              <Input
                label="E-mail"
                type="email"
                autoComplete="email"
                placeholder="voce@achados.local"
                maxLength={LIM.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" loading={enviando} className="w-full">
                Enviar instruções
              </Button>
            </form>
          </>
        )}

        <p className="mt-4 text-center text-sm text-muted">
          <Link to="/login" className="font-medium text-link hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
