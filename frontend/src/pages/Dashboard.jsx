import { useEffect, useState } from 'react';
import api from '../services/api.js';
import CardEstatistica from '../components/CardEstatistica.jsx';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Dashboard() {
  const [status, setStatus] = useState('verificando...');

  useEffect(() => {
    api
      .get('/health')
      .then((res) => setStatus(res.data?.status === 'ok' ? 'conectado' : 'resposta inesperada'))
      .catch(() => setStatus('sem conexão com o backend'));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <p className="mb-6 text-sm text-gray-600">
        Status do backend: <span className="font-semibold">{status}</span>
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardEstatistica titulo="Itens achados" valor="—" />
        <CardEstatistica titulo="Em custódia" valor="—" />
        <CardEstatistica titulo="Devolvidos" valor="—" />
        <CardEstatistica titulo="Casos em aberto" valor="—" />
        <CardEstatistica titulo="Casos encerrados" valor="—" />
      </div>

      {/* teste rápido dos componentes base */}
      <div className="flex items-center gap-2">
        <Button>Salvar</Button>
        <Button variant="secondary">Cancelar</Button>
        <Button variant="danger" loading>Excluir</Button>
        <StatusBadge status="em_custodia" />
      </div>
    </div>
  );
}