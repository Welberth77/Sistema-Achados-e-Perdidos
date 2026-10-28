import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obterRelato, atualizarRelato } from '../../services/relatos.js';
import { listarCategorias } from '../../services/categorias.js';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';
import { noMax, dataPlausivel, hojeISO, LIM } from '../../utils/validacao.js';

const STATUS = [
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'CORRESPONDENCIA', label: 'Correspondência' },
  { value: 'ENCERRADO', label: 'Encerrado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export default function EditarRelato() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    cor: '',
    marca: '',
    local_perda: '',
    data_perda: '',
    status: 'ABERTO',
  });
  const [categorias, setCategorias] = useState([]);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    obterRelato(id)
      .then((r) =>
        setForm({
          titulo: r.titulo || '',
          descricao: r.descricao || '',
          categoria_id: r.categoria_id != null ? String(r.categoria_id) : '',
          cor: r.cor || '',
          marca: r.marca || '',
          local_perda: r.local_perda || '',
          data_perda: (r.data_perda || '').toString().slice(0, 10),
          status: r.status || 'ABERTO',
        })
      )
      .catch(() => setErroGeral('Não foi possível carregar o relato.'))
      .finally(() => setCarregando(false));
  }, [id]);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  function validar() {
    const e = {};
    if (!form.titulo.trim()) e.titulo = 'Informe o título.';
    else if (!noMax(form.titulo, LIM.titulo)) e.titulo = `Máximo de ${LIM.titulo} caracteres.`;
    if (!noMax(form.descricao, LIM.descricao)) e.descricao = `Máximo de ${LIM.descricao} caracteres.`;
    if (!noMax(form.cor, LIM.cor)) e.cor = `Máximo de ${LIM.cor} caracteres.`;
    if (!noMax(form.marca, LIM.marca)) e.marca = `Máximo de ${LIM.marca} caracteres.`;
    if (!noMax(form.local_perda, LIM.local)) e.local_perda = `Máximo de ${LIM.local} caracteres.`;
    if (!dataPlausivel(form.data_perda)) e.data_perda = 'Data inválida (não pode ser futura).';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function salvar() {
    setErroGeral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      await atualizarRelato(id, {
        ...form,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      });
      navigate(`/relatos/${id}`);
    } catch {
      setErroGeral('Não foi possível salvar o relato. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <p className="text-muted">Carregando…</p>;

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Editar relato</h1>
        <p className="mt-1 text-sm text-muted">Atualize os dados ou o status do relato de perda.</p>
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
            className="w-full"
            value={form.categoria_id}
            onChange={(e) => set('categoria_id', e.target.value)}
          >
            <option value="">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </Select>

          <Select
            label="Status"
            className="w-full"
            options={STATUS}
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
          />

          <Input label="Cor" value={form.cor} error={erros.cor} maxLength={LIM.cor} onChange={(e) => set('cor', e.target.value)} />
          <Input label="Marca" value={form.marca} error={erros.marca} maxLength={LIM.marca} onChange={(e) => set('marca', e.target.value)} />
          <Input label="Local da perda" value={form.local_perda} error={erros.local_perda} maxLength={LIM.local} onChange={(e) => set('local_perda', e.target.value)} />
          <Input label="Data da perda" type="date" value={form.data_perda} error={erros.data_perda} max={hojeISO()} onChange={(e) => set('data_perda', e.target.value)} />
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={salvar} loading={enviando}>Salvar</Button>
          <Button variant="ghost" onClick={() => navigate(`/relatos/${id}`)}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
