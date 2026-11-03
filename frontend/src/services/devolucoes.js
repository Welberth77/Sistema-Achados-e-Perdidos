import api from './api.js';

// Registra a devolução de um item ao seu dono.
// Regra de negócio (UC-06): não devolve sem comprovação de propriedade.
// Backend: POST /api/devolucoes/nova
//   { item_id, recebedor_usuario_id? | recebedor_nome?, comprovante, observacao? }
export async function registrarDevolucao({ item_id, recebedor_usuario_id, recebedor_nome, comprovante, observacao }) {
  const { data } = await api.post('/devolucoes/nova', {
    item_id: Number(item_id),
    recebedor_usuario_id: recebedor_usuario_id ? Number(recebedor_usuario_id) : undefined,
    recebedor_nome: recebedor_nome ? recebedor_nome.trim() : undefined,
    comprovante,
    observacao: observacao || undefined,
  });
  return data;
}
