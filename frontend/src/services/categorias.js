import api from './api.js';

// Enquanto o backend não entrega os endpoints, use o mock.
// Quando estiver pronto, troque para false.
const USE_MOCK = true;

// Categorias iniciais — mesmas do seed.sql do banco.
let mockData = [
  { id: 1, nome: 'Eletrônicos' },
  { id: 2, nome: 'Documentos' },
  { id: 3, nome: 'Vestuário' },
  { id: 4, nome: 'Acessórios' },
  { id: 5, nome: 'Chaves' },
  { id: 6, nome: 'Material escolar' },
  { id: 7, nome: 'Outros' },
];
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listarCategorias() {
  if (USE_MOCK) {
    await delay(150);
    return [...mockData];
  }
  const { data } = await api.get('/categorias');
  // o backend devolve { data, meta }; a lista fica em data.data
  return data.data ?? data;
}
