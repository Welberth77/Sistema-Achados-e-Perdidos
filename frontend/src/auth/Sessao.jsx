import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function Sessao() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(Boolean(token));
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    function expirar() {
      localStorage.removeItem('token');
      setToken(null);
      setUsuario(null);
      setErro('');
      setCarregando(false);
    }

    window.addEventListener('sessao-expirada', expirar);
    return () => window.removeEventListener('sessao-expirada', expirar);
  }, []);

  useEffect(() => {
    let ativo = true;

    if (!token) {
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro('');

    api
      .get('/auth/me')
      .then(({ data }) => {
        if (ativo) setUsuario(data);
      })
      .catch((falha) => {
        if (!ativo) return;

        if (falha.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          setUsuario(null);
        } else {
          setErro('Não foi possível verificar sua sessão. Confira a conexão com o servidor.');
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [token, tentativa]);

  async function entrar(email, senha) {
    const { data } = await api.post('/auth/login', { email, senha });
    localStorage.setItem('token', data.token);
    setUsuario(data.usuario);
    setCarregando(true);
    setToken(data.token);
  }

  function sair() {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
    setErro('');
    setCarregando(false);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        carregando,
        erro,
        entrar,
        sair,
        tentarNovamente: () => setTentativa((valor) => valor + 1),
      }}
    >
      <Outlet />
    </AuthContext.Provider>
  );
}

export function ExigirSessao() {
  const sessao = useAuth();
  const location = useLocation();

  if (!sessao.token) {
    return (
      <Navigate to="/login" replace state={{ destino: location.pathname + location.search }} />
    );
  }

  if (sessao.carregando) {
    return <p className="p-6">Verificando sessão...</p>;
  }

  if (sessao.erro) {
    return (
      <div className="p-6">
        <p role="alert">{sessao.erro}</p>
        <button
          className="mt-4 rounded bg-gray-900 px-4 py-2 text-white"
          onClick={sessao.tentarNovamente}
        >
          Tentar novamente
        </button>
        <button className="ml-3 underline" onClick={sessao.sair}>
          Sair
        </button>
      </div>
    );
  }

  return <Outlet />;
}
