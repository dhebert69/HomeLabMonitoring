import './nav.css'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    subtitle: 'Host stats · Disk · Network',
  },
  {
    id: 'docker',
    label: 'Docker',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12.5a4.5 4.5 0 0 1-4.5 4.5H6a4 4 0 0 1 0-8h.5A5.5 5.5 0 0 1 17.5 7.5" />
        <path d="M6 8h2v2H6zM9 8h2v2H9zM12 8h2v2h-2zM9 5h2v2H9zM12 5h2v2h-2z" />
      </svg>
    ),
    subtitle: 'Containers · Logs',
    badge: 'Phase 2',
  },
  {
    id: 'activity',
    label: 'Activity Feed',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    ),
    subtitle: 'Radarr · Sonarr · qBit',
    badge: 'Phase 3',
  },
]

export default function NavSidebar({ currentPage, onNavigate }) {
  const [open, setOpen] = useState(false)

  function navigate(id) {
    onNavigate(id)
    setOpen(false)
  }

  return (
    <>
      {/* Hamburger */}
      <button
        className={`hamburger${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        <span /><span /><span />
      </button>

      {/* Overlay */}
      {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}

      {/* Sidebar panel */}
      <aside className={`nav-sidebar${open ? ' open' : ''}`}>
        <div className="nav-brand">HomeLab</div>
        <nav>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item${currentPage === item.id ? ' active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">
                <span className="nav-label">{item.label}</span>
                <span className="nav-subtitle">{item.subtitle}</span>
              </span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </aside>
    </>
  )
}

// useState import hoisted here to keep the file self-contained
import { useState } from 'react'
