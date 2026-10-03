import { useEffect, useState } from 'react';
import api from '../services/api.js';
import CardEstatistica from '../components/CardEstatistica.jsx';

// Página inicial. Faz um ping no backend para validar a integração.
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardEstatistica titulo="Itens achados" valor="—" />
        <CardEstatistica titulo="Em custódia" valor="—" />
        <CardEstatistica titulo="Devolvidos" valor="—" />
        <CardEstatistica titulo="Casos em aberto" valor="—" />
        <CardEstatistica titulo="Casos encerrados" valor="—" />
      </div>
    </div>
  );
}
