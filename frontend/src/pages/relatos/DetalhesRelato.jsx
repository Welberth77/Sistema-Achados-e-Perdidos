import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterRelato, listarCorrespondenciasRelato } from '../../services/relatos.js';
import { criarCaso } from '../../services/casos.js';
import { listarItens } from '../../services/itens.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import { noMax, LIM } from '../../utils/validacao.js';

function Linha({ rotulo, valor }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 last:border-0 sm:flex-row sm:gap-3">
      <span className="w-44 shrink-0 text-sm font-medium text-muted">{rotulo}</span>
      <span className="text-sm text-fg">{valor || '—'}</span>
    </div>
  );
}

export default function DetalhesRelato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [relato, setRelato] = useState(null);
  const [correspondencias, setCorrespondencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCorresp, setLoadingCorresp] = useState(true);
  const [erro, setErro] = useState('');

  // Modal "Abrir caso"
  const [modalAberto, setModalAberto] = useState(false);
  const [itens, setItens] = useState([]);
  const [casoForm, setCasoForm] = useState({ item_achado_id: '', descricao: '' });
  const [casoErros, setCasoErros] = useState({});
  const [abrindo, setAbrindo] = useState(false);
  const [erroCaso, setErroCaso] = useState('');

  useEffect(() => {
    setLoading(true);
    obterRelato(id)
      .then(setRelato)
      .catch(() => setErro('Relato não encontrado.'))
      .finally(() => setLoading(false));

    setLoadingCorresp(true);
    listarCorrespondenciasRelato(id)
      .then(setCorrespondencias)
      .catch(() => setCorrespondencias([]))
      .finally(() => setLoadingCorresp(false));
  }, [id]);

  function abrirModal() {
    setCasoForm({ item_achado_id: '', descricao: '' });
    setCasoErros({});
    setErroCaso('');
    setModalAberto(true);
    // itens disponíveis para vincular (não devolvidos/descartados)
    listarItens()
      .then((lista) => {
        const arr = Array.isArray(lista) ? lista : [];
        setItens(arr.filter((i) => i.status !== 'DEVOLVIDO' && i.status !== 'DESCARTADO'));
      })
      .catch(() => setItens([]));
  }

  const setCaso = (campo, valor) => setCasoForm((f) => ({ ...f, [campo]: valor }));

  async function abrirCaso() {
    setErroCaso('');
    const e = {};
    if (!casoForm.item_achado_id) e.item_achado_id = 'Selecione o item achado.';
    if (!noMax(casoForm.descricao, LIM.descricao)) e.descricao = `Máximo de ${LIM.descricao} caracteres.`;
    setCasoErros(e);
    if (Object.keys(e).length) return;

    setAbrindo(true);
    try {
      const novo = await criarCaso({
        item_achado_id: casoForm.item_achado_id,
        relato_perda_id: id,
        descricao: casoForm.descricao.trim(),
      });
      navigate(`/casos/${novo.id}`);
    } catch (err) {
      setErroCaso(err.response?.data?.error || 'Não foi possível abrir o caso.');
    } finally {
      setAbrindo(false);
    }
  }

  if (loading) return <p className="text-muted">Carregando…</p>;
  if (erro)
    return (
      <div>
        <p className="mb-4 text-rose-600 dark:text-rose-400">{erro}</p>
        <Button variant="outline" onClick={() => navigate('/relatos')}>Voltar</Button>
      </div>
    );

  const colunasCorresp = [
    { key: 'item', header: 'Item achado', render: (row) => (row.item ? `${row.item.codigo} — ${row.item.titulo}` : '—') },
    { key: 'pontuacao', header: 'Similaridade', render: (row) => (row.pontuacao != null ? `${row.pontuacao}%` : '—'), className: 'tabular-nums' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  const podeAbrirCaso = relato.status !== 'ENCERRADO' && relato.status !== 'CANCELADO';

  return (
    <div className="max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{relato.titulo}</h1>
        <StatusBadge status={relato.status} />
      </div>

      <section className="mb-5 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Dados do relato</h2>
        <Linha rotulo="Código" valor={relato.codigo} />
        <Linha rotulo="Categoria" valor={relato.categoria?.nome} />
        <Linha rotulo="Descrição" valor={relato.descricao} />
        <Linha rotulo="Cor" valor={relato.cor} />
        <Linha rotulo="Marca" valor={relato.marca} />
        <Linha rotulo="Local da perda" valor={relato.local_perda} />
        <Linha rotulo="Data da perda" valor={relato.data_perda} />
        <Linha rotulo="Registrador" valor={relato.registrador?.nome} />
      </section>

      <section className="mb-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Correspondências sugeridas</h2>
        <Table
          columns={colunasCorresp}
          data={correspondencias}
          loading={loadingCorresp}
          emptyMessage="Nenhuma correspondência sugerida para este relato."
          onRowClick={(row) => row.item && navigate(`/itens/${row.item_achado_id}`)}
        />
      </section>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate('/relatos')}>Voltar</Button>
        {podeAbrirCaso && <Button onClick={abrirModal}>Abrir caso</Button>}
      </div>

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Abrir caso"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button onClick={abrirCaso} loading={abrindo}>Abrir caso</Button>
          </>
        }
      >
        {erroCaso && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
          >
            {erroCaso}
          </div>
        )}
        <p className="mb-4 text-sm text-muted">
          Vincule o item achado que corresponde a este relato ({relato.codigo}).
        </p>
        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Item achado"
            required
            className="w-full"
            error={casoErros.item_achado_id}
            value={casoForm.item_achado_id}
            onChange={(e) => setCaso('item_achado_id', e.target.value)}
          >
            <option value="">Selecione o item…</option>
            {itens.map((i) => (
              <option key={i.id} value={i.id}>
                {i.codigo} — {i.titulo}
              </option>
            ))}
          </Select>
          <Input
            label="Descrição"
            value={casoForm.descricao}
            error={casoErros.descricao}
            maxLength={LIM.descricao}
            onChange={(e) => setCaso('descricao', e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
