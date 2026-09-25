import { useState } from 'react'
import { getVisibleAlerts, userProfiles } from '../data/mockData'

const alertCategories = ['Delayed Projects', 'Compensation Pending', 'Near Deadline', 'Pending Verification', 'Other Escalations']

function getAlertCategory(alert) {
  const title = alert.title.toLowerCase()
  if (title.includes('delayed')) return 'Delayed Projects'
  if (title.includes('payment') || title.includes('compensation')) return 'Compensation Pending'
  if (title.includes('verification') || title.includes('survey')) return 'Pending Verification'
  if (title.includes('deadline') || title.includes('hearing')) return 'Near Deadline'
  return 'Other Escalations'
}

function getSeverityClass(severity) {
  return severity === 'Critical' ? 'danger' : severity === 'Info' ? 'neutral' : 'warning'
}

export default function AlertsPage({ role = 'nationalOfficer' }) {
  const [severityFilter, setSeverityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const profile = userProfiles.find((item) => item.role === role)
  const visibleAlerts = getVisibleAlerts(role, profile)
  const filteredAlerts = visibleAlerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter
    const matchesCategory = categoryFilter === 'All' || getAlertCategory(alert) === categoryFilter
    return matchesSeverity && matchesCategory
  })

  return (
    <div className="stack-block">
      <div className="section-header"><h2>Alerts & Escalation</h2><span className="pill neutral">Escalation: Field Officer → District → State → National</span></div>

      <div className="filter-grid small-grid">
        <select aria-label="Filter alerts by severity" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}><option>All</option><option>Critical</option><option>Warning</option><option>Info</option></select>
        <select aria-label="Filter alerts by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="All">All categories</option>{alertCategories.map((category) => <option key={category}>{category}</option>)}</select>
      </div>

      <div className="alert-category-list">
        {alertCategories.map((category) => {
          const categoryAlerts = filteredAlerts.filter((alert) => getAlertCategory(alert) === category)
          if (!categoryAlerts.length) return null
          return <section className="alert-category" key={category}>
            <div className="alert-category-header"><div><div className="eyebrow">Operational category</div><h3>{category}</h3></div><span className="pill neutral">{categoryAlerts.length} alert{categoryAlerts.length === 1 ? '' : 's'}</span></div>
            <div className="alert-list">
              {categoryAlerts.map((alert) => (
                <div key={alert.id} className="panel-card alert-row">
                  <div className="alert-topline">
                    <strong>{alert.title}</strong>
                    <span className={`status-badge ${getSeverityClass(alert.severity)}`}>{alert.severity}</span>
                  </div>
                  <div className="alert-meta">
                    <span>Project: {alert.project}</span>
                    <span>Parcel: {alert.parcel}</span>
                    <span>Officer: {alert.officer}</span>
                    <span>Deadline: {alert.deadline}</span>
                    <span>Status: {alert.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        })}
        {!filteredAlerts.length && <div className="empty-state">No alerts match the selected filters.</div>}
      </div>
    </div>
  )
}
