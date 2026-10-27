import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meusRelatos } from '../../services/meusRelatos.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

function dataCurta(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
}

export default function MeusRelatos() {
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
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Meus relatos</h1>
          <p className="mt-1 text-sm text-muted">Os relatos de perda que você registrou.</p>
        </div>
        <Button onClick={() => navigate('/relatar')}>Relatar perda</Button>
      </div>

      <Table
        columns={colunas}
        data={relatos}
        loading={loading}
        emptyMessage="Você ainda não registrou nenhum relato de perda."
      />
    </div>
  );
}
