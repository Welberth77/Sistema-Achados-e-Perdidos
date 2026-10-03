import api from './api.js';

// Enquanto o backend não entrega os endpoints, use o mock.
// Quando estiver pronto, troque para false.
const USE_MOCK = true;

// --- dados fake em memória ---
let mockData = [
  { id: 1, nome: 'Recepção Bloco A', identificacao: 'REC-A', contato: 'recepcaoA@exemplo.com', tipo: 'Portaria' },
  { id: 2, nome: 'Biblioteca Central', identificacao: 'BIB-01', contato: '(82) 99999-0000', tipo: 'Setor' },
];
let nextId = 3;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listarRegistradores({ q = '' } = {}) {
  if (USE_MOCK) {
    await delay(300);
    const termo = q.trim().toLowerCase();
    return mockData.filter(
      (r) =>
        !termo ||
        r.nome.toLowerCase().includes(termo) ||
        r.identificacao.toLowerCase().includes(termo)
    );
  }
  const { data } = await api.get('/registradores', { params: { q } });
  return data;
}

export async function criarRegistrador(payload) {
  if (USE_MOCK) {
    await delay(300);
    const existe = mockData.some(
      (r) => r.identificacao.toLowerCase() === payload.identificacao.trim().toLowerCase()
    );
    if (existe) {
      const err = new Error('Registrador já existe');
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