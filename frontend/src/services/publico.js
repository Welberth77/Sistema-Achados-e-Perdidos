import api from './api.js';

// Catálogo PÚBLICO: só o mínimo para alguém reconhecer que o item pode estar guardado.
// Detalhes completos exigem login — evita que um falso reclamante use os detalhes como "prova".
const USE_MOCK = true;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const CATEGORIAS_PUBLICAS = [
  'Eletrônicos',
  'Documentos',
  'Vestuário',
  'Acessórios',
  'Chaves',
  'Material escolar',
  'Outros',
];

const MOCK = [
  { id: 1, categoria: 'Eletrônicos', local: 'Biblioteca Central', data: '2026-10-06' },
  { id: 2, categoria: 'Vestuário', local: 'Quadra poliesportiva', data: '2026-10-02' },
  { id: 3, categoria: 'Acessórios', local: 'Bloco A — 2º andar', data: '2026-09-28' },
  { id: 4, categoria: 'Chaves', local: 'Estacionamento', data: '2026-10-11' },
  { id: 5, categoria: 'Documentos', local: 'Cantina', data: '2026-10-09' },
  { id: 6, categoria: 'Material escolar', local: 'Sala 203', data: '2026-10-05' },
];

export async function listarCatalogoPublico({ categoria = '' } = {}) {
  if (USE_MOCK) {
    await delay(300);
    return MOCK.filter((i) => !categoria || i.categoria === categoria);
  }
  const { data } = await api.get('/publico/itens', { params: { categoria } });
  return data.data ?? data;
}
