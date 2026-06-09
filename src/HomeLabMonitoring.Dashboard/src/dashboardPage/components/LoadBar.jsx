export default function LoadBar({ label, value, max, onClick }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0

  return (
    <div className="load-bar" onClick={onClick} role="button" tabIndex={0}>
      <span className="load-bar-value">{value?.toFixed(2) ?? '--'}</span>
      <div className="load-bar-track">
        <div className="load-bar-fill" style={{ height: `${pct * 100}%` }} />
      </div>
      <span className="load-bar-label">{label}</span>
    </div>
  )
}
