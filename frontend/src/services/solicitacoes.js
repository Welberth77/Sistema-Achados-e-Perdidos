import api from './api.js';

export async function listarSolicitacoes(status = 'PENDENTE') {
  const { data } = await api.get('/solicitacoes', { params: { status } });
  return data.data ?? data;
}

export async function aprovarSolicitacao(id) {
  const { data } = await api.post(`/solicitacoes/${id}/aprovar`);
  return data;
}

export async function rejeitarSolicitacao(id) {
  const { data } = await api.post(`/solicitacoes/${id}/rejeitar`);
  return data;
}
