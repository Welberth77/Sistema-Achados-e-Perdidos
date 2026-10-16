import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterItem } from '../../services/itens.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Button from '../../components/Button.jsx';

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

  useEffect(() => {
    setLoading(true);
    obterItem(id)
      .then(setItem)
      .catch(() => setErro('Item não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

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
        <Linha rotulo="Data encontrado" valor={item.data_encontrado} />
        <Linha rotulo="Registrador" valor={item.registrador?.nome} />
      </section>

      <section className="mb-5 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Custódia atual</h2>
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

      <Button variant="outline" onClick={() => navigate('/itens')}>Voltar</Button>
    </div>
  );
}
