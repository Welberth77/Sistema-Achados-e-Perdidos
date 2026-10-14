import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterRelato, listarCorrespondenciasRelato } from '../../services/relatos.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';

function Linha({ rotulo, valor }) {
  return (
    <div className="flex gap-2 py-1 text-sm">
      <span className="w-40 shrink-0 font-medium text-gray-600">{rotulo}</span>
      <span>{valor || '—'}</span>
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

  if (loading) return <p className="text-gray-500">Carregando...</p>;
  if (erro) return (
    <div>
      <p className="mb-4 text-red-600">{erro}</p>
      <Button variant="secondary" onClick={() => navigate('/relatos')}>Voltar</Button>
    </div>
  );

  const colunasCorresp = [
    { key: 'item', header: 'Item achado', render: (row) => row.item ? `${row.item.codigo} — ${row.item.titulo}` : '—' },
    { key: 'pontuacao', header: 'Similaridade', render: (row) => (row.pontuacao != null ? `${row.pontuacao}%` : '—') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{relato.titulo}</h1>
        <StatusBadge status={relato.status} />
      </div>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Dados do relato</h2>
        <Linha rotulo="Código" valor={relato.codigo} />
        <Linha rotulo="Categoria" valor={relato.categoria?.nome} />
        <Linha rotulo="Descrição" valor={relato.descricao} />
        <Linha rotulo="Cor" valor={relato.cor} />
        <Linha rotulo="Marca" valor={relato.marca} />
        <Linha rotulo="Local da perda" valor={relato.local_perda} />
        <Linha rotulo="Data da perda" valor={relato.data_perda} />
        <Linha rotulo="Registrador" valor={relato.registrador?.nome} />
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">Correspondências sugeridas</h2>
        <Table
          columns={colunasCorresp}
          data={correspondencias}
          loading={loadingCorresp}
          emptyMessage="Nenhuma correspondência sugerida para este relato."
          onRowClick={(row) => row.item && navigate(`/itens/${row.item_achado_id}`)}
        />
      </section>

      <Button variant="secondary" onClick={() => navigate('/relatos')}>Voltar</Button>
    </div>
  );
}
