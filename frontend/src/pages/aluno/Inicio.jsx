import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meusRelatos } from '../../services/meusRelatos.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

function dataCurta(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
}

export default function Inicio() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meusRelatos()
      .then(setRelatos)
      .catch(() => setRelatos([]))
      .finally(() => setLoading(false));
  }, []);

  const colunas = [
    { key: 'codigo', header: 'Código', className: 'font-medium tabular-nums' },
    { key: 'titulo', header: 'Item perdido' },
    { key: 'data_perda', header: 'Data da perda', render: (r) => dataCurta(r.data_perda), className: 'tabular-nums text-muted' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Olá, {usuario?.nome?.split(' ')[0] || 'bem-vindo'}
        </h1>
        <p className="mt-1 text-sm text-muted">Acompanhe seus relatos de perda e registre novos.</p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-5">
        <div>
          <p className="font-medium text-fg">Perdeu alguma coisa?</p>
          <p className="text-sm text-muted">Registre um relato para ser avisado se aparecer algo parecido.</p>
        </div>
        <Button onClick={() => navigate('/relatar')}>Relatar perda</Button>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-fg">Meus relatos</h2>
        <Table
          columns={colunas}
          data={relatos}
          loading={loading}
          emptyMessage="Você ainda não registrou nenhum relato de perda."
        />
      </section>
    </div>
  );
}
