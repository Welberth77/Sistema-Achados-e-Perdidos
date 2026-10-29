import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterItem } from '../../services/itens.js';
import { registrarCustodia } from '../../services/custodia.js';
import { criarCaso } from '../../services/casos.js';
import { listarRelatos } from '../../services/relatos.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { dataBR } from '../../utils/formato.js';
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

const TIPO_CUSTODIA = { ENTRADA: 'Entrada', TRANSFERENCIA: 'Transferência', SAIDA: 'Saída' };

function formatarData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR');
}

export default function DetalhesItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Modal de registrar custódia
  const [modalAberto, setModalAberto] = useState(false);
  const [custForm, setCustForm] = useState({ tipo: 'ENTRADA', local_guarda: '', observacoes: '' });
  const [custErros, setCustErros] = useState({});
  const [custEnviando, setCustEnviando] = useState(false);
  const [custErroGeral, setCustErroGeral] = useState('');

  // Modal de abrir caso
  const [modalCaso, setModalCaso] = useState(false);
  const [relatos, setRelatos] = useState([]);
  const [casoForm, setCasoForm] = useState({ relato_perda_id: '', descricao: '' });
  const [abrindoCaso, setAbrindoCaso] = useState(false);
  const [erroCaso, setErroCaso] = useState('');

  function carregar() {
    setLoading(true);
    obterItem(id)
      .then(setItem)
      .catch(() => setErro('Item não encontrado.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function abrirModal() {
    setCustForm({ tipo: 'ENTRADA', local_guarda: '', observacoes: '' });
    setCustErros({});
    setCustErroGeral('');
    setModalAberto(true);
  }

  const setCust = (campo, valor) => setCustForm((f) => ({ ...f, [campo]: valor }));

  async function salvarCustodia() {
    setCustErroGeral('');
    const e = {};
    if (!custForm.local_guarda.trim()) e.local_guarda = 'Informe o local de guarda.';
    else if (!noMax(custForm.local_guarda, LIM.local)) e.local_guarda = `Máximo de ${LIM.local} caracteres.`;
    if (!noMax(custForm.observacoes, LIM.observacoes)) e.observacoes = `Máximo de ${LIM.observacoes} caracteres.`;
    setCustErros(e);
    if (Object.keys(e).length) return;

    setCustEnviando(true);
    try {
      await registrarCustodia({
        item_id: id,
        tipo: custForm.tipo,
        local_guarda: custForm.local_guarda.trim(),
        observacoes: custForm.observacoes.trim(),
      });
      setModalAberto(false);
      carregar();
    } catch (err) {
      setCustErroGeral(err.response?.data?.error || 'Não foi possível registrar a custódia.');
    } finally {
      setCustEnviando(false);
    }
  }

  function abrirModalCaso() {
    setCasoForm({ relato_perda_id: '', descricao: '' });
    setErroCaso('');
    setModalCaso(true);
    listarRelatos({})
      .then((lista) => setRelatos(Array.isArray(lista) ? lista : []))
      .catch(() => setRelatos([]));
  }

  async function abrirCaso() {
    setErroCaso('');
    setAbrindoCaso(true);
    try {
      const novo = await criarCaso({
        item_achado_id: id,
        relato_perda_id: casoForm.relato_perda_id || null,
        descricao: casoForm.descricao.trim() || undefined,
      });
      navigate(`/casos/${novo.id}`);
    } catch (err) {
      setErroCaso(err.response?.data?.error || 'Não foi possível abrir o caso.');
    } finally {
      setAbrindoCaso(false);
    }
  }

  if (loading) return <p className="text-muted">Carregando…</p>;
  if (erro)
    return (
      <div>
        <p className="mb-4 text-rose-600 dark:text-rose-400">{erro}</p>
        <Button variant="outline" onClick={() => navigate('/itens')}>Voltar</Button>
      </div>
    );

  const custodias = item.custodias || [];
  const atual = custodias[0];
  const ativo = item.status !== 'DEVOLVIDO' && item.status !== 'DESCARTADO';

  return (
    <div className="max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{item.titulo}</h1>
        <StatusBadge status={item.status} />
      </div>

      <section className="mb-5 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Dados do item</h2>
        <Linha rotulo="Código" valor={item.codigo} />
        <Linha rotulo="Categoria" valor={item.categoria?.nome} />
        <Linha rotulo="Descrição" valor={item.descricao} />
        <Linha rotulo="Cor" valor={item.cor} />
        <Linha rotulo="Marca" valor={item.marca} />
        <Linha rotulo="Local encontrado" valor={item.local_encontrado} />
        <Linha rotulo="Data encontrado" valor={dataBR(item.data_encontrado)} />
        <Linha rotulo="Registrado por (servidor)" valor={item.registrador?.nome} />
      </section>

      <section className="mb-5 rounded-lg border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">Custódia atual</h2>
          {ativo && (
            <Button size="sm" variant="outline" onClick={abrirModal}>Registrar custódia</Button>
          )}
        </div>
        {atual ? (
          <>
            <Linha rotulo="Situação" valor={TIPO_CUSTODIA[atual.tipo] || atual.tipo} />
            <Linha rotulo="Local de guarda" valor={atual.local_guarda} />
            <Linha rotulo="Responsável" valor={atual.usuario} />
            <Linha rotulo="Data" valor={formatarData(atual.data_evento)} />
          </>
        ) : (
          <p className="text-sm text-muted">Sem registro de custódia.</p>
        )}
      </section>

      <section className="mb-5 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Histórico de custódia</h2>
        {custodias.length ? (
          <ul className="space-y-2 text-sm">
            {custodias.map((c) => (
              <li key={c.id} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <span className="w-44 shrink-0 tabular-nums text-muted">{formatarData(c.data_evento)}</span>
                <span className="text-fg">
                  {TIPO_CUSTODIA[c.tipo] || c.tipo}
                  {c.local_guarda ? ` — ${c.local_guarda}` : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nenhum evento registrado.</p>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate('/itens')}>Voltar</Button>
        {ativo && (
          <>
            <Button variant="outline" onClick={abrirModalCaso}>Abrir caso</Button>
            <Button onClick={() => navigate(`/itens/${id}/devolver`)}>Devolver item</Button>
          </>
        )}
      </div>

      {/* Modal: registrar custódia */}
      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Registrar custódia"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button onClick={salvarCustodia} loading={custEnviando}>Salvar</Button>
          </>
        }
      >
        {custErroGeral && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
          >
            {custErroGeral}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Tipo"
            required
            className="w-full"
            value={custForm.tipo}
            onChange={(e) => setCust('tipo', e.target.value)}
          >
            <option value="ENTRADA">Entrada</option>
            <option value="TRANSFERENCIA">Transferência</option>
            <option value="SAIDA">Saída</option>
          </Select>
          <Input
            label="Local de guarda"
            required
            value={custForm.local_guarda}
            error={custErros.local_guarda}
            maxLength={LIM.local}
            onChange={(e) => setCust('local_guarda', e.target.value)}
          />
          <Input
            label="Observações"
            value={custForm.observacoes}
            error={custErros.observacoes}
            maxLength={LIM.observacoes}
            onChange={(e) => setCust('observacoes', e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal: abrir caso */}
      <Modal
        open={modalCaso}
        onClose={() => setModalCaso(false)}
        title="Abrir caso"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalCaso(false)}>Cancelar</Button>
            <Button onClick={abrirCaso} loading={abrindoCaso}>Abrir caso</Button>
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
          Abrindo um caso para <span className="font-medium text-fg">{item.codigo} — {item.titulo}</span>.
          Você pode ligar a um relato de perda correspondente (opcional).
        </p>
        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Relato de perda (opcional)"
            className="w-full"
            value={casoForm.relato_perda_id}
            onChange={(e) => setCasoForm((f) => ({ ...f, relato_perda_id: e.target.value }))}
          >
            <option value="">Sem relato vinculado</option>
            {relatos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} — {r.titulo}
              </option>
            ))}
          </Select>
          <Input
            label="Descrição (opcional)"
            value={casoForm.descricao}
            maxLength={LIM.descricao}
            onChange={(e) => setCasoForm((f) => ({ ...f, descricao: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
