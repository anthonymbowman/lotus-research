interface OutputRow {
  label: string;
  pdValue: string;
  noPdValue: string;
  highlight?: boolean;
}

interface OutputTableProps {
  rows: OutputRow[];
  pdLabel?: string;
  noPdLabel?: string;
}

/**
 * Table comparing PD vs no PD values
 */
export function OutputTable({ rows, pdLabel = 'With PD', noPdLabel = 'Without PD' }: OutputTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Metric
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {pdLabel}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {noPdLabel}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, i) => (
            <tr key={i} className={row.highlight ? 'bg-indigo-50' : ''}>
              <td className="px-4 py-3 text-sm text-gray-700">{row.label}</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">{row.pdValue}</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">{row.noPdValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SingleValueRowProps {
  label: string;
  value: string;
  description?: string;
}

export function SingleValueRow({ label, value, description }: SingleValueRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <span className="text-sm font-mono text-gray-900">{value}</span>
    </div>
  );
}
