import api from './api.js';
import { listarTodasPaginas } from './listagem.js';

export async function listarRegistradores(filtros = {}) {
  return listarTodasPaginas('/registradores', filtros);
}

export async function obterRegistrador(id) {
  const { data } = await api.get(`/registradores/${id}`);
  return data;
}

function dadosRegistrador(payload) {
  const campos = [
    'nome',
    'vinculo',
    'matricula',
    'tipo_documento',
    'documento',
    'telefone',
    'email',
    'observacoes',
  ];

  const dados = Object.fromEntries(
    campos
      .filter((campo) => payload[campo] !== undefined)
      .map((campo) => [
        campo,
        typeof payload[campo] === 'string' ? payload[campo].trim() || null : payload[campo],
      ])
  );

  if (!dados.documento) {
    dados.documento = null;
    dados.tipo_documento = null;
  }

  return dados;
}

export async function criarRegistrador(payload) {
  const { data } = await api.post('/registradores', dadosRegistrador(payload));
  return data;
}

export async function atualizarRegistrador(id, payload) {
  const { data } = await api.put(`/registradores/${id}`, dadosRegistrador(payload));
  return data;
}
