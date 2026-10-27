import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

// Protege rotas internas. Com `papeis`, restringe por perfil e, se não bater,
// manda o usuário para a home do perfil dele.
export default function ProtectedRoute({ children, papeis }) {
  const { autenticado, carregando, usuario } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <div className="p-6 text-muted">Carregando…</div>;
  }
  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (papeis && !papeis.includes(usuario?.papel)) {
    const home = usuario?.papel === 'USUARIO' ? '/inicio' : '/dashboard';
    return <Navigate to={home} replace />;
  }
  return children;
}
