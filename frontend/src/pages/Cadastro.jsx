import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Button from '../components/Button.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import {
  emailValido, telefoneValido, documentoValido, noMax, LIM, formatarCpf, formatarTelefone,
} from '../utils/validacao.js';

const TIPOS_DOC = ['CPF', 'RG', 'OUTRO'];

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', confirmar: '',
    tipoConta: 'COMUM',
    matricula: '', tipo_documento: 'CPF', documento: '', telefone: '', observacoes: '',
  });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [pediuRegistrador, setPediuRegistrador] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const ehRegistrador = form.tipoConta === 'REGISTRADOR';

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe seu nome.';
    else if (!noMax(form.nome, LIM.nome)) e.nome = `Nome muito longo (máx. ${LIM.nome}).`;
    if (!form.email.trim()) e.email = 'Informe seu e-mail.';
    else if (!emailValido(form.email)) e.email = 'E-mail inválido.';
    else if (!noMax(form.email, LIM.email)) e.email = `E-mail muito longo (máx. ${LIM.email}).`;
    if (form.senha.length < 6) e.senha = 'A senha deve ter ao menos 6 caracteres.';
    else if (!noMax(form.senha, LIM.senha)) e.senha = `Senha muito longa (máx. ${LIM.senha}).`;
    if (form.confirmar !== form.senha) e.confirmar = 'As senhas não coincidem.';

    if (ehRegistrador) {
      if (!documentoValido(form.tipo_documento, form.documento)) {
        e.documento = form.tipo_documento === 'CPF' ? 'CPF inválido.' : 'Documento inválido.';
      } else if (!noMax(form.documento, LIM.documento)) {
        e.documento = `Máximo de ${LIM.documento} caracteres.`;
      }
      if (!telefoneValido(form.telefone)) e.telefone = 'Telefone inválido (inclua o DDD).';
      if (!noMax(form.matricula, LIM.matricula)) e.matricula = `Máximo de ${LIM.matricula} caracteres.`;
      if (!noMax(form.observacoes, LIM.observacoes)) e.observacoes = `Máximo de ${LIM.observacoes} caracteres.`;
    }
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    setErroGeral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        tipoConta: form.tipoConta,
      };
      if (ehRegistrador) {
        payload.registrador = {
          vinculo: 'SERVIDOR',
          matricula: form.matricula.trim() || null,
          tipo_documento: form.tipo_documento,
          documento: form.documento.trim() || null,
          telefone: form.telefone.trim() || null,
          observacoes: form.observacoes.trim() || null,
        };
      }
      const { data } = await api.post('/auth/registrar', payload);
      setPediuRegistrador(Boolean(data?.solicitacao));
      setOk(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) setErros((prev) => ({ ...prev, email: 'Já existe uma conta com este e-mail.' }));
      else if (status === 400) setErroGeral(err.response?.data?.error || 'Verifique os dados informados.');
      else setErroGeral('Não foi possível criar a conta. Verifique se o servidor está no ar.');
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
            {pediuRegistrador
              ? 'Sua solicitação para ser registrador está em análise. Por enquanto você entra como usuário comum; quando um administrador aprovar, você passa a ter acesso de servidor.'
              : 'Agora você já pode entrar e registrar um relato de perda.'}
          </p>
          <Button className="mt-5 w-full" onClick={() => navigate('/login')}>Ir para o login</Button>
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
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-fg">AP</span>
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
          <Input label="Nome" value={form.nome} error={erros.nome} maxLength={LIM.nome} onChange={(e) => set('nome', e.target.value)} required />
          <Input label="E-mail" type="email" autoComplete="email" value={form.email} error={erros.email} maxLength={LIM.email} onChange={(e) => set('email', e.target.value)} required />
          <Input label="Senha" type="password" autoComplete="new-password" value={form.senha} error={erros.senha} maxLength={LIM.senha} onChange={(e) => set('senha', e.target.value)} required />
          <Input label="Confirmar senha" type="password" autoComplete="new-password" value={form.confirmar} error={erros.confirmar} maxLength={LIM.senha} onChange={(e) => set('confirmar', e.target.value)} required />

          <Select
            label="Tipo de conta"
            className="w-full"
            value={form.tipoConta}
            onChange={(e) => set('tipoConta', e.target.value)}
            options={[
              { value: 'COMUM', label: 'Usuário comum' },
              { value: 'REGISTRADOR', label: 'Quero ser registrador (equipe)' },
            ]}
          />

          {ehRegistrador && (
            <div className="space-y-4 rounded-md border border-border bg-surface-2/40 p-4">
              <p className="text-xs text-muted">
                Preencha seus dados. Sua solicitação ficará pendente até um administrador aprovar.
              </p>
              <Input label="Matrícula / SIAPE" value={form.matricula} error={erros.matricula} maxLength={LIM.matricula} onChange={(e) => set('matricula', e.target.value)} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Tipo de documento"
                  className="w-full"
                  options={TIPOS_DOC.map((t) => ({ value: t, label: t }))}
                  value={form.tipo_documento}
                  onChange={(e) =>
                    setForm((f) => {
                      const tipo = e.target.value;
                      return { ...f, tipo_documento: tipo, documento: tipo === 'CPF' ? formatarCpf(f.documento) : f.documento };
                    })
                  }
                />
                <Input
                  label="Documento"
                  value={form.documento}
                  error={erros.documento}
                  maxLength={LIM.documento}
                  inputMode={form.tipo_documento === 'CPF' ? 'numeric' : 'text'}
                  placeholder={form.tipo_documento === 'CPF' ? '000.000.000-00' : ''}
                  onChange={(e) => set('documento', form.tipo_documento === 'CPF' ? formatarCpf(e.target.value) : e.target.value)}
                />
              </div>
              <Input
                label="Telefone"
                value={form.telefone}
                error={erros.telefone}
                maxLength={LIM.telefone}
                inputMode="tel"
                placeholder="(85) 99999-0000"
                onChange={(e) => set('telefone', formatarTelefone(e.target.value))}
              />
              <Input label="Observações" value={form.observacoes} error={erros.observacoes} maxLength={LIM.observacoes} onChange={(e) => set('observacoes', e.target.value)} />
            </div>
          )}

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
