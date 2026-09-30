import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getVisibleParcels, userProfiles } from '../data/mockData'

export default function ParcelListPage({ role = 'nationalOfficer', projectRecords }) {
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState('All')
  const [status, setStatus] = useState('All')

  const profile = userProfiles.find((item) => item.role === role)
  const scopedParcels = getVisibleParcels(role, profile, projectRecords)

  const filteredParcels = useMemo(() => {
    return scopedParcels.filter((parcel) => {
      const matchesQuery = !query || [parcel.ulpin, parcel.surveyNo, parcel.village, parcel.district].join(' ').toLowerCase().includes(query.toLowerCase())
      const matchesStage = stage === 'All' || parcel.currentStage === stage
      const matchesStatus = status === 'All' || parcel.status === status
      return matchesQuery && matchesStage && matchesStatus
    })
  }, [query, stage, status, scopedParcels])

  return (
    <div className="stack-block">
      <div className="section-header"><h2>Parcel Management</h2><span className="pill neutral">{filteredParcels.length} records</span></div>

      <div className="filter-grid">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ULPIN, survey number, village..." />
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option>All</option>
          {['Award', 'Notification', 'Objection', 'Survey', 'Payment', 'Possession'].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          {['On Track', 'In Progress', 'Attention', 'Blocked', 'Delayed'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="panel-card table-panel">
        <table>
          <thead>
            <tr>
              <th>ULPIN</th>
              <th>Survey No.</th>
              <th>Village</th>
              <th>Area</th>
              <th>Current Stage</th>
              <th>Compensation</th>
              <th>Payment</th>
              <th>R&R</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredParcels.map((parcel) => (
              <tr key={parcel.id}>
                <td><Link to={`/parcels/${parcel.ulpin}`}>{parcel.ulpin}</Link></td>
                <td>{parcel.surveyNo}</td>
                <td>{parcel.village}</td>
                <td>{parcel.area}</td>
                <td>{parcel.currentStage}</td>
                <td>{parcel.compensation.awarded ? `₹ ${Math.round(parcel.compensation.awarded / 100000).toLocaleString()}L` : '—'}</td>
                <td><span className={`status-badge ${parcel.paymentStatus === 'Paid' || parcel.paymentStatus === 'Deposited' ? 'success' : parcel.paymentStatus === 'Failed' ? 'danger' : 'warning'}`}>{parcel.paymentStatus}</span></td>
                <td><span className={`status-badge ${parcel.rrStatus === 'Delivered' ? 'success' : parcel.rrStatus === 'Pending' ? 'warning' : 'neutral'}`}>{parcel.rrStatus}</span></td>
                <td><span className={`status-badge ${parcel.status === 'Blocked' ? 'danger' : parcel.status === 'Attention' ? 'warning' : parcel.status === 'Delayed' ? 'danger' : 'success'}`}>{parcel.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
