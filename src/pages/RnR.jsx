import { familyRecords } from '../data/mockData'

export default function RnRPage({ projectId }) {
  return (
    <div className="stack-block">
      <div className="section-header"><h2>Rehabilitation & Resettlement</h2><span className="pill neutral">{projectId ? `Project ${projectId}` : 'Entitlement Passbook'}</span></div>

      <div className="kpi-grid four-up">
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Affected Families</span></div><strong>1,248</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Displaced Families</span></div><strong>462</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Entitlements Due</span></div><strong>1,790</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Delivered</span></div><strong>1,218</strong></div>
      </div>

      <div className="panel-card table-panel">
        <table>
          <thead>
            <tr>
              <th>Family ID</th>
              <th>Parcel</th>
              <th>Village</th>
              <th>Affected/Displaced</th>
              <th>Entitlement</th>
              <th>Delivered</th>
              <th>Pending</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {familyRecords.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.parcel}</td>
                <td>{row.village}</td>
                <td>{row.type}</td>
                <td>{row.entitlement}</td>
                <td>{row.delivered}</td>
                <td>{row.pending}</td>
                <td><span className={`status-badge ${row.status === 'Delivered' ? 'success' : row.status === 'Pending' ? 'warning' : 'neutral'}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
