import api from './api.js';
import { listarTodasPaginas } from './listagem.js';

export async function listarItens(filtros = {}) {
  return listarTodasPaginas('/itens', filtros);
}

export async function obterItem(id) {
  const { data } = await api.get(`/itens/${id}`);
  return data;
}

function dadosItem(payload) {
  const campos = [
    'titulo',
    'descricao',
    'categoria_id',
    'cor',
    'marca',
    'local_encontrado',
    'data_encontrado',
    'registrador_id',
    'foto_url',
    'observacoes',
  ];

  return Object.fromEntries(
    campos
      .filter((campo) => payload[campo] !== undefined)
      .map((campo) => [campo, payload[campo] === '' ? null : payload[campo]])
  );
}

export async function criarItem(payload) {
  const { data } = await api.post('/itens', dadosItem(payload));
  return data;
}

export async function atualizarItem(id, payload) {
  const { data } = await api.put(`/itens/${id}`, dadosItem(payload));
  return data;
}
