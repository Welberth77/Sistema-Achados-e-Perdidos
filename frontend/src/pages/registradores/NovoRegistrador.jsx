import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarRegistrador, atualizarRegistrador, obterRegistrador } from '../../services/registradores.js';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';
import { emailValido, telefoneValido, documentoValido, noMax, LIM, formatarCpf, formatarTelefone } from '../../utils/validacao.js';

const VINCULOS = ['ALUNO', 'DOCENTE', 'TERCEIRIZADO', 'SERVIDOR', 'OUTRO'];
const VINCULO_LABEL = {
  ALUNO: 'Aluno',
  DOCENTE: 'Docente',
  TERCEIRIZADO: 'Terceirizado',
  SERVIDOR: 'Servidor',
  OUTRO: 'Outro',
};
const TIPOS_DOC = ['CPF', 'RG', 'OUTRO'];

export default function NovoRegistrador() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = Boolean(id);

  const [form, setForm] = useState({
    nome: '',
    vinculo: VINCULOS[0],
    matricula: '',
    tipo_documento: TIPOS_DOC[0],
    documento: '',
    telefone: '',
    email: '',
    observacoes: '',
  });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(editando);

  useEffect(() => {
    if (!editando) return;
    obterRegistrador(id)
      .then((r) =>
        setForm({
          nome: r.nome || '',
          vinculo: r.vinculo || VINCULOS[0],
          matricula: r.matricula || '',
          tipo_documento: r.tipo_documento || TIPOS_DOC[0],
          documento: r.documento || '',
          telefone: r.telefone || '',
          email: r.email || '',
          observacoes: r.observacoes || '',
        })
      )
      .catch(() => setErroGeral('Não foi possível carregar o registrador.'))
      .finally(() => setCarregando(false));
  }, [id, editando]);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe o nome.';
    else if (!noMax(form.nome, LIM.nome)) e.nome = `Máximo de ${LIM.nome} caracteres.`;
    if (!form.vinculo) e.vinculo = 'Selecione o vínculo.';
    if (!noMax(form.matricula, LIM.matricula)) e.matricula = `Máximo de ${LIM.matricula} caracteres.`;
    if (!documentoValido(form.tipo_documento, form.documento)) {
      e.documento = form.tipo_documento === 'CPF' ? 'CPF inválido.' : 'Documento inválido.';
    } else if (!noMax(form.documento, LIM.documento)) {
      e.documento = `Máximo de ${LIM.documento} caracteres.`;
    }
    if (!telefoneValido(form.telefone)) e.telefone = 'Telefone inválido (inclua o DDD).';
    else if (!noMax(form.telefone, LIM.telefone)) e.telefone = `Máximo de ${LIM.telefone} caracteres.`;
    if (form.email.trim() && !emailValido(form.email)) e.email = 'E-mail inválido.';
    else if (!noMax(form.email, LIM.email)) e.email = `Máximo de ${LIM.email} caracteres.`;
    if (!noMax(form.observacoes, LIM.observacoes)) e.observacoes = `Máximo de ${LIM.observacoes} caracteres.`;
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function salvar() {
    setErroGeral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      if (editando) await atualizarRegistrador(id, form);
      else await criarRegistrador(form);
      navigate('/registradores');
    } catch (err) {
      const status = err.response?.status ?? err.status;
      if (status === 409) {
        setErros((prev) => ({ ...prev, documento: 'Já existe um registrador com esse documento.' }));
      } else {
        setErroGeral('Não foi possível salvar. Tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <p className="text-muted">Carregando…</p>;

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {editando ? 'Editar registrador' : 'Novo registrador'}
        </h1>
        <p className="mt-1 text-sm text-muted">Cadastre uma pessoa autorizada a registrar itens e relatos.</p>
      </div>

      {erroGeral && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
        >
          {erroGeral}
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="space-y-4">
          <Input label="Nome" required value={form.nome} error={erros.nome} maxLength={LIM.nome} onChange={(e) => set('nome', e.target.value)} />

          <Select
            label="Vínculo"
            required
            className="w-full"
            error={erros.vinculo}
            value={form.vinculo}
            onChange={(e) => set('vinculo', e.target.value)}
          >
            {VINCULOS.map((v) => (
              <option key={v} value={v}>{VINCULO_LABEL[v]}</option>
            ))}
          </Select>

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
            <Input label="Documento" value={form.documento} error={erros.documento} maxLength={LIM.documento} inputMode={form.tipo_documento === 'CPF' ? 'numeric' : 'text'} placeholder={form.tipo_documento === 'CPF' ? '000.000.000-00' : ''} onChange={(e) => set('documento', form.tipo_documento === 'CPF' ? formatarCpf(e.target.value) : e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Telefone" value={form.telefone} error={erros.telefone} maxLength={LIM.telefone} inputMode="tel" placeholder="(85) 99999-0000" onChange={(e) => set('telefone', formatarTelefone(e.target.value))} />
            <Input label="E-mail" type="email" value={form.email} error={erros.email} maxLength={LIM.email} onChange={(e) => set('email', e.target.value)} />
          </div>

          <Input label="Observações" value={form.observacoes} error={erros.observacoes} maxLength={LIM.observacoes} onChange={(e) => set('observacoes', e.target.value)} />
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={salvar} loading={enviando}>{editando ? 'Salvar' : 'Cadastrar'}</Button>
          <Button variant="ghost" onClick={() => navigate('/registradores')}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
