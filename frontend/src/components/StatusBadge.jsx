// Rótulos e cores dos status — valores em MAIÚSCULAS, iguais aos CHECKs do banco.
// Abrange item, relato, caso e devolução (status compartilhados usam a mesma cor).
const config = {
  // itens_achados
  RECEBIDO: { label: 'Recebido', cls: 'bg-blue-100 text-blue-800' },
  EM_CUSTODIA: { label: 'Em custódia', cls: 'bg-yellow-100 text-yellow-800' },
  EM_ANALISE: { label: 'Em análise', cls: 'bg-indigo-100 text-indigo-800' },
  EM_DEVOLUCAO: { label: 'Em devolução', cls: 'bg-orange-100 text-orange-800' },
  DEVOLVIDO: { label: 'Devolvido', cls: 'bg-green-100 text-green-800' },
  DESCARTADO: { label: 'Descartado', cls: 'bg-gray-200 text-gray-700' },

  // relatos_perda
  ABERTO: { label: 'Aberto', cls: 'bg-blue-100 text-blue-800' },
  CORRESPONDENCIA: { label: 'Correspondência', cls: 'bg-purple-100 text-purple-800' },
  ENCERRADO: { label: 'Encerrado', cls: 'bg-gray-200 text-gray-700' },
  CANCELADO: { label: 'Cancelado', cls: 'bg-red-100 text-red-800' },

  // casos
  AGUARDANDO_COMPROVACAO: { label: 'Aguardando comprovação', cls: 'bg-yellow-100 text-yellow-800' },
  AUTORIZADO: { label: 'Autorizado', cls: 'bg-teal-100 text-teal-800' },

  // devolucoes
  INICIADA: { label: 'Iniciada', cls: 'bg-blue-100 text-blue-800' },
  PROPRIEDADE_COMPROVADA: { label: 'Propriedade comprovada', cls: 'bg-teal-100 text-teal-800' },
  AUTORIZADA: { label: 'Autorizada', cls: 'bg-teal-100 text-teal-800' },
  CONCLUIDA: { label: 'Concluída', cls: 'bg-green-100 text-green-800' },
  CANCELADA: { label: 'Cancelada', cls: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }) {
  const item = config[status] || { label: String(status || '—'), cls: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${item.cls}`}>
      {item.label}
    </span>
  );
}
