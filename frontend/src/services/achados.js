import api from './api.js';

// Itens achados (integração real). Filtros: q (texto), categoria (nome), status.
export async function listarAchados({ q = '', categoria = '', status = '' } = {}) {
  const { data } = await api.get('/itens', { params: { q, categoria, status } });
  return data;
}
