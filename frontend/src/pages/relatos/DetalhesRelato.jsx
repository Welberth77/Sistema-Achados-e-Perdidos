import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterRelato, listarCorrespondenciasRelato } from '../../services/relatos.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';

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

      <Button variant="outline" onClick={() => navigate('/relatos')}>Voltar</Button>
    </div>
  );
}
