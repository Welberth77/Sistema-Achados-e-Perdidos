import axios from 'axios';

// Cliente HTTP único para toda a aplicação.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Anexa o token JWT (quando existir) em cada requisição.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tratamento central de erros: sessão expirada (401) com token já existente
// desloga e manda para o login. No próprio login (sem token ainda) não redireciona.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const tinhaToken = !!localStorage.getItem('token');
    if (status === 401 && tinhaToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
