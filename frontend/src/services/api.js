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

// Tratamento central de respostas/erros (ex.: logout em 401 — a implementar).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response?.status === 401) { /* redirecionar para login */ }
    return Promise.reject(error);
  }
);

export default api;
