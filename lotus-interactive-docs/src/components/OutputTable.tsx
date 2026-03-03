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
    <div className="overflow-hidden rounded border border-lotus-grey-700">
      <table className="min-w-full divide-y divide-lotus-grey-700">
        <thead className="bg-lotus-grey-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-lotus-grey-400 uppercase tracking-wider">
              Metric
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-lotus-grey-400 uppercase tracking-wider">
              {pdLabel}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-lotus-grey-400 uppercase tracking-wider">
              {noPdLabel}
            </th>
          </tr>
        </thead>
        <tbody className="bg-lotus-grey-900 divide-y divide-lotus-grey-700">
          {rows.map((row, i) => (
            <tr key={i} className={row.highlight ? 'bg-lotus-purple-900/20' : ''}>
              <td className="px-4 py-3 text-sm text-lotus-grey-200">{row.label}</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-lotus-grey-100">{row.pdValue}</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-lotus-grey-100">{row.noPdValue}</td>
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
    <div className="flex justify-between items-center py-2 border-b border-lotus-grey-700 last:border-b-0">
      <div>
        <span className="text-sm text-lotus-grey-200">{label}</span>
        {description && <p className="text-xs text-lotus-grey-400">{description}</p>}
      </div>
      <span className="text-sm font-mono text-lotus-grey-100">{value}</span>
    </div>
  );
}
