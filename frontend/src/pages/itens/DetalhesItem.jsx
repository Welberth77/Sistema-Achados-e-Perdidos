import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterItem } from '../../services/itens.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Button from '../../components/Button.jsx';

function Linha({ rotulo, valor }) {
  return (
    <div className="flex gap-2 py-1 text-sm">
      <span className="w-40 shrink-0 font-medium text-gray-600">{rotulo}</span>
      <span>{valor || '—'}</span>
    </div>
  );
}

export default function DetalhesItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setLoading(true);
    obterItem(id)
      .then(setItem)
      .catch(() => setErro('Item não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500">Carregando...</p>;
  if (erro) return (
    <div>
      <p className="mb-4 text-red-600">{erro}</p>
      <Button variant="secondary" onClick={() => navigate('/itens')}>Voltar</Button>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{item.descricao}</h1>
        <StatusBadge status={item.status} />
      </div>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Dados do item</h2>
        <Linha rotulo="Categoria" valor={item.categoria} />
        <Linha rotulo="Local aproximado" valor={item.localAproximado} />
        <Linha rotulo="Data / hora" valor={`${item.data || '—'} ${item.hora || ''}`} />
        <Linha rotulo="Características" valor={item.caracteristicas} />
        <Linha rotulo="Número de série" valor={item.numeroSerie} />
        <Linha rotulo="Registrador" valor={item.registrador} />
      </section>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Custódia</h2>
        {item.custodia ? (
          <>
            <Linha rotulo="Setor" valor={item.custodia.setor} />
            <Linha rotulo="Sala" valor={item.custodia.sala} />
            <Linha rotulo="Prateleira" valor={item.custodia.prateleira} />
            <Linha rotulo="Responsável" valor={item.custodia.responsavel} />
          </>
        ) : (
          <p className="text-sm text-gray-500">Item não está em custódia.</p>
        )}
      </section>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Histórico</h2>
        <ul className="space-y-1 text-sm">
          {item.historico?.map((h, i) => (
            <li key={i} className="flex gap-2">
              <span className="w-28 shrink-0 text-gray-500">{h.data}</span>
              <span>{h.evento}</span>
            </li>
          ))}
        </ul>
      </section>

      <Button variant="secondary" onClick={() => navigate('/itens')}>Voltar</Button>
    </div>
  );
}