// columns: [{ key, header, render?, className? }]
// data: array de objetos | loading | onRowClick(row)
export default function Table({ columns = [], data = [], loading = false, onRowClick, emptyMessage = 'Nenhum registro encontrado.' }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-2 text-left font-semibold text-gray-700 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                Carregando...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={() => onRowClick?.(row)}
                className={`${onRowClick ? 'cursor-pointer' : ''} hover:bg-gray-50`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-2 ${col.className || ''}`}>
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