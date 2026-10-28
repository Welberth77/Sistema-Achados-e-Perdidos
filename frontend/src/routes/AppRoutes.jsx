import { Routes, Route } from 'react-router-dom';
import App from '../App.jsx';
import AlunoLayout from '../components/AlunoLayout.jsx';
import PublicLayout from '../components/PublicLayout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Catalogo from '../pages/publico/Catalogo.jsx';
import Login from '../pages/Login.jsx';
import Cadastro from '../pages/Cadastro.jsx';
import EsqueciSenha from '../pages/EsqueciSenha.jsx';
import Inicio from '../pages/aluno/Inicio.jsx';
import MeusRelatos from '../pages/aluno/MeusRelatos.jsx';
import RelatarPerda from '../pages/aluno/RelatarPerda.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Usuarios from '../pages/usuarios/Usuarios.jsx';
import Registradores from '../pages/registradores/Registradores.jsx';
import NovoRegistrador from '../pages/registradores/NovoRegistrador.jsx';
import Itens from '../pages/itens/Itens.jsx';
import NovoItem from '../pages/itens/NovoItem.jsx';
import DetalhesItem from '../pages/itens/DetalhesItem.jsx';
import DevolverItem from '../pages/itens/DevolverItem.jsx';
import Relatos from '../pages/relatos/Relatos.jsx';
import DetalhesRelato from '../pages/relatos/DetalhesRelato.jsx';
import EditarRelato from '../pages/relatos/EditarRelato.jsx';
import Categorias from '../pages/categorias/Categorias.jsx';
import Consulta from '../pages/consulta/Consulta.jsx';
import Casos from '../pages/casos/Casos.jsx';
import DetalhesCaso from '../pages/casos/DetalhesCaso.jsx';

const STAFF = ['ADMINISTRADOR', 'SERVIDOR'];

export default function AppRoutes() {
  return (
    <Routes>
      {/* Público — sem login */}
      <Route element={<PublicLayout />}>
        <Route index element={<Catalogo />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />

      {/* Área do usuário comum (aluno) */}
      <Route
        element={
          <ProtectedRoute papeis={['USUARIO']}>
            <AlunoLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/meus-relatos" element={<MeusRelatos />} />
        <Route path="/relatar" element={<RelatarPerda />} />
      </Route>

      {/* Área da equipe (administração) */}
      <Route
        element={
          <ProtectedRoute papeis={STAFF}>
            <App />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<ProtectedRoute papeis={['ADMINISTRADOR']}><Usuarios /></ProtectedRoute>} />
        <Route path="/categorias" element={<Categorias />} />

        <Route path="/registradores" element={<Registradores />} />
        <Route path="/registradores/novo" element={<NovoRegistrador />} />
        <Route path="/registradores/:id/editar" element={<NovoRegistrador />} />

        <Route path="/itens" element={<Itens />} />
        <Route path="/itens/novo" element={<NovoItem />} />
        <Route path="/itens/:id/editar" element={<NovoItem />} />
        <Route path="/itens/:id" element={<DetalhesItem />} />
        <Route path="/itens/:id/devolver" element={<DevolverItem />} />

        <Route path="/relatos" element={<Relatos />} />
        <Route path="/relatos/:id" element={<DetalhesRelato />} />
        <Route path="/relatos/:id/editar" element={<EditarRelato />} />

        <Route path="/consulta" element={<Consulta />} />

        <Route path="/casos" element={<Casos />} />
        <Route path="/casos/:id" element={<DetalhesCaso />} />
      </Route>

      <Route path="*" element={<div className="p-6 text-muted">Página não encontrada.</div>} />
    </Routes>
  );
}
