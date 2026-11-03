import { useEffect, useState } from 'react';
import { listarCategorias, criarCategoria, atualizarCategoria, excluirCategoria } from '../../services/categorias.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

const VAZIO = { id: null, nome: '', descricao: '' };

export default function Categorias() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroAcao, setErroAcao] = useState('');

  const [form, setForm] = useState(VAZIO);
  const [modalAberto, setModalAberto] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  function carregar() {
    setLoading(true);
    listarCategorias()
      .then(setDados)
      .catch(() => setErroAcao('Não foi possível carregar as categorias.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNova() {
    setForm(VAZIO);
    setErroForm('');
    setModalAberto(true);
  }

  function abrirEdicao(row) {
    setForm({ id: row.id, nome: row.nome || '', descricao: row.descricao || '' });
    setErroForm('');
    setModalAberto(true);
  }

  async function salvar() {
    setErroForm('');
    if (!form.nome.trim()) {
      setErroForm('Informe o nome da categoria.');
      return;
    }
    setSalvando(true);
    try {
      const payload = { nome: form.nome.trim(), descricao: form.descricao.trim() || null };
      if (form.id) await atualizarCategoria(form.id, payload);
      else await criarCategoria(payload);
      setModalAberto(false);
      carregar();
    } catch (e) {
      setErroForm(e.response?.data?.error || 'Não foi possível salvar a categoria.');
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setErroAcao('');
    setExcluindo(true);
    try {
      await excluirCategoria(paraExcluir.id);
      setParaExcluir(null);
      carregar();
    } catch (e) {
      setErroAcao(e.response?.data?.error || 'Não foi possível excluir a categoria.');
      setParaExcluir(null);
    } finally {
      setExcluindo(false);
    }
  }

  const colunas = [
    { key: 'nome', header: 'Nome', className: 'font-medium' },
    { key: 'descricao', header: 'Descrição', render: (row) => row.descricao || '—' },
    {
      key: 'acoes',
      header: 'Ações',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => abrirEdicao(row)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => setParaExcluir(row)}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Categorias</h1>
          <p className="mt-1 text-sm text-muted">Categorias usadas para classificar itens e relatos.</p>
        </div>
        <Button onClick={abrirNova}>Nova categoria</Button>
      </div>

      {erroAcao && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erroAcao}
        </div>
      )}

      <Table columns={colunas} data={dados} loading={loading} emptyMessage="Nenhuma categoria cadastrada." />

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title={form.id ? 'Editar categoria' : 'Nova categoria'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button onClick={salvar} loading={salvando}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          {erroForm && (
            <div role="alert" className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
              {erroForm}
            </div>
          )}
          <Input
            label="Nome"
            required
            value={form.nome}
            maxLength={80}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          />
          <Input
            label="Descrição"
            value={form.descricao}
            maxLength={200}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!paraExcluir}
        onClose={() => setParaExcluir(null)}
        onConfirm={confirmarExclusao}
        loading={excluindo}
        title="Excluir categoria"
        mensagem={`Excluir a categoria "${paraExcluir?.nome ?? ''}"? Os itens/relatos dessa categoria ficarão sem categoria.`}
      />
    </div>
  );
}
