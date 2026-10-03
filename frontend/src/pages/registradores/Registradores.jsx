import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarRegistradores } from '../../services/registradores.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';

export default function Registradores() {
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  async function carregar() {
    setLoading(true);
    try {
      setDados(await listarRegistradores({ q }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colunas = [
    { key: 'nome', header: 'Nome' },
    { key: 'identificacao', header: 'Identificação' },
    { key: 'contato', header: 'Contato' },
    { key: 'tipo', header: 'Tipo' },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Registradores</h1>
        <Button onClick={() => navigate('/registradores/novo')}>Novo registrador</Button>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="w-72">
          <Input
            placeholder="Pesquisar por nome ou identificação..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && carregar()}
          />
        </div>
        <Button variant="secondary" onClick={carregar}>
          Buscar
        </Button>
      </div>

      <Table columns={colunas} data={dados} loading={loading} />
    </div>
  );
}