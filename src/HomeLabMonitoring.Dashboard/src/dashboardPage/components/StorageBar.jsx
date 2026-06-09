export default function StorageBar({ label, used, total, formatFn, onClick }) {
  const pct = total > 0 ? Math.min(used / total, 1) : 0
  const usedLabel = formatFn ? formatFn(used) : used
  const totalLabel = formatFn ? formatFn(total) : total

  return (
    <div className="storage-bar" onClick={onClick} role="button" tabIndex={0}>
      <div className="storage-bar-header">
        <span className="storage-bar-label">{label}</span>
        <span className="storage-bar-stats">{usedLabel} / {totalLabel}</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  )
}
