import './dockerPage.css'

const MOCK_CONTAINERS = [
  { id: '1', name: 'radarr', image: 'linuxserver/radarr:latest', status: 'running', uptime: '12d 4h', ports: '7878' },
  { id: '2', name: 'sonarr', image: 'linuxserver/sonarr:latest', status: 'running', uptime: '12d 4h', ports: '8989' },
  { id: '3', name: 'qbittorrent', image: 'linuxserver/qbittorrent:latest', status: 'running', uptime: '12d 4h', ports: '8080' },
  { id: '4', name: 'pihole', image: 'pihole/pihole:latest', status: 'running', uptime: '22d 2h', ports: '53, 80' },
  { id: '5', name: 'nginx-proxy', image: 'nginxproxymanager/nginx-proxy-manager:latest', status: 'stopped', uptime: '--', ports: '80, 443' },
]

export default function DockerPage() {
  return (
    <div className="docker-page">
      <div className="docker-header">
        <h1 className="docker-title">Docker</h1>
        <span className="coming-soon-tag">Available in Phase 2</span>
      </div>

      <div className="docker-preview">
        <p className="preview-note">
          Preview of the container management view — actions and live logs will be wired up when the DockerController is implemented.
        </p>

        <table className="container-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Image</th>
              <th>Status</th>
              <th>Uptime</th>
              <th>Ports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CONTAINERS.map(c => (
              <tr key={c.id}>
                <td className="container-name">{c.name}</td>
                <td className="container-image">{c.image}</td>
                <td>
                  <span className={`status-dot ${c.status}`} />
                  <span className="status-label">{c.status}</span>
                </td>
                <td className="container-uptime">{c.uptime}</td>
                <td className="container-ports">{c.ports}</td>
                <td className="container-actions">
                  <button className="action-btn" disabled title="Start">▶</button>
                  <button className="action-btn" disabled title="Stop">■</button>
                  <button className="action-btn" disabled title="Restart">↺</button>
                  <button className="action-btn action-btn--danger" disabled title="Delete">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="log-preview">
          <div className="log-preview-header">
            <span>Container Logs</span>
            <span className="log-preview-note">static · live SSE stream coming in Phase 2</span>
          </div>
          <div className="log-preview-body">
            <span className="log-line"><span className="log-time">2026-06-09 07:31:02</span> [Info] radarr — Checking for new movies…</span>
            <span className="log-line"><span className="log-time">2026-06-09 07:31:05</span> [Info] sonarr — RSS sync complete</span>
            <span className="log-line"><span className="log-time">2026-06-09 07:31:10</span> [Info] qbittorrent — 3 torrents active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
