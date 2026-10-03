const styles = {
  achado: 'bg-blue-100 text-blue-800',
  em_custodia: 'bg-yellow-100 text-yellow-800',
  devolvido: 'bg-green-100 text-green-800',
  descartado: 'bg-gray-200 text-gray-700',
  doado: 'bg-purple-100 text-purple-800',
  expirado: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }) {
  const cls = styles[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {String(status || '').replace('_', ' ')}
    </span>
  );
}
