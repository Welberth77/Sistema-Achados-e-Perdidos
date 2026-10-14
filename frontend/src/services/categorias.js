import { listarTodasPaginas } from './listagem.js';

export async function listarCategorias() {
  const categorias = await listarTodasPaginas('/categorias');
  return categorias.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}
