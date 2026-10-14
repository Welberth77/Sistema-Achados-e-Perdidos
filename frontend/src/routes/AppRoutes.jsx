import { Routes, Route, Navigate } from 'react-router-dom';
import { Sessao, ExigirSessao } from '../auth/Sessao.jsx';
import App from '../App.jsx';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Registradores from '../pages/registradores/Registradores.jsx';
import NovoRegistrador from '../pages/registradores/NovoRegistrador.jsx';
import Itens from '../pages/itens/Itens.jsx';
import NovoItem from '../pages/itens/NovoItem.jsx';
import DetalhesItem from '../pages/itens/DetalhesItem.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Sessao />}>
        <Route path="/login" element={<Login />} />

        <Route element={<ExigirSessao />}>
          <Route element={<App />}>
            <Route index element={<Navigate to="/itens" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/registradores" element={<Registradores />} />
            <Route path="/registradores/novo" element={<NovoRegistrador />} />
            <Route path="/itens" element={<Itens />} />
            <Route path="/itens/novo" element={<NovoItem />} />
            <Route path="/itens/:id" element={<DetalhesItem />} />
            <Route path="*" element={<div>Página não encontrada.</div>} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
