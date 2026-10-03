import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarItem } from '../../services/itens.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';

export default function NovoItem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    descricao: '', categoria: '', localAproximado: '', data: '', hora: '', caracteristicas: '', numeroSerie: '',
  });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  function validar() {
    const e = {};
    if (!form.descricao.trim()) e.descricao = 'Informe a descrição.';
    if (!form.categoria.trim()) e.categoria = 'Informe a categoria.';
    if (!form.localAproximado.trim()) e.localAproximado = 'Informe o local aproximado.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function salvar() {
    setErroGeral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      await criarItem(form);
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
          <Input label="Descrição" required value={form.descricao} error={erros.descricao} onChange={(e) => set('descricao', e.target.value)} />
        </div>
        <Input label="Categoria" required value={form.categoria} error={erros.categoria} onChange={(e) => set('categoria', e.target.value)} />
        <Input label="Local aproximado" required value={form.localAproximado} error={erros.localAproximado} onChange={(e) => set('localAproximado', e.target.value)} />
        <Input label="Data" type="date" value={form.data} onChange={(e) => set('data', e.target.value)} />
        <Input label="Hora" type="time" value={form.hora} onChange={(e) => set('hora', e.target.value)} />
        <div className="sm:col-span-2">
          <Input label="Características específicas" value={form.caracteristicas} onChange={(e) => set('caracteristicas', e.target.value)} />
        </div>
        <Input label="Número de série (se aplicável)" value={form.numeroSerie} onChange={(e) => set('numeroSerie', e.target.value)} />
      </div>

      <p className="mt-3 text-xs text-gray-500">O registrador é identificado automaticamente pelo sistema.</p>

      <div className="mt-6 flex gap-2">
        <Button onClick={salvar} loading={enviando}>Cadastrar</Button>
        <Button variant="secondary" onClick={() => navigate('/itens')}>Cancelar</Button>
      </div>
    </div>
  );
}