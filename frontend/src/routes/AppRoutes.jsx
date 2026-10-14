import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Registradores from '../pages/registradores/Registradores.jsx';
import NovoRegistrador from '../pages/registradores/NovoRegistrador.jsx';
import Itens from '../pages/itens/Itens.jsx';
import NovoItem from '../pages/itens/NovoItem.jsx';
import DetalhesItem from '../pages/itens/DetalhesItem.jsx';
import Relatos from '../pages/relatos/Relatos.jsx';
import DetalhesRelato from '../pages/relatos/DetalhesRelato.jsx';
import Consulta from '../pages/consulta/Consulta.jsx';
import Casos from '../pages/casos/Casos.jsx';
import DetalhesCaso from '../pages/casos/DetalhesCaso.jsx';

// Mapa de rotas. Novas telas entram como <Route> dentro do layout App.
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/registradores" element={<Registradores />} />
        <Route path="/registradores/novo" element={<NovoRegistrador />} />

        <Route path="/itens" element={<Itens />} />
        <Route path="/itens/novo" element={<NovoItem />} />
        <Route path="/itens/:id" element={<DetalhesItem />} />

        <Route path="/relatos" element={<Relatos />} />
        <Route path="/relatos/:id" element={<DetalhesRelato />} />
        {/* /relatos/novo (cadastro) é da outra parte do front */}

        <Route path="/consulta" element={<Consulta />} />

        <Route path="/casos" element={<Casos />} />
        <Route path="/casos/:id" element={<DetalhesCaso />} />

        <Route path="*" element={<div>Página não encontrada.</div>} />
      </Route>
    </Routes>
  );
}
