import api from './api.js';
import { listarTodasPaginas } from './listagem.js';

export async function listarRelatos(filtros = {}) {
  return listarTodasPaginas('/relatos', filtros);
}

export async function obterRelato(id) {
  const { data } = await api.get(`/relatos/${id}`);
  return data;
}

export async function listarCorrespondenciasRelato(id) {
  return listarTodasPaginas(`/relatos/${id}/correspondencias`);
}

function dadosRelato(payload) {
  const campos = [
    'titulo',
    'descricao',
    'categoria_id',
    'cor',
    'marca',
    'local_perda',
    'data_perda',
    'registrador_id',
    'observacoes',
  ];

  return Object.fromEntries(
    campos
      .filter((campo) => payload[campo] !== undefined)
      .map((campo) => [campo, payload[campo] === '' ? null : payload[campo]])
  );
}

export async function criarRelato(payload) {
  const { data } = await api.post('/relatos', dadosRelato(payload));
  return data;
}

export async function atualizarRelato(id, payload) {
  const { data } = await api.put(`/relatos/${id}`, dadosRelato(payload));
  return data;
}
