import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarRegistrador } from '../../services/registradores.js';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';

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

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe o nome.';
    if (!form.vinculo) e.vinculo = 'Selecione o vínculo.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function salvar() {
    setErroGeral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      await criarRegistrador(form);
      navigate('/registradores');
    } catch (err) {
      if (err.status === 409) {
        setErros((prev) => ({ ...prev, documento: 'Já existe um registrador com esse documento.' }));
      } else {
        setErroGeral('Não foi possível cadastrar. Tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Novo registrador</h1>
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
          <Input label="Nome" required value={form.nome} error={erros.nome} onChange={(e) => set('nome', e.target.value)} />

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

          <Input label="Matrícula / SIAPE" value={form.matricula} onChange={(e) => set('matricula', e.target.value)} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Tipo de documento"
              className="w-full"
              options={TIPOS_DOC.map((t) => ({ value: t, label: t }))}
              value={form.tipo_documento}
              onChange={(e) => set('tipo_documento', e.target.value)}
            />
            <Input label="Documento" value={form.documento} error={erros.documento} onChange={(e) => set('documento', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>

          <Input label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} />
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={salvar} loading={enviando}>Cadastrar</Button>
          <Button variant="ghost" onClick={() => navigate('/registradores')}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
