// Validações simples e reutilizáveis de formulário.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Telefone: dígitos e símbolos comuns ( ) + - e espaço, de 8 a 20 caracteres.
export const TEL_RE = /^[()+\d\s-]{8,20}$/;

// Domínios de e-mail aceitos no cadastro de usuário.
// Para liberar e-mails institucionais, acrescente o domínio aqui (ex.: 'aluno.ifpb.edu.br').
export const DOMINIOS_EMAIL = [
  'gmail.com',
  'hotmail.com',
  'hotmail.com.br',
  'outlook.com',
  'outlook.com.br',
  'yahoo.com',
  'yahoo.com.br',
  'live.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'bol.com.br',
  'uol.com.br',
  'terra.com.br',
  'alunos.afya.com.br'
];

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
// Relato de perda: a perda não pode ser mais antiga que este número de dias.
export const DIAS_MAX_RELATO = 365;

export function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

// Data (YYYY-MM-DD) de `dias` atrás, a partir de hoje.
export function dataISOhaDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 10);
}

export function emailValido(email) {
  return EMAIL_RE.test(String(email || '').trim());
}

// E-mail com formato válido E domínio na lista de provedores aceitos.
export function emailPermitido(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return false;
  const dominio = e.split('@')[1];
  return DOMINIOS_EMAIL.includes(dominio);
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

// Data do relato de perda: opcional; se preenchida, entre (hoje - DIAS_MAX_RELATO) e hoje.
export function dataRelatoValida(iso) {
  if (!iso) return true;
  return iso >= dataISOhaDias(DIAS_MAX_RELATO) && iso <= hojeISO();
}
