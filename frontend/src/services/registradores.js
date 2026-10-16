import api from './api.js';

// Enquanto o backend não entrega os endpoints, use o mock.
// Quando estiver pronto, troque para false.
const USE_MOCK = false;

// --- dados fake em memória (mesmos campos do contrato/banco) ---
// registrador: { id, nome, vinculo, matricula, tipo_documento, documento,
//                telefone, email, observacoes }
// vinculo        ∈ ALUNO | DOCENTE | TERCEIRIZADO | SERVIDOR | OUTRO
// tipo_documento ∈ CPF | RG | OUTRO
let mockData = [
  {
    id: 1,
    nome: 'João da Silva',
    vinculo: 'ALUNO',
    matricula: '2021001',
    tipo_documento: 'CPF',
    documento: '123.456.789-00',
    telefone: '(85) 99999-0001',
    email: 'joao@aluno.edu',
    observacoes: '',
  },
  {
    id: 2,
    nome: 'Maria Souza',
    vinculo: 'DOCENTE',
    matricula: 'SIAPE-4455',
    tipo_documento: 'RG',
    documento: '2.345.678',
    telefone: '(85) 98888-0002',
    email: 'maria@docente.edu',
    observacoes: '',
  },
];
let nextId = 3;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listarRegistradores({ q = '', vinculo = '' } = {}) {
  if (USE_MOCK) {
    await delay(300);
    const termo = q.trim().toLowerCase();
    return mockData.filter(
      (r) =>
        (!termo ||
          r.nome.toLowerCase().includes(termo) ||
          (r.documento || '').toLowerCase().includes(termo) ||
          (r.matricula || '').toLowerCase().includes(termo)) &&
        (!vinculo || r.vinculo === vinculo)
    );
  }
  const { data } = await api.get('/registradores', { params: { q, vinculo } });
  return data.data ?? data;
}

export async function criarRegistrador(payload) {
  if (USE_MOCK) {
    await delay(300);
    // o banco tem UNIQUE (tipo_documento, documento)
    const existe = mockData.some(
      (r) =>
        r.documento &&
        payload.documento &&
        r.tipo_documento === payload.tipo_documento &&
        r.documento.trim().toLowerCase() === payload.documento.trim().toLowerCase()
    );
    if (existe) {
      const err = new Error('Registrador com esse documento já existe');
      err.status = 409;
      throw err;
    }
    const novo = { id: nextId++, ...payload };
    mockData.push(novo);
    return novo;
  }
  const { data } = await api.post('/registradores', payload);
  return data;
}
