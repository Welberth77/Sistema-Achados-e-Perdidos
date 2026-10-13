import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarItem } from '../../services/itens.js';
import { listarCategorias } from '../../services/categorias.js';
import { listarRegistradores } from '../../services/registradores.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';

export default function NovoItem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    cor: '',
    marca: '',
    local_encontrado: '',
    data_encontrado: '',
    registrador_id: '',
  });
  const [categorias, setCategorias] = useState([]);
  const [registradores, setRegistradores] = useState([]);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]));
    listarRegistradores().then(setRegistradores).catch(() => setRegistradores([]));
  }, []);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  function validar() {
    const e = {};
    if (!form.titulo.trim()) e.titulo = 'Informe o título.';
    if (!form.categoria_id) e.categoria_id = 'Selecione a categoria.';
    if (!form.local_encontrado.trim()) e.local_encontrado = 'Informe o local onde foi encontrado.';
    if (!form.data_encontrado) e.data_encontrado = 'Informe a data.';
    if (!form.registrador_id) e.registrador_id = 'Selecione o registrador.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function salvar() {
    setErroGeral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      const categoria = categorias.find((c) => String(c.id) === String(form.categoria_id));
      const registrador = registradores.find((r) => String(r.id) === String(form.registrador_id));
      await criarItem({
        ...form,
        categoria_id: Number(form.categoria_id),
        registrador_id: Number(form.registrador_id),
        // objetos aninhados para exibição imediata na lista (o backend já devolve assim)
        categoria: categoria ? { id: categoria.id, nome: categoria.nome } : null,
        registrador: registrador ? { id: registrador.id, nome: registrador.nome } : null,
      });
      navigate('/itens');
    } catch {
      setErroGeral('Não foi possível cadastrar o item. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Cadastrar item</h1>

      {erroGeral && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erroGeral}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Título" required value={form.titulo} error={erros.titulo} onChange={(e) => set('titulo', e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <Input label="Descrição" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} />
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Categoria <span className="text-red-600">*</span>
          </span>
          <select
            className={`w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 ${erros.categoria_id ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`}
            value={form.categoria_id}
            onChange={(e) => set('categoria_id', e.target.value)}
          >
            <option value="">Selecione...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          {erros.categoria_id && <p className="mt-1 text-xs text-red-600">{erros.categoria_id}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Registrador <span className="text-red-600">*</span>
          </span>
          <select
            className={`w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 ${erros.registrador_id ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`}
            value={form.registrador_id}
            onChange={(e) => set('registrador_id', e.target.value)}
          >
            <option value="">Selecione...</option>
            {registradores.map((r) => (
              <option key={r.id} value={r.id}>{r.nome}</option>
            ))}
          </select>
          {erros.registrador_id && <p className="mt-1 text-xs text-red-600">{erros.registrador_id}</p>}
        </label>

        <Input label="Cor" value={form.cor} onChange={(e) => set('cor', e.target.value)} />
        <Input label="Marca" value={form.marca} onChange={(e) => set('marca', e.target.value)} />
        <Input label="Local encontrado" required value={form.local_encontrado} error={erros.local_encontrado} onChange={(e) => set('local_encontrado', e.target.value)} />
        <Input label="Data encontrado" type="date" required value={form.data_encontrado} error={erros.data_encontrado} onChange={(e) => set('data_encontrado', e.target.value)} />
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={salvar} loading={enviando}>Cadastrar</Button>
        <Button variant="secondary" onClick={() => navigate('/itens')}>Cancelar</Button>
      </div>
    </div>
  );
}
