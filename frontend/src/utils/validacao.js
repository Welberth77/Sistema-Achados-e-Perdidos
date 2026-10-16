// Validações simples e reutilizáveis de formulário.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValido(email) {
  return EMAIL_RE.test(String(email || '').trim());
}
