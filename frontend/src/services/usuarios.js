import api from './api.js';

export async function listarUsuarios() {
  const { data } = await api.get('/usuarios');
  return data;
}

// Altera o perfil (papel) de um usuário. papel ∈ ADMINISTRADOR | SERVIDOR | USUARIO
export async function alterarPapel(id, papel) {
  const { data } = await api.patch(`/usuarios/${id}/papel`, { papel });
  return data;
}

// Exclui um usuário.
export async function excluirUsuario(id) {
  await api.delete(`/usuarios/${id}`);
}
