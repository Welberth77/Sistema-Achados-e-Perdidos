import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { listarRegistradores, excluirRegistrador } from '../../services/registradores.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

const VINCULO_LABEL = {
  ALUNO: 'Aluno',
  DOCENTE: 'Docente',
  TERCEIRIZADO: 'Terceirizado',
  SERVIDOR: 'Servidor',
  OUTRO: 'Outro',
};

const VINCULOS = [
  { value: '', label: 'Todos os vínculos' },
  ...Object.entries(VINCULO_LABEL).map(([value, label]) => ({ value, label })),
];

export default function Registradores() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const ehAdmin = usuario?.papel === 'ADMINISTRADOR';

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [vinculo, setVinculo] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      setDados(await listarRegistradores({ q, vinculo }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setErroAcao('');
    setExcluindo(true);
    try {
      await excluirRegistrador(paraExcluir.id);
      setParaExcluir(null);
      carregar();
    } catch (e) {
      setErroAcao(e.response?.data?.error || 'Não foi possível excluir o registrador.');
      setParaExcluir(null);
    } finally {
      setExcluindo(false);
    }
  }

  const colunas = [
    { key: 'nome', header: 'Nome', className: 'font-medium' },
    { key: 'vinculo', header: 'Vínculo', render: (row) => VINCULO_LABEL[row.vinculo] || row.vinculo || '—' },
    { key: 'documento', header: 'Documento', render: (row) => row.documento || row.matricula || '—', className: 'tabular-nums' },
    { key: 'contato', header: 'Contato', render: (row) => row.telefone || row.email || '—' },
  ];

  if (ehAdmin) {
    colunas.push({
      key: 'acoes',
      header: 'Ações',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/registradores/${row.id}/editar`)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => setParaExcluir(row)}>Excluir</Button>
        </div>
      ),
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Registradores</h1>
          <p className="mt-1 text-sm text-muted">
            Pessoas autorizadas a registrar itens e relatos.{!ehAdmin && ' A gestão é feita pelo administrador.'}
          </p>
        </div>
        {ehAdmin && <Button onClick={() => navigate('/registradores/novo')}>Novo registrador</Button>}
      </div>

      {erroAcao && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erroAcao}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-3">
        <div className="min-w-56 flex-1">
          <Input
            label="Pesquisar"
            placeholder="Nome, documento ou matrícula…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && carregar()}
          />
        </div>
        <Select label="Vínculo" options={VINCULOS} value={vinculo} onChange={(e) => setVinculo(e.target.value)} />
        <Button variant="outline" onClick={carregar}>Buscar</Button>
      </div>

      <Table columns={colunas} data={dados} loading={loading} emptyMessage="Nenhum registrador encontrado." />

      <ConfirmDialog
        open={!!paraExcluir}
        onClose={() => setParaExcluir(null)}
        onConfirm={confirmarExclusao}
        loading={excluindo}
        title="Excluir registrador"
        mensagem={`Excluir o registrador "${paraExcluir?.nome ?? ''}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
