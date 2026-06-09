import { useState, useEffect } from 'react'
import SemiCircleGauge from './components/SemiCircleGauge'
import StorageBar from './components/StorageBar'
import LoadBar from './components/LoadBar'
import HistoryModal from './components/HistoryModal'
import './metricDashboard.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://192.168.2.233:8091'
const GBPS_BYTES = 125 * 1024 * 1024

function formatBytes(bytes) {
  if (bytes == null || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0, v = bytes
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(1)} ${units[i]}`
}

function formatUptime(seconds) {
  if (!seconds) return '--'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function MetricDashboard() {
  const [host, setHost] = useState(null)
  const [disks, setDisks] = useState([])
  const [selected, setSelected] = useState(null)
  const [fetchError, setFetchError] = useState(false)

  async function fetchData() {
    try {
      const [hostsRes, diskRes] = await Promise.all([
        fetch(`${API_URL}/api/metrics/hosts`),
        fetch(`${API_URL}/api/metrics/disk`),
      ])
      if (hostsRes.ok) setHost(await hostsRes.json())
      if (diskRes.ok) {
        const raw = await diskRes.json()
        const byMount = {}
        raw.forEach(d => {
          if (!byMount[d.mountPoint] || new Date(d.collectedAt) > new Date(byMount[d.mountPoint].collectedAt)) {
            byMount[d.mountPoint] = d
          }
        })
        // Deduplicate mounts that share the same underlying filesystem
        // (e.g. bind mounts or storage pools reporting identical total+free)
        const seen = new Set()
        const deduped = Object.values(byMount).filter(d => {
          const key = `${d.diskTotal}:${d.diskAvailable}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setDisks(deduped)
      }
      setFetchError(false)
    } catch {
      setFetchError(true)
    }
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 30000)
    return () => clearInterval(id)
  }, [])

  const cpu = host?.cpu ?? 0
  const ramUsed = host?.memoryUsed ?? 0
  const ramTotal = host?.memoryTotal ?? 1
  const ramPct = (ramUsed / ramTotal) * 100
  const dlSpeed = host?.networkDownloadSpeed ?? 0
  const ulSpeed = host?.networkUploadSpeed ?? 0
  const uptime = host?.uptime ?? 0
  const load1m = host?.loadAverage1m ?? 0
  const load5m = host?.loadAverage5m ?? 0
  const load15m = host?.loadAverage15m ?? 0

  const totalDiskTotal = disks.reduce((s, d) => s + d.diskTotal, 0)
  const totalDiskUsed = disks.reduce((s, d) => s + (d.diskTotal - d.diskAvailable), 0)

  const loadMax = Math.max(4, Math.ceil(Math.max(load1m, load5m, load15m) * 1.5))

  return (
    <div className="dashboard">
      {fetchError && <div className="dashboard-error">Cannot reach API at {API_URL}</div>}

      {/* ── Uptime — top-right corner ── */}
      <div
        className="uptime-corner"
        onClick={() => setSelected({ type: 'host', field: 'uptime', label: 'Uptime', unit: 's' })}
        role="button"
        tabIndex={0}
      >
        <span className="gauge-label">Uptime</span>
        <span className="uptime-value">{formatUptime(uptime)}</span>
      </div>

      <div className="dashboard-card">
        {/* ── Gauges ── */}
        <div className="gauges-row">
          <SemiCircleGauge
            label="CPU"
            value={cpu}
            max={100}
            displayValue={`${cpu.toFixed(1)}%`}
            onClick={() => setSelected({ type: 'host', field: 'cpu', label: 'CPU', unit: '%' })}
          />
          <SemiCircleGauge
            label="RAM"
            value={ramPct}
            max={100}
            displayValue={`${ramPct.toFixed(1)}%`}
            onClick={() => setSelected({ type: 'host', field: 'memoryUsed', label: 'RAM', unit: 'bytes' })}
          />
          <SemiCircleGauge
            label="DownloadSpeed"
            value={dlSpeed}
            max={GBPS_BYTES}
            displayValue={`${formatBytes(dlSpeed)}/s`}
            onClick={() => setSelected({ type: 'host', field: 'networkDownloadSpeed', label: 'Download Speed', unit: 'B/s' })}
          />
          <SemiCircleGauge
            label="UploadSpeed"
            value={ulSpeed}
            max={GBPS_BYTES}
            displayValue={`${formatBytes(ulSpeed)}/s`}
            onClick={() => setSelected({ type: 'host', field: 'networkUploadSpeed', label: 'Upload Speed', unit: 'B/s' })}
          />
        </div>

        {/* ── Storage ── */}
        <div className="section">
          <StorageBar
            label="Total Storage space"
            used={totalDiskUsed}
            total={totalDiskTotal}
            formatFn={formatBytes}
            onClick={() => setSelected({ type: 'disk-total', label: 'Total Storage', unit: 'bytes' })}
          />
          {disks.map((disk, i) => (
            <StorageBar
              key={disk.mountPoint}
              label={`Disk ${i + 1}  (${disk.mountPoint})`}
              used={disk.diskTotal - disk.diskAvailable}
              total={disk.diskTotal}
              formatFn={formatBytes}
              onClick={() => setSelected({
                type: 'disk',
                field: 'diskAvailable',
                label: `Disk ${i + 1} (${disk.mountPoint})`,
                mountPoint: disk.mountPoint,
                unit: 'bytes',
              })}
            />
          ))}
        </div>

        {/* ── Load Average ── */}
        <div className="section section-load">
          <div className="section-label">Load Average</div>
          <div className="load-bars-row">
            <LoadBar
              label="1m"
              value={load1m}
              max={loadMax}
              onClick={() => setSelected({ type: 'host', field: 'loadAverage1m', label: 'Load Average 1m', unit: '' })}
            />
            <LoadBar
              label="5m"
              value={load5m}
              max={loadMax}
              onClick={() => setSelected({ type: 'host', field: 'loadAverage5m', label: 'Load Average 5m', unit: '' })}
            />
            <LoadBar
              label="15m"
              value={load15m}
              max={loadMax}
              onClick={() => setSelected({ type: 'host', field: 'loadAverage15m', label: 'Load Average 15m', unit: '' })}
            />
          </div>
        </div>

        {/* ── Network Totals ── */}
        <div className="network-totals">
          <div
            className="network-total-item"
            onClick={() => setSelected({ type: 'host', field: 'networkDownload', label: 'Total Download', unit: 'bytes' })}
            role="button"
            tabIndex={0}
          >
            <div className="network-total-label">Total Download</div>
            <div className="network-total-value">{formatBytes(host?.networkDownload)}</div>
          </div>
          <div
            className="network-total-item"
            onClick={() => setSelected({ type: 'host', field: 'networkUpload', label: 'Total Upload', unit: 'bytes' })}
            role="button"
            tabIndex={0}
          >
            <div className="network-total-label">Total Upload</div>
            <div className="network-total-value">{formatBytes(host?.networkUpload)}</div>
          </div>
        </div>
      </div>

      {selected && (
        <HistoryModal metric={selected} apiUrl={API_URL} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
