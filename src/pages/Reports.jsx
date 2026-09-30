import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getVisibleProjects, parcels, projects, stageDuration, userProfiles } from '../data/mockData'

const stageTargets = { Scrutiny: 14, Notification: 21, Objection: 30, Survey: 18, Award: 12, Payment: 7, 'R&R': 22 }
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export default function ReportsPage({ role = 'nationalOfficer', projectRecords = projects }) {
  const profile = userProfiles.find((item) => item.role === role)
  const visibleProjects = getVisibleProjects(role, profile, projectRecords)
  const projectAnalytics = visibleProjects.map((project) => {
    const projectParcels = parcels.filter((parcel) => parcel.projectId === project.id)
    const amounts = projectParcels.reduce((totals, parcel) => ({
      awarded: totals.awarded + (parcel.compensation?.awarded || 0),
      paid: totals.paid + (parcel.compensation?.paid || 0),
      pending: totals.pending + (parcel.compensation?.pending || 0),
    }), { awarded: 0, paid: 0, pending: 0 })
    return { ...project, ...amounts, awardedCr: amounts.awarded / 10000000, paidCr: amounts.paid / 10000000, pendingCr: amounts.pending / 10000000 }
  })
  const stageAnalytics = stageDuration.map((stage) => {
    const target = stageTargets[stage.name]
    const delay = Math.max(0, stage.days - target)
    return { ...stage, target, delay, status: delay === 0 ? 'On time' : `${delay} days late` }
  })

  return (
    <div className="stack-block">
      <div className="section-header"><div><div className="eyebrow">Project monitoring</div><h2>Reports</h2></div><span className="pill neutral">{visibleProjects.length} projects</span></div>

      <section className="panel-card report-section">
        <div className="section-header"><div><div className="eyebrow">Workflow timing</div><h3>Stage delay against target</h3></div></div>
        <div className="report-chart">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stageAnalytics} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} unit="d" />
              <Tooltip formatter={(value) => `${value} days`} />
              <Bar dataKey="delay" name="Days over target" radius={[5, 5, 0, 0]} fill="#c77b16" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="table-panel"><table><thead><tr><th>Workflow step</th><th>Elapsed</th><th>Target</th><th>Schedule</th></tr></thead><tbody>{stageAnalytics.map((stage) => <tr key={stage.name}><td>{stage.name}</td><td>{stage.days} days</td><td>{stage.target} days</td><td><span className={`status-badge ${stage.delay ? 'warning' : 'success'}`}>{stage.status}</span></td></tr>)}</tbody></table></div>
      </section>

      <section className="panel-card report-section">
        <div className="section-header"><div><div className="eyebrow">Project-level amounts</div><h3>Compensation awarded, paid and pending</h3></div></div>
        <div className="report-chart">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={projectAnalytics} margin={{ top: 8, right: 12, left: 8, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="id" angle={-18} textAnchor="end" interval={0} height={55} />
              <YAxis tickFormatter={(value) => `₹${value} Cr`} />
              <Tooltip formatter={(value, name) => [currency.format(Number(value) * 10000000), name]} />
              <Legend />
              <Bar dataKey="awardedCr" name="Awarded" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="paidCr" name="Paid" fill="#2d6cdf" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendingCr" name="Pending" fill="#e5a33a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="table-panel"><table><thead><tr><th>Project</th><th>Current step</th><th>Schedule</th><th>Delay</th><th>Awarded</th><th>Paid</th><th>Pending</th></tr></thead><tbody>
          {projectAnalytics.map((project) => {
            const delayed = project.status === 'Delayed'
            const atRisk = project.status === 'Attention'
            return <tr key={project.id}><td><strong>{project.name}</strong><small className="table-subtext">{project.id}</small></td><td>{project.stage}</td><td><span className={`status-badge ${delayed ? 'danger' : atRisk ? 'warning' : 'success'}`}>{delayed ? 'Delayed' : atRisk ? 'At risk' : 'On time'}</span></td><td>{delayed ? '14 days' : atRisk ? '5 days' : '0 days'}</td><td>{currency.format(project.awarded)}</td><td>{currency.format(project.paid)}</td><td>{currency.format(project.pending)}</td></tr>
          })}
          {!projectAnalytics.length && <tr><td colSpan="7"><div className="empty-state">No projects are available for this account.</div></td></tr>}
        </tbody></table></div>
      </section>
    </div>
  )
}
