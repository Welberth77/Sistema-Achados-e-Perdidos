import api from './api.js';

// Relatos do próprio usuário logado (integração real com o backend).
export async function meusRelatos() {
  const { data } = await api.get('/relatos/meus');
  return data;
}

export async function criarRelato(payload) {
  const { data } = await api.post('/relatos', payload);
  return data;
}

export async function minhasCorrespondencias() {
  const { data } = await api.get('/relatos/meus/correspondencias');
  return data.data ?? data;
}
