import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { parcels, userProfiles } from '../data/mockData'
import { formatCurrency } from '../utils/formatters'

export default function ParcelDetailPage({ role = 'nationalOfficer' }) {
  const { parcelId } = useParams()
  const profile = userProfiles.find((item) => item.role === role)
  const parcel = useMemo(() => {
    const match = parcels.find((item) => item.ulpin === parcelId)
    if (!match) return null
    if (role === 'fieldOfficer' && !profile?.assignedParcelIds?.includes(match.id)) return null
    if (['districtOfficer', 'rrAdministrator'].includes(role) && match.district !== 'Varanasi') return null
    return match
  }, [parcelId, profile, role])

  if (!parcel) {
    return <div className="panel-card"><h2>Parcel access restricted</h2><p>This parcel is outside your assigned jurisdiction or worklist.</p></div>
  }

  return (
    <div className="stack-block">
      <div className="section-header two-line">
        <div>
          <div className="eyebrow">Parcel Identity</div>
          <h2>{parcel.ulpin}</h2>
        </div>
        <span className={`status-badge ${parcel.status === 'Blocked' ? 'danger' : parcel.status === 'Attention' ? 'warning' : 'success'}`}>{parcel.status}</span>
      </div>

      <div className="panel-card parcel-summary">
        <div><label>Survey Number</label><strong>{parcel.surveyNo}</strong></div>
        <div><label>Village</label><strong>{parcel.village}</strong></div>
        <div><label>District</label><strong>{parcel.district}</strong></div>
        <div><label>State</label><strong>{parcel.state}</strong></div>
        <div><label>Area</label><strong>{parcel.area}</strong></div>
        <div><label>Land Type</label><strong>{parcel.landType}</strong></div>
      </div>

      <div className="tab-grid">
        <div className="panel-card"><h3>Overview</h3><p>Current acquisition stage: <strong>{parcel.currentStage}</strong></p></div>
        <div className="panel-card"><h3>Acquisition</h3><ul className="mini-list"><li>Notification: {parcel.acquisition.notification}</li><li>Objection: {parcel.acquisition.objection}</li><li>Survey: {parcel.acquisition.survey}</li><li>Award: {parcel.acquisition.award}</li></ul></div>
        <div className="panel-card"><h3>Compensation</h3><ul className="mini-list"><li>Assessed: {formatCurrency(parcel.compensation.assessed)}</li><li>Awarded: {formatCurrency(parcel.compensation.awarded)}</li><li>Paid: {formatCurrency(parcel.compensation.paid)}</li><li>Pending: {formatCurrency(parcel.compensation.pending)}</li></ul></div>
        <div className="panel-card"><h3>R&R</h3><ul className="mini-list"><li>Affected family: {parcel.affectedFamily}</li><li>Displaced family: {parcel.displacedFamily}</li><li>Entitlements: {parcel.rrStatus}</li><li>Delivered: {parcel.rrStatus}</li></ul></div>
      </div>

      <div className="panel-card">
        <div className="section-header"><h3>Activity Timeline</h3></div>
        <div className="timeline">
          {parcel.timeline.map((item, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <strong>{item.date}</strong>
                <span>{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
