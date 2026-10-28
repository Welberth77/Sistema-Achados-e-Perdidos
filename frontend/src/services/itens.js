import api from './api.js';

// Enquanto o backend não entrega os endpoints, use o mock.
// Quando estiver pronto, troque para false.
const USE_MOCK = false;

// item achado (campos do contrato/banco):
// { id, codigo, titulo, descricao, categoria_id, cor, marca, local_encontrado,
//   data_encontrado, registrador_id, status, foto_url, observacoes }
// + objetos aninhados `categoria` e `registrador` para exibição (como no GET /itens).
// status ∈ RECEBIDO | EM_CUSTODIA | EM_ANALISE | EM_DEVOLUCAO | DEVOLVIDO | DESCARTADO
let mockData = [
  {
    id: 1,
    codigo: 'ACH-2026-0001',
    titulo: 'Mochila preta',
    descricao: 'Marca X, com chaveiro',
    categoria_id: 4,
    categoria: { id: 4, nome: 'Acessórios' },
    cor: 'Preta',
    marca: 'X',
    local_encontrado: 'Biblioteca',
    data_encontrado: '2026-10-01',
    registrador_id: 2,
    registrador: { id: 2, nome: 'Maria Souza' },
    status: 'EM_CUSTODIA',
    foto_url: '',
    observacoes: '',
  },
  {
    id: 2,
    codigo: 'ACH-2026-0002',
    titulo: 'Celular Android',
    descricao: 'Capa azul',
    categoria_id: 1,
    categoria: { id: 1, nome: 'Eletrônicos' },
    cor: 'Azul',
    marca: '',
    local_encontrado: 'Quadra',
    data_encontrado: '2026-10-02',
    registrador_id: 1,
    registrador: { id: 1, nome: 'João da Silva' },
    status: 'RECEBIDO',
    foto_url: '',
    observacoes: 'Nº de série SN-99281',
  },
  {
    id: 3,
    codigo: 'ACH-2026-0003',
    titulo: 'Garrafa térmica',
    descricao: 'Inox, 500ml',
    categoria_id: 7,
    categoria: { id: 7, nome: 'Outros' },
    cor: 'Prata',
    marca: '',
    local_encontrado: 'Sala 203',
    data_encontrado: '2026-09-28',
    registrador_id: 1,
    registrador: { id: 1, nome: 'João da Silva' },
    status: 'DEVOLVIDO',
    foto_url: '',
    observacoes: '',
  },
];
let nextId = 4;
let nextCodigo = 4;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listarItens({
  q = '',
  status = '',
  categoria_id = '',
  data_inicio = '',
  data_fim = '',
} = {}) {
  if (USE_MOCK) {
    await delay(300);
    const termo = q.trim().toLowerCase();
    // datas no formato YYYY-MM-DD comparam corretamente como texto
    return mockData.filter(
      (i) =>
        (!termo ||
          i.titulo.toLowerCase().includes(termo) ||
          (i.descricao || '').toLowerCase().includes(termo)) &&
        (!status || i.status === status) &&
        (!categoria_id || String(i.categoria_id) === String(categoria_id)) &&
        (!data_inicio || i.data_encontrado >= data_inicio) &&
        (!data_fim || i.data_encontrado <= data_fim)
    );
  }
  const { data } = await api.get('/itens', {
    params: { q, status, categoria_id, data_inicio, data_fim },
  });
  return data.data ?? data;
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
    // histórico de custódia (array), como no GET /itens/:id/custodias — mais recente primeiro
    // custodia: { tipo, local_guarda, usuario, data_evento }
    // tipo ∈ ENTRADA | TRANSFERENCIA | SAIDA
    const custodias = [
      {
        id: 1,
        tipo: 'ENTRADA',
        local_guarda: 'Acervo B-12',
        usuario: 'Ana',
        data_evento: `${item.data_encontrado}T14:30:00`,
      },
    ];
    if (item.status === 'DEVOLVIDO') {
      custodias.unshift({
        id: 2,
        tipo: 'SAIDA',
        local_guarda: 'Balcão de atendimento',
        usuario: 'Ana',
        data_evento: '2026-10-03T10:00:00',
      });
    }
    return { ...item, custodias };
  }
  const { data } = await api.get(`/itens/${id}`);
  return data;
}

export async function criarItem(payload) {
  if (USE_MOCK) {
    await delay(300);
    const codigo = `ACH-2026-${String(nextCodigo++).padStart(4, '0')}`;
    const novo = {
      id: nextId++,
      codigo,
      status: 'RECEBIDO', // status inicial (o backend define isso)
      foto_url: '',
      observacoes: '',
      ...payload,
    };
    mockData.push(novo);
    return novo;
  }
  const { data } = await api.post('/itens', payload);
  return data;
}

export async function atualizarItem(id, payload) {
  const { data } = await api.put(`/itens/${id}`, payload);
  return data;
}

export async function excluirItem(id) {
  await api.delete(`/itens/${id}`);
}
