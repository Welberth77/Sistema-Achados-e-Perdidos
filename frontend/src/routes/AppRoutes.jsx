import { Routes, Route } from 'react-router-dom';
import App from '../App.jsx';
import PublicLayout from '../components/PublicLayout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Catalogo from '../pages/publico/Catalogo.jsx';
import Login from '../pages/Login.jsx';
import Cadastro from '../pages/Cadastro.jsx';
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

export default function AppRoutes() {
  return (
    <Routes>
      {/* Público — sem login */}
      <Route element={<PublicLayout />}>
        <Route index element={<Catalogo />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Área autenticada (equipe/administração) */}
      <Route
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/registradores" element={<Registradores />} />
        <Route path="/registradores/novo" element={<NovoRegistrador />} />

        <Route path="/itens" element={<Itens />} />
        <Route path="/itens/novo" element={<NovoItem />} />
        <Route path="/itens/:id" element={<DetalhesItem />} />

        <Route path="/relatos" element={<Relatos />} />
        <Route path="/relatos/:id" element={<DetalhesRelato />} />

        <Route path="/consulta" element={<Consulta />} />

        <Route path="/casos" element={<Casos />} />
        <Route path="/casos/:id" element={<DetalhesCaso />} />
      </Route>

      <Route path="*" element={<div className="p-6 text-muted">Página não encontrada.</div>} />
    </Routes>
  );
}
