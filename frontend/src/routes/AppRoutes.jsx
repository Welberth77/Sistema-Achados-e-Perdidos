import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Registradores from '../pages/registradores/Registradores.jsx';
import NovoRegistrador from '../pages/registradores/NovoRegistrador.jsx';
import Itens from '../pages/itens/Itens.jsx';
import NovoItem from '../pages/itens/NovoItem.jsx';
import DetalhesItem from '../pages/itens/DetalhesItem.jsx';

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

        {/* Telas futuras (exemplos):
        <Route path="/registradores" element={<Registradores />} />
        <Route path="/itens" element={<Itens />} />
        <Route path="/relatos" element={<Relatos />} />
        <Route path="/consulta" element={<Consulta />} />
        <Route path="/casos" element={<Casos />} />
        */}

        <Route path="*" element={<div>Página não encontrada.</div>} />
      </Route>
    </Routes>
  );
}
