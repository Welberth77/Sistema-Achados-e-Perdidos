import api from './api.js';

// Enquanto o backend não entrega os endpoints, use o mock.
// Quando estiver pronto, troque para false.
const USE_MOCK = false;

// caso (campos do contrato/banco):
// { id, codigo, item_achado_id, relato_perda_id, responsavel_id, status,
//   descricao, data_abertura, data_encerramento }
// + resumos aninhados `item`, `relato` e `responsavel` para exibição.
// status ∈ ABERTO | AGUARDANDO_COMPROVACAO | AUTORIZADO | DEVOLVIDO | ENCERRADO | CANCELADO
let mockData = [
  {
    id: 1,
    codigo: 'CASO-2026-0001',
    item_achado_id: 1,
    item: { id: 1, codigo: 'ACH-2026-0001', titulo: 'Mochila preta' },
    relato_perda_id: 1,
    relato: { id: 1, codigo: 'REL-2026-0001', titulo: 'Mochila preta' },
    responsavel_id: 1,
    responsavel: { id: 1, nome: 'Administrador' },
    status: 'AGUARDANDO_COMPROVACAO',
    descricao: 'Correspondência confirmada; aguardando comprovação de propriedade.',
    data_abertura: '2026-10-06T09:00:00',
    data_encerramento: null,
  },
  {
    id: 2,
    codigo: 'CASO-2026-0002',
    item_achado_id: 3,
    item: { id: 3, codigo: 'ACH-2026-0003', titulo: 'Garrafa térmica' },
    relato_perda_id: null,
    relato: null,
    responsavel_id: 1,
    responsavel: { id: 1, nome: 'Administrador' },
    status: 'ENCERRADO',
    descricao: 'Item devolvido ao proprietário.',
    data_abertura: '2026-09-29T10:30:00',
    data_encerramento: '2026-10-03T10:00:00',
  },
];
let nextId = 3;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listarCasos({ status = '' } = {}) {
  if (USE_MOCK) {
    await delay(300);
    return mockData.filter((c) => !status || c.status === status);
  }
  const { data } = await api.get('/casos', { params: { status } });
  return data.data ?? data;
}

export async function obterCaso(id) {
  if (USE_MOCK) {
    await delay(300);
    const caso = mockData.find((c) => String(c.id) === String(id));
    if (!caso) {
      const err = new Error('Caso não encontrado');
      err.status = 404;
      throw err;
    }
    return { ...caso };
  }
  const { data } = await api.get(`/casos/${id}`);
  return data;
}

// Abre um caso ligando um item achado a um relato (UC-07).
// Backend: POST /api/casos -> { item_achado_id, relato_perda_id?, descricao? }
export async function criarCaso({ item_achado_id, relato_perda_id, descricao }) {
  if (USE_MOCK) {
    await delay(300);
    const novo = {
      id: nextId++,
      codigo: `CASO-2026-${String(nextId).padStart(4, '0')}`,
      item_achado_id: Number(item_achado_id),
      relato_perda_id: relato_perda_id ? Number(relato_perda_id) : null,
      status: 'ABERTO',
      descricao: descricao || null,
      data_abertura: new Date().toISOString(),
      data_encerramento: null,
    };
    mockData.push(novo);
    return novo;
  }
  const { data } = await api.post('/casos', {
    item_achado_id: Number(item_achado_id),
    relato_perda_id: relato_perda_id ? Number(relato_perda_id) : null,
    descricao: descricao || undefined,
  });
  return data;
}

// Encerra um caso (UC-07). Backend: PATCH /api/casos/:id/encerrar
export async function encerrarCaso(id) {
  if (USE_MOCK) {
    await delay(300);
    const caso = mockData.find((c) => String(c.id) === String(id));
    if (caso) {
      caso.status = 'ENCERRADO';
      caso.data_encerramento = new Date().toISOString();
    }
    return { caso };
  }
  const { data } = await api.patch(`/casos/${id}/encerrar`);
  return data;
}
