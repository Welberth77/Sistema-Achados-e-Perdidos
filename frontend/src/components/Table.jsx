import { useMemo, useState } from 'react';

function Seta({ dir }) {
  return (
    <span aria-hidden="true" className="ml-1 inline-block text-[10px] opacity-70">
      {dir === 'asc' ? '▲' : dir === 'desc' ? '▼' : '↕'}
    </span>
  );
}

function valor(col, row) {
  return col.sortValue ? col.sortValue(row) : row[col.key];
}

function comparar(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'pt-BR', { numeric: true, sensitivity: 'base' });
}

// columns: [{ key, header, render?, className?, sortable?, sortValue?(row) }]
export default function Table({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado.',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const ordenavel = (col) => col.sortable !== false && col.key !== 'acoes';

  function ordenar(col) {
    if (!ordenavel(col)) return;
    if (sortKey === col.key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  }

  const linhas = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;
    return [...data].sort((ra, rb) => {
      const r = comparar(valor(col, ra), valor(col, rb));
      return sortDir === 'asc' ? r : -r;
    });
  }, [data, columns, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-2 text-left">
            {columns.map((col) => (
              <th key={col.key} scope="col" className={`px-4 py-2.5 text-xs font-semibold text-muted ${col.className || ''}`}>
                {ordenavel(col) ? (
                  <button
                    type="button"
                    onClick={() => ordenar(col)}
                    className="inline-flex items-center font-semibold uppercase tracking-wide hover:text-fg focus:outline-none focus-visible:underline"
                    aria-label={`Ordenar por ${col.header}`}
                  >
                    {col.header}
                    <Seta dir={sortKey === col.key ? sortDir : null} />
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted">Carregando…</td></tr>
          ) : linhas.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted">{emptyMessage}</td></tr>
          ) : (
            linhas.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors hover:bg-surface-2 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-fg ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
