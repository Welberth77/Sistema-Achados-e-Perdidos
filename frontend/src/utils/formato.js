// Formata uma data-só (YYYY-MM-DD ou ISO) para DD/MM/YYYY, sem conversão de fuso.
export function dataBR(iso) {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso);
}
