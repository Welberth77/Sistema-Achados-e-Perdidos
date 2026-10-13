import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarRegistradores } from '../../services/registradores.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';

// rótulos amigáveis para o enum registradores.vinculo
const VINCULO_LABEL = {
  ALUNO: 'Aluno',
  DOCENTE: 'Docente',
  TERCEIRIZADO: 'Terceirizado',
  SERVIDOR: 'Servidor',
  OUTRO: 'Outro',
};

const VINCULOS = [
  { value: '', label: 'Todos os vínculos' },
  ...Object.entries(VINCULO_LABEL).map(([value, label]) => ({ value, label })),
];

export default function Registradores() {
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [vinculo, setVinculo] = useState('');

  async function carregar() {
    setLoading(true);
    try {
      setDados(await listarRegistradores({ q, vinculo }));
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
    { key: 'vinculo', header: 'Vínculo', render: (row) => VINCULO_LABEL[row.vinculo] || row.vinculo || '—' },
    { key: 'documento', header: 'Documento', render: (row) => row.documento || row.matricula || '—' },
    { key: 'contato', header: 'Contato', render: (row) => row.telefone || row.email || '—' },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Registradores</h1>
        <Button onClick={() => navigate('/registradores/novo')}>Novo registrador</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="w-72">
          <Input
            placeholder="Pesquisar por nome, documento ou matrícula..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && carregar()}
          />
        </div>
        <select
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900"
          value={vinculo}
          onChange={(e) => setVinculo(e.target.value)}
        >
          {VINCULOS.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={carregar}>Buscar</Button>
      </div>

      <Table columns={colunas} data={dados} loading={loading} />
    </div>
  );
}
