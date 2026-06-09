import { useState } from 'react'
import NavSidebar from './nav/NavSidebar'
import MetricDashboard from './dashboardPage/metricDashboard'
import DockerPage from './dockerPage/dockerPage'
import ActivityPage from './activityPage/activityPage'

const PAGES = {
  dashboard: MetricDashboard,
  docker: DockerPage,
  activity: ActivityPage,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const Page = PAGES[page]

  return (
    <>
      <NavSidebar currentPage={page} onNavigate={setPage} />
      <Page />
    </>
  )
}
