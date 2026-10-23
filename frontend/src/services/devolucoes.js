import api from './api.js';

// Registra a devolução de um item achado ao seu recebedor.
// Regra de negócio (UC-06): não devolve sem comprovação de propriedade.
// Backend: POST /api/devolucoes/nova  -> { item_id, recebedor_id, comprovante, observacao? }
export async function registrarDevolucao({ item_id, recebedor_id, comprovante, observacao }) {
  const { data } = await api.post('/devolucoes/nova', {
    item_id: Number(item_id),
    recebedor_id: Number(recebedor_id),
    comprovante,
    observacao: observacao || undefined,
  });
  return data;
}
