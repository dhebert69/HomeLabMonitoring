const W = 160
const STROKE = 10
const R = W / 2 - STROKE / 2 - 2
const CX = W / 2
const CY = W / 2
const ARC_LEN = Math.PI * R

const startX = CX - R
const endX = CX + R
const arcPath = `M ${startX} ${CY} A ${R} ${R} 0 0 1 ${endX} ${CY}`
const svgH = CY + STROKE / 2 + 2

export default function SemiCircleGauge({ label, value, max, displayValue, onClick }) {
  const pct = Math.min(Math.max(value / max, 0), 1)
  const dashOffset = ARC_LEN * (1 - pct)

  return (
    <div className="gauge" onClick={onClick} role="button" tabIndex={0}>
      <span className="gauge-label">{label}</span>
      <svg width={W} height={svgH} viewBox={`0 0 ${W} ${svgH}`}>
        <path d={arcPath} fill="none" stroke="#2a2d36" strokeWidth={STROKE} strokeLinecap="round" />
        <path
          d={arcPath}
          fill="none"
          stroke="#4ade80"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${ARC_LEN} ${ARC_LEN}`}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="gauge-value">{displayValue ?? '--'}</span>
    </div>
  )
}
