import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterCaso } from '../../services/casos.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Button from '../../components/Button.jsx';

function Linha({ rotulo, valor, onClick }) {
  return (
    <div className="flex gap-2 py-1 text-sm">
      <span className="w-40 shrink-0 font-medium text-gray-600">{rotulo}</span>
      {onClick ? (
        <button className="text-left text-blue-700 underline hover:text-blue-900" onClick={onClick}>
          {valor || '—'}
        </button>
      ) : (
        <span>{valor || '—'}</span>
      )}
    </div>
  );
}

function dataHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR');
}

export default function DetalhesCaso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setLoading(true);
    obterCaso(id)
      .then(setCaso)
      .catch(() => setErro('Caso não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500">Carregando...</p>;
  if (erro) return (
    <div>
      <p className="mb-4 text-red-600">{erro}</p>
      <Button variant="secondary" onClick={() => navigate('/casos')}>Voltar</Button>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{caso.codigo}</h1>
        <StatusBadge status={caso.status} />
      </div>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Dados do caso</h2>
        <Linha rotulo="Descrição" valor={caso.descricao} />
        <Linha rotulo="Responsável" valor={caso.responsavel?.nome} />
        <Linha rotulo="Abertura" valor={dataHora(caso.data_abertura)} />
        <Linha rotulo="Encerramento" valor={dataHora(caso.data_encerramento)} />
      </section>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Vínculos</h2>
        <Linha
          rotulo="Item achado"
          valor={caso.item ? `${caso.item.codigo} — ${caso.item.titulo}` : '—'}
          onClick={caso.item ? () => navigate(`/itens/${caso.item_achado_id}`) : undefined}
        />
        <Linha
          rotulo="Relato de perda"
          valor={caso.relato ? `${caso.relato.codigo} — ${caso.relato.titulo}` : '—'}
          onClick={caso.relato ? () => navigate(`/relatos/${caso.relato_perda_id}`) : undefined}
        />
      </section>

      <Button variant="secondary" onClick={() => navigate('/casos')}>Voltar</Button>
    </div>
  );
}
