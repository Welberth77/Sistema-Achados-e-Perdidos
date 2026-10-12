// Rótulos e cores para o ciclo de vida do item/caso
const config = {
  achado: { label: 'Achado', cls: 'bg-blue-100 text-blue-800' },
  em_custodia: { label: 'Em custódia', cls: 'bg-yellow-100 text-yellow-800' },
  devolvido: { label: 'Devolvido', cls: 'bg-green-100 text-green-800' },
  descartado: { label: 'Descartado', cls: 'bg-gray-200 text-gray-700' },
  doado: { label: 'Doado', cls: 'bg-purple-100 text-purple-800' },
  expirado: { label: 'Expirado', cls: 'bg-red-100 text-red-800' },
  aberto: { label: 'Aberto', cls: 'bg-blue-100 text-blue-800' },
  encerrado: { label: 'Encerrado', cls: 'bg-gray-200 text-gray-700' },
};

export default function StatusBadge({ status }) {
  const item = config[status] || { label: String(status || '—'), cls: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${item.cls}`}>
      {item.label}
    </span>
  );
}