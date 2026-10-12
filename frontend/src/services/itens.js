import api from './api.js';

const USE_MOCK = true; // troque para false quando o backend entregar os endpoints

let mockData = [
  { id: 1, descricao: 'Mochila preta', categoria: 'Acessórios', localAproximado: 'Biblioteca', data: '2026-10-01', hora: '14:30', caracteristicas: 'Marca X, com chaveiro', numeroSerie: '', status: 'em_custodia', registrador: 'Biblioteca Central' },
  { id: 2, descricao: 'Celular Android', categoria: 'Eletrônicos', localAproximado: 'Quadra', data: '2026-10-02', hora: '09:10', caracteristicas: 'Capa azul', numeroSerie: 'SN-99281', status: 'achado', registrador: 'Recepção Bloco A' },
  { id: 3, descricao: 'Garrafa térmica', categoria: 'Utensílios', localAproximado: 'Sala 203', data: '2026-09-28', hora: '16:00', caracteristicas: 'Inox, 500ml', numeroSerie: '', status: 'devolvido', registrador: 'Recepção Bloco A' },
];
let nextId = 4;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listarItens({ q = '', status = '' } = {}) {
  if (USE_MOCK) {
    await delay(300);
    const termo = q.trim().toLowerCase();
    return mockData.filter(
      (i) =>
        (!termo || i.descricao.toLowerCase().includes(termo) || i.categoria.toLowerCase().includes(termo)) &&
        (!status || i.status === status)
    );
  }
  const { data } = await api.get('/itens', { params: { q, status } });
  return data;
}

export async function obterItem(id) {
  if (USE_MOCK) {
    await delay(300);
    const item = mockData.find((i) => String(i.id) === String(id));
    if (!item) {
      const err = new Error('Item não encontrado');
      err.status = 404;
      throw err;
    }
    // simula dados extras da tela de detalhes
    return {
      ...item,
      custodia: item.status === 'em_custodia' ? { setor: 'Biblioteca', sala: 'Acervo', prateleira: 'B-12', responsavel: 'Ana' } : null,
      historico: [
        { data: item.data, evento: 'Item cadastrado' },
        ...(item.status === 'devolvido' ? [{ data: '2026-10-03', evento: 'Item devolvido ao proprietário' }] : []),
      ],
    };
  }
  const { data } = await api.get(`/itens/${id}`);
  return data;
}

export async function criarItem(payload) {
  if (USE_MOCK) {
    await delay(300);
    const novo = { id: nextId++, status: 'achado', registrador: 'Sistema', ...payload };
    mockData.push(novo);
    return novo;
  }
  const { data } = await api.post('/itens', payload);
  return data;
}