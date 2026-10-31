import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarReivindicacoes, aprovarReivindicacao, rejeitarReivindicacao } from '../../services/reivindicacoes.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

function dataCurta(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
}

export default function Reivindicacoes() {
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [acaoId, setAcaoId] = useState(null);
  const [paraRejeitar, setParaRejeitar] = useState(null);
  const [rejeitando, setRejeitando] = useState(false);

  function carregar() {
    setLoading(true);
    listarReivindicacoes('PENDENTE')
      .then(setDados)
      .catch((e) =>
        setErro(e.response?.status === 403 ? 'Acesso restrito à equipe.' : 'Não foi possível carregar as solicitações.')
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function aprovar(r) {
    setErroAcao('');
    setAcaoId(r.id);
    try {
      const resp = await aprovarReivindicacao(r.id);
      if (resp?.caso_id) {
        navigate(`/casos/${resp.caso_id}`);
      } else {
        carregar();
      }
    } catch (e) {
      setErroAcao(e.response?.data?.error || 'Não foi possível abrir o caso.');
    } finally {
      setAcaoId(null);
    }
  }

  async function confirmarRejeicao() {
    if (!paraRejeitar) return;
    setErroAcao('');
    setRejeitando(true);
    try {
      await rejeitarReivindicacao(paraRejeitar.id);
      setParaRejeitar(null);
      carregar();
    } catch (e) {
      setErroAcao(e.response?.data?.error || 'Não foi possível rejeitar.');
      setParaRejeitar(null);
    } finally {
      setRejeitando(false);
    }
  }

  const colunas = [
    { key: 'usuario', header: 'Solicitante', render: (r) => (
      <div>
        <div className="font-medium text-fg">{r.usuario?.nome}</div>
        <div className="text-xs text-muted">{r.usuario?.email}</div>
      </div>
    ) },
    { key: 'item', header: 'Item', render: (r) => (r.item ? `${r.item.codigo} — ${r.item.titulo}` : '—') },
    { key: 'relato', header: 'Relato', render: (r) => (r.relato ? `${r.relato.codigo} — ${r.relato.titulo}` : '—') },
    { key: 'mensagem', header: 'Mensagem', render: (r) => r.mensagem || '—' },
    { key: 'criado_em', header: 'Enviada em', render: (r) => dataCurta(r.criado_em), className: 'tabular-nums text-muted' },
    { key: 'acoes', header: 'Ações', render: (r) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => aprovar(r)} loading={acaoId === r.id}>Abrir caso</Button>
        <Button size="sm" variant="danger" onClick={() => setParaRejeitar(r)}>Rejeitar</Button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Reivindicações</h1>
        <p className="mt-1 text-sm text-muted">
          Usuários informando que um item achado é deles. Aprovar abre um caso ligando o item ao relato.
        </p>
      </div>

      {erroAcao && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erroAcao}
        </div>
      )}

      {erro ? (
        <div role="alert" className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erro}
        </div>
      ) : (
        <Table columns={colunas} data={dados} loading={loading} emptyMessage="Nenhuma reivindicação pendente." />
      )}

      <ConfirmDialog
        open={!!paraRejeitar}
        onClose={() => setParaRejeitar(null)}
        onConfirm={confirmarRejeicao}
        loading={rejeitando}
        title="Rejeitar reivindicação"
        confirmLabel="Rejeitar"
        mensagem={`Rejeitar a reivindicação de ${paraRejeitar?.usuario?.nome ?? ''} sobre "${paraRejeitar?.item?.titulo ?? ''}"?`}
      />
    </div>
  );
}
