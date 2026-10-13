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

const TIPO_CUSTODIA = {
  ENTRADA: 'Entrada',
  TRANSFERENCIA: 'Transferência',
  SAIDA: 'Saída',
};

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

  const custodias = item.custodias || [];
  const atual = custodias[0];

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{item.titulo}</h1>
        <StatusBadge status={item.status} />
      </div>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Dados do item</h2>
        <Linha rotulo="Código" valor={item.codigo} />
        <Linha rotulo="Categoria" valor={item.categoria?.nome} />
        <Linha rotulo="Descrição" valor={item.descricao} />
        <Linha rotulo="Cor" valor={item.cor} />
        <Linha rotulo="Marca" valor={item.marca} />
        <Linha rotulo="Local encontrado" valor={item.local_encontrado} />
        <Linha rotulo="Data encontrado" valor={item.data_encontrado} />
        <Linha rotulo="Registrador" valor={item.registrador?.nome} />
      </section>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Custódia atual</h2>
        {atual ? (
          <>
            <Linha rotulo="Situação" valor={TIPO_CUSTODIA[atual.tipo] || atual.tipo} />
            <Linha rotulo="Local de guarda" valor={atual.local_guarda} />
            <Linha rotulo="Responsável" valor={atual.usuario} />
            <Linha rotulo="Data" valor={formatarData(atual.data_evento)} />
          </>
        ) : (
          <p className="text-sm text-gray-500">Sem registro de custódia.</p>
        )}
      </section>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Histórico de custódia</h2>
        {custodias.length ? (
          <ul className="space-y-1 text-sm">
            {custodias.map((c) => (
              <li key={c.id} className="flex gap-2">
                <span className="w-40 shrink-0 text-gray-500">{formatarData(c.data_evento)}</span>
                <span>
                  {TIPO_CUSTODIA[c.tipo] || c.tipo}
                  {c.local_guarda ? ` — ${c.local_guarda}` : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum evento registrado.</p>
        )}
      </section>

      <Button variant="secondary" onClick={() => navigate('/itens')}>Voltar</Button>
    </div>
  );
}
