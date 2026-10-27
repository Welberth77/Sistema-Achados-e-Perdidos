// columns: [{ key, header, render?, className? }] · data: array · onRowClick(row)
export default function Table({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado.',
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-2 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-2.5 text-xs font-semibold text-muted ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-muted">
                Carregando…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
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
