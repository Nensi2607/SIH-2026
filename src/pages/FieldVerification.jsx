import { useState } from 'react'

const assignedParcels = [
  { id: 'ULPIN-UP-7812-004', village: 'Sahupur', status: 'Requires Review', distance: '2.4 km' },
  { id: 'ULPIN-UP-4821-220', village: 'Katra', status: 'Pending', distance: '7.1 km' },
  { id: 'ULPIN-UP-7812-011', village: 'Rasalpur', status: 'Discrepancy Found', distance: '4.8 km' },
]

export default function FieldVerificationPage() {
  const [selectedParcel, setSelectedParcel] = useState(assignedParcels[0])
  const [result, setResult] = useState('Verified')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="stack-block">
      <div className="section-header"><div><div className="eyebrow">Gram Panchayat Officer Workspace</div><h2>Today's Assigned Parcels</h2></div><span className="pill neutral">Offline Mode</span></div>

      <div className="content-grid two-up">
        <div className="panel-card">
          <div className="section-header"><h3>Assigned Parcels</h3></div>
          <div className="list-stack">
            {assignedParcels.map((parcel) => (
              <button key={parcel.id} className={`list-row ${selectedParcel.id === parcel.id ? 'selected' : ''}`} onClick={() => setSelectedParcel(parcel)}>
                <div>
                  <strong>{parcel.id}</strong>
                  <span>{parcel.village}</span>
                </div>
                <div className="list-meta">
                  <span className={`status-badge ${parcel.status === 'Discrepancy Found' ? 'danger' : parcel.status === 'Requires Review' ? 'warning' : 'neutral'}`}>{parcel.status}</span>
                  <small>{parcel.distance}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="section-header"><h3>Parcel Snapshot</h3></div>
          <div className="mini-grid">
            <div><label>GPS Status</label><strong>Stable</strong></div>
            <div><label>Boundary</label><strong>Verified</strong></div>
            <div><label>Structures</label><strong>02</strong></div>
            <div><label>Trees</label><strong>18</strong></div>
            <div><label>Wells</label><strong>01</strong></div>
            <div><label>Crops</label><strong>Rice / Wheat</strong></div>
          </div>

          <div className="field-form">
            <label>Verification Result</label>
            <select value={result} onChange={(e) => setResult(e.target.value)}>
              <option>Verified</option>
              <option>Discrepancy Found</option>
              <option>Requires Review</option>
            </select>
            <button className="primary-btn" onClick={() => setSubmitted(true)}>Start Verification</button>
            <button className="secondary-btn" onClick={() => setSubmitted(true)}>Record GPS & Evidence</button>
            <button className="secondary-btn" onClick={() => setSubmitted(true)}>Submit Verification</button>
          </div>

          {submitted && <div className="success-banner">Verification saved locally — awaiting synchronization</div>}
        </div>
      </div>
    </div>
  )
}
