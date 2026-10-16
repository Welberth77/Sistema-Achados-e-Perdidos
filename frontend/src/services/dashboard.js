import api from './api.js';

export async function obterResumo() {
  const { data } = await api.get('/dashboard/resumo');
  return data;
}
