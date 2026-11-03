import api from './api.js';

export async function criarReivindicacao(payload) {
  const { data } = await api.post('/reivindicacoes', payload);
  return data;
}

export async function minhasReivindicacoes() {
  const { data } = await api.get('/reivindicacoes/minhas');
  return data.data ?? data;
}

export async function listarReivindicacoes(status = 'PENDENTE') {
  const { data } = await api.get('/reivindicacoes', { params: { status } });
  return data.data ?? data;
}

export async function aprovarReivindicacao(id) {
  const { data } = await api.post(`/reivindicacoes/${id}/aprovar`);
  return data;
}

export async function rejeitarReivindicacao(id) {
  const { data } = await api.post(`/reivindicacoes/${id}/rejeitar`);
  return data;
}
