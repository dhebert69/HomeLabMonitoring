import { useState, useEffect, useCallback } from 'react'

const TIME_RANGES = [
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '6h', minutes: 360 },
  { label: '24h', minutes: 1440 },
]

function formatBytes(bytes) {
  if (bytes == null || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0, v = bytes
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(1)} ${units[i]}`
}

function formatY(value, unit) {
  if (unit === '%') return `${value.toFixed(1)}%`
  if (unit === 'bytes' || unit === 'B/s') return formatBytes(value)
  if (unit === 's') {
    const h = Math.floor(value / 3600)
    const d = Math.floor(value / 86400)
    return d > 0 ? `${d}d` : `${h}h`
  }
  return value.toFixed(2)
}

function formatAxisTime(dateStr, rangeMinutes) {
  const d = new Date(dateStr)
  if (rangeMinutes <= 60) {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  return `${(d.getMonth() + 1)}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}h`
}

function LineChart({ data, valueKey, unit, rangeMinutes }) {
  const W = 1000
  const H = 360
  const PAD = { top: 24, right: 20, bottom: 44, left: 64 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom

  if (data.length < 2) {
    return <div className="chart-empty">Not enough data</div>
  }

  const values = data.map(d => d[valueKey] ?? 0)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const vRange = maxV - minV || 1

  const times = data.map(d => new Date(d.collectedAt).getTime())
  const minT = times[0]
  const maxT = times[times.length - 1]
  const tRange = maxT - minT || 1

  const toX = t => PAD.left + ((t - minT) / tRange) * cW
  const toY = v => PAD.top + cH - ((v - minV) / vRange) * cH

  const points = data.map((d, i) => `${toX(times[i])},${toY(values[i])}`).join(' ')
  const areaPoints = `${PAD.left},${PAD.top + cH} ${points} ${toX(times[times.length - 1])},${PAD.top + cH}`

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => minV + vRange * pct)

  // Pick ~4 evenly spaced x labels
  const xLabelCount = 4
  const xLabelIndices = Array.from({ length: xLabelCount }, (_, i) =>
    Math.round((i / (xLabelCount - 1)) * (data.length - 1))
  )

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gridlines + Y labels */}
      {yTicks.map((v, i) => {
        const y = toY(v)
        return (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#2a2d36" strokeWidth={1} />
            <text x={PAD.left - 8} y={y} fill="#6b7280" fontSize="13" textAnchor="end" dominantBaseline="middle">
              {formatY(v, unit)}
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      <polygon points={areaPoints} fill="url(#areaGrad)" />

      {/* Line */}
      <polyline points={points} fill="none" stroke="#4ade80" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {/* X axis labels */}
      {xLabelIndices.map(idx => (
        <text
          key={idx}
          x={toX(times[idx])}
          y={H - 8}
          fill="#6b7280"
          fontSize="13"
          textAnchor="middle"
        >
          {formatAxisTime(data[idx].collectedAt, rangeMinutes)}
        </text>
      ))}
    </svg>
  )
}

export default function HistoryModal({ metric, apiUrl, onClose }) {
  const [range, setRange] = useState(TIME_RANGES[1])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const isDisk = metric.type === 'disk' || metric.type === 'disk-total'
      const url = isDisk
        ? `${apiUrl}/api/metrics/disk/history?minutes=${range.minutes}`
        : `${apiUrl}/api/metrics/hosts/history?minutes=${range.minutes}`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Request failed')
      let raw = await res.json()

      if (metric.type === 'disk' && metric.mountPoint) {
        raw = raw.filter(d => d.mountPoint === metric.mountPoint)
      }

      if (metric.type === 'disk-total') {
        const grouped = {}
        raw.forEach(d => {
          const t = d.collectedAt
          if (!grouped[t]) grouped[t] = { collectedAt: t, used: 0, total: 0 }
          grouped[t].used += d.diskTotal - d.diskAvailable
          grouped[t].total += d.diskTotal
        })
        raw = Object.values(grouped)
      }

      raw.sort((a, b) => new Date(a.collectedAt) - new Date(b.collectedAt))
      setData(raw)
    } catch {
      setError('Failed to load history')
    }
    setLoading(false)
  }, [metric, range, apiUrl])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const valueKey = metric.type === 'disk' ? '_used' : metric.type === 'disk-total' ? 'used' : metric.field
  const chartData = metric.type === 'disk'
    ? data.map(d => ({ ...d, _used: d.diskTotal - d.diskAvailable }))
    : data

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{metric.label} History</h3>
          <div className="time-range-tabs">
            {TIME_RANGES.map(r => (
              <button
                key={r.label}
                className={`time-tab${r === range ? ' active' : ''}`}
                onClick={() => setRange(r)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {loading && <div className="chart-empty">Loading...</div>}
          {!loading && error && <div className="chart-empty">{error}</div>}
          {!loading && !error && (
            <LineChart
              data={chartData}
              valueKey={valueKey}
              unit={metric.unit}
              rangeMinutes={range.minutes}
            />
          )}
        </div>
      </div>
    </div>
  )
}
