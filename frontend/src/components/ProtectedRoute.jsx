import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

// Protege as rotas internas: sem sessão, redireciona para /login.
export default function ProtectedRoute({ children }) {
  const { autenticado, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <div className="p-6 text-gray-500">Carregando...</div>;
  }
  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
