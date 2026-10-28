import { useEffect, useState } from 'react';
import { listarSolicitacoes, aprovarSolicitacao, rejeitarSolicitacao } from '../../services/solicitacoes.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

const VINCULO_LABEL = {
  ALUNO: 'Aluno', DOCENTE: 'Docente', TERCEIRIZADO: 'Terceirizado', SERVIDOR: 'Servidor', OUTRO: 'Outro',
};

function dataCurta(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
}

export default function Solicitacoes() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [acaoId, setAcaoId] = useState(null);
  const [paraRejeitar, setParaRejeitar] = useState(null);
  const [rejeitando, setRejeitando] = useState(false);

  function carregar() {
    setLoading(true);
    listarSolicitacoes('PENDENTE')
      .then(setDados)
      .catch((e) =>
        setErro(e.response?.status === 403 ? 'Acesso restrito ao administrador.' : 'Não foi possível carregar as solicitações.')
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function aprovar(id) {
    setErroAcao('');
    setAcaoId(id);
    try {
      await aprovarSolicitacao(id);
      carregar();
    } catch (e) {
      setErroAcao(e.response?.data?.error || 'Não foi possível aprovar.');
    } finally {
      setAcaoId(null);
    }
  }

  async function confirmarRejeicao() {
    if (!paraRejeitar) return;
    setErroAcao('');
    setRejeitando(true);
    try {
      await rejeitarSolicitacao(paraRejeitar.id);
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
    { key: 'vinculo', header: 'Vínculo', render: (r) => VINCULO_LABEL[r.vinculo] || r.vinculo || '—' },
    { key: 'documento', header: 'Documento', render: (r) => r.documento || r.matricula || '—', className: 'tabular-nums' },
    { key: 'telefone', header: 'Telefone', render: (r) => r.telefone || '—' },
    { key: 'criado_em', header: 'Enviada em', render: (r) => dataCurta(r.criado_em), className: 'tabular-nums text-muted' },
    {
      key: 'acoes',
      header: 'Ações',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => aprovar(r.id)} loading={acaoId === r.id}>Aprovar</Button>
          <Button size="sm" variant="danger" onClick={() => setParaRejeitar(r)}>Rejeitar</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Solicitações de registrador</h1>
        <p className="mt-1 text-sm text-muted">
          Pedidos de usuários que querem ser registradores. Aprovar torna a pessoa servidor e a adiciona aos registradores.
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
        <Table columns={colunas} data={dados} loading={loading} emptyMessage="Nenhuma solicitação pendente." />
      )}

      <ConfirmDialog
        open={!!paraRejeitar}
        onClose={() => setParaRejeitar(null)}
        onConfirm={confirmarRejeicao}
        loading={rejeitando}
        title="Rejeitar solicitação"
        confirmLabel="Rejeitar"
        mensagem={`Rejeitar a solicitação de ${paraRejeitar?.usuario?.nome ?? ''}? A pessoa continua como usuário comum.`}
      />
    </div>
  );
}
