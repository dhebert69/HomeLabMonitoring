import './activityPage.css'

const SOURCES = ['All', 'Radarr', 'Sonarr', 'qBittorrent', 'Pi-hole', 'Backup']

const MOCK_EVENTS = [
  { id: 1, source: 'Radarr', category: 'download', icon: '🎬', time: '07:31', message: 'Inception (2010) — download complete' },
  { id: 2, source: 'Sonarr', category: 'download', icon: '📺', time: '07:15', message: 'Breaking Bad S05E14 — grabbed from indexer' },
  { id: 3, source: 'qBittorrent', category: 'torrent', icon: '⬇', time: '07:10', message: '3 torrents active · 12.4 MB/s' },
  { id: 4, source: 'Pi-hole', category: 'dns', icon: '🛡', time: '07:00', message: '1,243 queries blocked in the last hour' },
  { id: 5, source: 'Backup', category: 'backup', icon: '💾', time: '03:00', message: 'Nightly backup completed — 2.1 GB' },
  { id: 6, source: 'Radarr', category: 'import', icon: '🎬', time: '02:45', message: 'Dune Part Two (2024) — imported successfully' },
  { id: 7, source: 'Sonarr', category: 'import', icon: '📺', time: '02:30', message: 'The Bear S03E01-08 — imported successfully' },
]

export default function ActivityPage() {
  return (
    <div className="activity-page">
      <div className="activity-header">
        <h1 className="activity-title">Activity Feed</h1>
        <span className="coming-soon-tag">Available in Phase 3</span>
      </div>

      <div className="activity-filters">
        {SOURCES.map(s => (
          <button key={s} className={`filter-chip${s === 'All' ? ' active' : ''}`} disabled>
            {s}
          </button>
        ))}
      </div>

      <p className="preview-note">
        Preview of the event feed — ingesters (Radarr, Sonarr, qBittorrent, Pi-hole, Backup) will be wired up in Phase 3.
      </p>

      <div className="event-list">
        {MOCK_EVENTS.map(e => (
          <div key={e.id} className="event-item">
            <span className="event-icon">{e.icon}</span>
            <div className="event-body">
              <span className="event-message">{e.message}</span>
              <span className="event-meta">
                <span className={`event-source source-${e.source.toLowerCase().replace('-', '')}`}>{e.source}</span>
                <span className="event-time">{e.time}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
