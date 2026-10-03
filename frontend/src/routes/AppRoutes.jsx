import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App.jsx';
import Dashboard from '../pages/Dashboard.jsx';

// Mapa de rotas. Novas telas entram como <Route> dentro do layout App.
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

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
