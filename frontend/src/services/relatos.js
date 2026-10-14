import api from './api.js';

// Enquanto o backend não entrega os endpoints, use o mock.
// Quando estiver pronto, troque para false.
const USE_MOCK = true;

// relato de perda (campos do contrato/banco):
// { id, codigo, titulo, descricao, categoria_id, cor, marca, local_perda,
//   data_perda, registrador_id, status, observacoes }
// + objetos aninhados `categoria` e `registrador` para exibição.
// status ∈ ABERTO | EM_ANALISE | CORRESPONDENCIA | ENCERRADO | CANCELADO
let mockData = [
  {
    id: 1,
    codigo: 'REL-2026-0001',
    titulo: 'Mochila preta',
    descricao: 'Perdida na biblioteca, com chaveiro',
    categoria_id: 4,
    categoria: { id: 4, nome: 'Acessórios' },
    cor: 'Preta',
    marca: 'X',
    local_perda: 'Biblioteca',
    data_perda: '2026-10-01',
    registrador_id: 1,
    registrador: { id: 1, nome: 'João da Silva' },
    status: 'CORRESPONDENCIA',
    observacoes: '',
  },
  {
    id: 2,
    codigo: 'REL-2026-0002',
    titulo: 'Guarda-chuva azul',
    descricao: 'Esquecido na sala 203',
    categoria_id: 7,
    categoria: { id: 7, nome: 'Outros' },
    cor: 'Azul',
    marca: '',
    local_perda: 'Sala 203',
    data_perda: '2026-10-05',
    registrador_id: 2,
    registrador: { id: 2, nome: 'Maria Souza' },
    status: 'ABERTO',
    observacoes: '',
  },
];
let nextId = 3;
let nextCodigo = 3;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// correspondências sugeridas (item achado <-> relato). Chaveadas por relato.
// item: resumo do item achado para exibição.
const mockCorrespondencias = {
  1: [
    {
      id: 1,
      item_achado_id: 1,
      item: { id: 1, codigo: 'ACH-2026-0001', titulo: 'Mochila preta' },
      pontuacao: 92.5,
      status: 'SUGERIDA',
    },
  ],
};

export async function listarRelatos({ q = '', status = '', categoria_id = '' } = {}) {
  if (USE_MOCK) {
    await delay(300);
    const termo = q.trim().toLowerCase();
    return mockData.filter(
      (r) =>
        (!termo ||
          r.titulo.toLowerCase().includes(termo) ||
          (r.descricao || '').toLowerCase().includes(termo)) &&
        (!status || r.status === status) &&
        (!categoria_id || String(r.categoria_id) === String(categoria_id))
    );
  }
  const { data } = await api.get('/relatos', { params: { q, status, categoria_id } });
  return data.data ?? data;
}

export async function obterRelato(id) {
  if (USE_MOCK) {
    await delay(300);
    const relato = mockData.find((r) => String(r.id) === String(id));
    if (!relato) {
      const err = new Error('Relato não encontrado');
      err.status = 404;
      throw err;
    }
    return { ...relato };
  }
  const { data } = await api.get(`/relatos/${id}`);
  return data;
}

export async function listarCorrespondenciasRelato(id) {
  if (USE_MOCK) {
    await delay(300);
    return mockCorrespondencias[id] || [];
  }
  const { data } = await api.get(`/relatos/${id}/correspondencias`);
  return data.data ?? data;
}

export async function criarRelato(payload) {
  if (USE_MOCK) {
    await delay(300);
    const codigo = `REL-2026-${String(nextCodigo++).padStart(4, '0')}`;
    const novo = {
      id: nextId++,
      codigo,
      status: 'ABERTO', // status inicial (o backend define isso)
      observacoes: '',
      ...payload,
    };
    mockData.push(novo);
    return novo;
  }
  const { data } = await api.post('/relatos', payload);
  return data;
}
