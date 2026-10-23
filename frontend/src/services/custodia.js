import api from './api.js';

// Registra uma movimentação de custódia de um item (UC-05).
// Backend: POST /api/custodia/nova -> { item_id, tipo, local_guarda, observacoes? }
// tipo ∈ ENTRADA | TRANSFERENCIA | SAIDA
export async function registrarCustodia({ item_id, tipo, local_guarda, observacoes }) {
  const { data } = await api.post('/custodia/nova', {
    item_id: Number(item_id),
    tipo,
    local_guarda,
    observacoes: observacoes || undefined,
  });
  return data;
}
