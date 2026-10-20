// Validações simples e reutilizáveis de formulário.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Telefone: dígitos e símbolos comuns ( ) + - e espaço, de 8 a 20 caracteres.
export const TEL_RE = /^[()+\d\s-]{8,20}$/;

// Limites de tamanho — alinhados às colunas do banco (evita dados exorbitantes).
export const LIM = {
  nome: 120,
  email: 160,
  senha: 72, // bcrypt ignora além de 72 bytes
  titulo: 160,
  descricao: 1000,
  cor: 40,
  marca: 60,
  local: 160,
  matricula: 40,
  documento: 40,
  telefone: 30,
  observacoes: 1000,
  termo: 120,
};

export const DATA_MIN = '2000-01-01';

export function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export function emailValido(email) {
  return EMAIL_RE.test(String(email || '').trim());
}

export function soDigitos(s) {
  return String(s || '').replace(/\D/g, '');
}

// Telefone opcional: vazio é válido; se preenchido, precisa ter formato plausível.
export function telefoneValido(tel) {
  const t = String(tel || '').trim();
  return t === '' || TEL_RE.test(t);
}

// Documento conforme o tipo (vazio é válido).
export function documentoValido(tipo, doc) {
  const bruto = String(doc || '').trim();
  if (bruto === '') return true;
  const n = soDigitos(doc).length;
  if (tipo === 'CPF') return n === 11;
  if (tipo === 'RG') return n >= 5 && n <= 14;
  return bruto.length <= LIM.documento;
}

// true se o texto está dentro do limite de caracteres.
export function noMax(valor, max) {
  return String(valor || '').length <= max;
}

// Data dentro do intervalo [DATA_MIN, hoje] (vazio é válido).
export function dataPlausivel(iso) {
  if (!iso) return true;
  return iso >= DATA_MIN && iso <= hojeISO();
}
