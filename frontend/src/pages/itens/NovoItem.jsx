import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarItem, atualizarItem, obterItem } from '../../services/itens.js';
import { listarCategorias } from '../../services/categorias.js';
import { listarRegistradores } from '../../services/registradores.js';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';
import { noMax, dataPlausivel, hojeISO, LIM } from '../../utils/validacao.js';

export default function NovoItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = Boolean(id);

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
  const [carregando, setCarregando] = useState(editando);

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]));
    listarRegistradores().then(setRegistradores).catch(() => setRegistradores([]));
  }, []);

  useEffect(() => {
    if (!editando) return;
    obterItem(id)
      .then((it) =>
        setForm({
          titulo: it.titulo || '',
          descricao: it.descricao || '',
          categoria_id: it.categoria_id != null ? String(it.categoria_id) : '',
          cor: it.cor || '',
          marca: it.marca || '',
          local_encontrado: it.local_encontrado || '',
          data_encontrado: (it.data_encontrado || '').toString().slice(0, 10),
          registrador_id: it.registrador_id != null ? String(it.registrador_id) : '',
        })
      )
      .catch(() => setErroGeral('Não foi possível carregar o item.'))
      .finally(() => setCarregando(false));
  }, [id, editando]);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  function validar() {
    const e = {};
    if (!form.titulo.trim()) e.titulo = 'Informe o título.';
    else if (!noMax(form.titulo, LIM.titulo)) e.titulo = `Máximo de ${LIM.titulo} caracteres.`;
    if (!noMax(form.descricao, LIM.descricao)) e.descricao = `Máximo de ${LIM.descricao} caracteres.`;
    if (!noMax(form.cor, LIM.cor)) e.cor = `Máximo de ${LIM.cor} caracteres.`;
    if (!noMax(form.marca, LIM.marca)) e.marca = `Máximo de ${LIM.marca} caracteres.`;
    if (!form.categoria_id) e.categoria_id = 'Selecione a categoria.';
    if (!form.local_encontrado.trim()) e.local_encontrado = 'Informe o local onde foi encontrado.';
    else if (!noMax(form.local_encontrado, LIM.local)) e.local_encontrado = `Máximo de ${LIM.local} caracteres.`;
    if (!form.data_encontrado) e.data_encontrado = 'Informe a data.';
    else if (!dataPlausivel(form.data_encontrado)) e.data_encontrado = 'Data inválida (não pode ser futura).';
    if (!form.registrador_id) e.registrador_id = 'Selecione o registrador.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function salvar() {
    setErroGeral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      const payload = {
        ...form,
        categoria_id: Number(form.categoria_id),
        registrador_id: Number(form.registrador_id),
      };
      if (editando) await atualizarItem(id, payload);
      else await criarItem(payload);
      navigate('/itens');
    } catch {
      setErroGeral('Não foi possível salvar o item. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <p className="text-muted">Carregando…</p>;

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {editando ? 'Editar item' : 'Cadastrar item'}
        </h1>
        <p className="mt-1 text-sm text-muted">Registre um item achado no sistema.</p>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Título" required value={form.titulo} error={erros.titulo} maxLength={LIM.titulo} onChange={(e) => set('titulo', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Descrição" value={form.descricao} error={erros.descricao} maxLength={LIM.descricao} onChange={(e) => set('descricao', e.target.value)} />
          </div>

          <Select
            label="Categoria"
            required
            className="w-full"
            error={erros.categoria_id}
            value={form.categoria_id}
            onChange={(e) => set('categoria_id', e.target.value)}
          >
            <option value="">Selecione…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </Select>

          <Select
            label="Registrador"
            required
            className="w-full"
            error={erros.registrador_id}
            value={form.registrador_id}
            onChange={(e) => set('registrador_id', e.target.value)}
          >
            <option value="">Selecione…</option>
            {registradores.map((r) => (
              <option key={r.id} value={r.id}>{r.nome}</option>
            ))}
          </Select>

          <Input label="Cor" value={form.cor} error={erros.cor} maxLength={LIM.cor} onChange={(e) => set('cor', e.target.value)} />
          <Input label="Marca" value={form.marca} error={erros.marca} maxLength={LIM.marca} onChange={(e) => set('marca', e.target.value)} />
          <Input label="Local encontrado" required value={form.local_encontrado} error={erros.local_encontrado} maxLength={LIM.local} onChange={(e) => set('local_encontrado', e.target.value)} />
          <Input label="Data encontrado" type="date" required value={form.data_encontrado} error={erros.data_encontrado} max={hojeISO()} onChange={(e) => set('data_encontrado', e.target.value)} />
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={salvar} loading={enviando}>{editando ? 'Salvar' : 'Cadastrar'}</Button>
          <Button variant="ghost" onClick={() => navigate('/itens')}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
