import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarRegistrador } from '../../services/registradores.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';

// enums do banco
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
    <div className="max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">Novo registrador</h1>

      {erroGeral && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erroGeral}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Nome"
          required
          value={form.nome}
          error={erros.nome}
          onChange={(e) => set('nome', e.target.value)}
        />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Vínculo <span className="text-red-600">*</span>
          </span>
          <select
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900"
            value={form.vinculo}
            onChange={(e) => set('vinculo', e.target.value)}
          >
            {VINCULOS.map((v) => (
              <option key={v} value={v}>{VINCULO_LABEL[v]}</option>
            ))}
          </select>
        </label>

        <Input
          label="Matrícula / SIAPE"
          value={form.matricula}
          onChange={(e) => set('matricula', e.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Tipo de documento</span>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900"
              value={form.tipo_documento}
              onChange={(e) => set('tipo_documento', e.target.value)}
            >
              {TIPOS_DOC.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <Input
            label="Documento"
            value={form.documento}
            error={erros.documento}
            onChange={(e) => set('documento', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Telefone"
            value={form.telefone}
            onChange={(e) => set('telefone', e.target.value)}
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>

        <Input
          label="Observações"
          value={form.observacoes}
          onChange={(e) => set('observacoes', e.target.value)}
        />
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={salvar} loading={enviando}>Cadastrar</Button>
        <Button variant="secondary" onClick={() => navigate('/registradores')}>Cancelar</Button>
      </div>
    </div>
  );
}
