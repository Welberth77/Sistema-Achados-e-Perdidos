import api from './api.js';

export async function listarUsuarios() {
  const { data } = await api.get('/usuarios');
  return data;
}
