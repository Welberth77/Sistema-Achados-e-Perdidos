import api from './api.js';

export async function listarTodasPaginas(caminho, filtros = {}) {
  const params = Object.fromEntries(
    Object.entries(filtros).filter(
      ([, valor]) => valor !== '' && valor !== null && valor !== undefined
    )
  );

  const registros = [];
  let page = 1;
  let totalPages = 1;

  do {
    const { data } = await api.get(caminho, {
      params: { ...params, page, limit: 100 },
    });

    if (
      !Array.isArray(data.data) ||
      !data.meta ||
      !Number.isSafeInteger(data.meta.totalPages) ||
      data.meta.totalPages < 0
    ) {
      throw new Error('Resposta de listagem inválida.');
    }

    registros.push(...data.data);
    totalPages = data.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return registros;
}
