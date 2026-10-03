import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarRegistrador } from '../../services/registradores.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';

const TIPOS = ['Portaria', 'Setor', 'Segurança', 'Outro'];

export default function NovoRegistrador() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', identificacao: '', contato: '', tipo: TIPOS[0] });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe o nome.';
    if (!form.identificacao.trim()) e.identificacao = 'Informe a identificação.';
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
        setErros((prev) => ({ ...prev, identificacao: 'Esse registrador já existe.' }));
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
        <Input
          label="Identificação"
          required
          value={form.identificacao}
          error={erros.identificacao}
          onChange={(e) => set('identificacao', e.target.value)}
        />
        <Input
          label="Contato"
          value={form.contato}
          onChange={(e) => set('contato', e.target.value)}
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Tipo</span>
          <select
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900"
            value={form.tipo}
            onChange={(e) => set('tipo', e.target.value)}
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={salvar} loading={enviando}>
          Cadastrar
        </Button>
        <Button variant="secondary" onClick={() => navigate('/registradores')}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}