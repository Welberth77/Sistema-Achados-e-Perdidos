import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { emailValido, emailPermitido, noMax, LIM } from '../utils/validacao.js';

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe seu nome.';
    else if (!noMax(form.nome, LIM.nome)) e.nome = `Nome muito longo (máx. ${LIM.nome}).`;
    if (!form.email.trim()) e.email = 'Informe seu e-mail.';
    else if (!emailValido(form.email)) e.email = 'E-mail inválido.';
    else if (!emailPermitido(form.email))
      e.email = 'Use um e-mail de um provedor válido (ex.: @gmail.com, @hotmail.com, @outlook.com).';
    else if (!noMax(form.email, LIM.email)) e.email = `E-mail muito longo (máx. ${LIM.email}).`;
    if (form.senha.length < 6) e.senha = 'A senha deve ter ao menos 6 caracteres.';
    else if (!noMax(form.senha, LIM.senha)) e.senha = `Senha muito longa (máx. ${LIM.senha}).`;
    if (form.confirmar !== form.senha) e.confirmar = 'As senhas não coincidem.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    setErroGeral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      await api.post('/auth/registrar', {
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
      });
      setOk(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setErros((prev) => ({ ...prev, email: 'Já existe uma conta com este e-mail.' }));
      } else if (status === 400) {
        setErroGeral(err.response?.data?.error || 'Verifique os dados informados.');
      } else {
        setErroGeral('Não foi possível criar a conta. Verifique se o servidor está no ar.');
      }
    } finally {
      setEnviando(false);
    }
  }

  if (ok) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-bg px-4">
      <ThemeToggle className="absolute right-4 top-4 z-20" />
        <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 text-center">
          <h1 className="text-xl font-semibold text-fg">Conta criada</h1>
          <p className="mt-2 text-sm text-muted">
            Agora você já pode entrar e registrar um relato de perda.
          </p>
          <Button className="mt-5 w-full" onClick={() => navigate('/login')}>
            Ir para o login
          </Button>
        </div>
      </div>
    );
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

        <h1 className="text-2xl font-semibold tracking-tight text-fg">Criar conta</h1>
        <p className="mt-1 text-sm text-muted">Para relatar perdas e acompanhar seus relatos.</p>

        {erroGeral && (
          <div
            role="alert"
            className="mt-5 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
          >
            {erroGeral}
          </div>
        )}

        <form onSubmit={enviar} className="mt-6 space-y-4">
          <Input label="Nome" value={form.nome} error={erros.nome} onChange={(e) => set('nome', e.target.value)} maxLength={LIM.nome} required />
          <Input label="E-mail" type="email" autoComplete="email" value={form.email} error={erros.email} hint="Use um provedor conhecido (gmail, hotmail, outlook…)." onChange={(e) => set('email', e.target.value)} maxLength={LIM.email} required />
          <Input label="Senha" type="password" autoComplete="new-password" value={form.senha} error={erros.senha} onChange={(e) => set('senha', e.target.value)} maxLength={LIM.senha} required />
          <Input label="Confirmar senha" type="password" autoComplete="new-password" value={form.confirmar} error={erros.confirmar} onChange={(e) => set('confirmar', e.target.value)} maxLength={LIM.senha} required />
          <Button type="submit" loading={enviando} className="w-full">Criar conta</Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-link hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
