import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { parcels as parcelData } from '../data/mockData'

const fallbackReviewQueue = [
  { id: 'FR-001', parcelId: 'ULPIN-UP-7812-011', projectName: 'BHU National Highway Corridor', status: 'Pending district review', submittedOn: '2026-09-24', officerName: 'Amit Solanki' },
  { id: 'FR-002', parcelId: 'ULPIN-UP-7812-004', projectName: 'BHU National Highway Corridor', status: 'Awaiting clarification', submittedOn: '2026-09-22', officerName: 'Amit Solanki' },
]

const buildInitialForm = (parcel) => ({
  gpsStatus: parcel?.gps || 'Stable',
  boundaryStatus: parcel?.boundary || 'Verified',
  actualArea: parcel?.area || '1.00 ha',
  landUse: parcel?.landType || 'Agricultural',
  structures: parcel?.structures || 0,
  trees: parcel?.trees || 0,
  wells: parcel?.wells || 0,
  crops: parcel?.crops || 'Rice / Wheat',
  observations: 'Field verification completed in person; boundary markers and possession status were checked against the site sketch.',
  evidence: 'GPS tagged photographs, boundary sketch, owner statement, site checklist.',
  objectionType: 'Boundary mismatch',
  objectorName: 'Owner / representative',
  discrepancyDetail: 'Border markers appear offset near the north-west edge and require a re-measurement before award.',
  verificationResult: parcel?.review === 'Requires Review' ? 'Requires Review' : parcel?.review === 'Discrepancy Found' ? 'Discrepancy Found' : 'Verified',
})

export default function FieldVerificationPage({ role, profile, projectRecords = [], fieldReports = [], onFieldReportSave }) {
  const { parcelId } = useParams()
  const isDistrictReviewMode = role === 'districtOfficer'

  const assignedParcels = useMemo(() => {
    if (isDistrictReviewMode) {
      return parcelData.filter((parcel) => parcel.state === profile?.state && parcel.district === profile?.district)
    }
    if (profile?.assignedParcelIds?.length) {
      return parcelData.filter((parcel) => profile.assignedParcelIds.includes(parcel.id))
    }
    return parcelData.slice(0, 3)
  }, [isDistrictReviewMode, profile])

  const [selectedParcelId, setSelectedParcelId] = useState(assignedParcels[0]?.id || '')
  const [formValues, setFormValues] = useState(() => buildInitialForm(assignedParcels[0]))
  const [savedMessage, setSavedMessage] = useState('')

  const selectedParcel = assignedParcels.find((parcel) => parcel.id === (parcelId || selectedParcelId)) || assignedParcels[0]
  const selectedProject = projectRecords.find((project) => project.id === selectedParcel?.projectId)

  const districtReviewQueue = useMemo(() => {
    const filtered = fieldReports.filter((report) => report.fieldOfficerId === profile?.id || report.parcelId === selectedParcel?.id || report.district === profile?.district)
    return filtered.length ? filtered.slice(0, 3) : fallbackReviewQueue
  }, [fieldReports, profile, selectedParcel])

  const getParcelReviewState = (parcel) => {
    const record = fieldReports.find((report) => report.parcelId === parcel.id) || fallbackReviewQueue.find((report) => report.parcelId === parcel.id)
    return {
      status: record?.verificationResult || parcel.review || 'Pending review',
      verifiedBy: record?.fieldOfficerName || 'Verification pending',
      objectionRaised: Boolean(record?.objectionType || parcel.review === 'Discrepancy Found' || parcel.review === 'Requires Review'),
      objectionDetail: record?.discrepancyDetail || parcel.occupantInfo || 'No objection recorded',
      submittedOn: record?.submittedOn || parcel.lastUpdated || 'Not submitted',
    }
  }

  const handleParcelSelect = (parcel) => {
    setSelectedParcelId(parcel.id)
    setFormValues(buildInitialForm(parcel))
    setSavedMessage('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
  }

  const handleSave = (event) => {
    event.preventDefault()

    if (!selectedParcel || !profile) {
      return
    }

    const report = {
      id: `FR-${selectedParcel.id}-${Date.now()}`,
      fieldOfficerId: profile.id,
      fieldOfficerName: profile.name,
      parcelId: selectedParcel.id,
      projectId: selectedParcel.projectId,
      projectName: selectedProject?.name || 'Assigned project',
      state: selectedParcel.state,
      district: selectedParcel.district,
      village: selectedParcel.village,
      submittedOn: new Date().toISOString().slice(0, 10),
      status: 'Submitted to District Review',
      ...formValues,
    }

    onFieldReportSave?.(report)
    setSavedMessage(`Verification report saved for ${selectedParcel.id} and sent to district review.`)
  }

  if (isDistrictReviewMode) {
    const selectedReview = getParcelReviewState(selectedParcel)

    if (parcelId && selectedParcel) {
      return (
        <div className="stack-block">
          <div className="section-header">
            <div>
              <div className="eyebrow">Survey verification objection</div>
                <h2>Parcel verification review</h2>
            </div>
            <div className="button-row">
              <Link className="secondary-btn small" to="/field-verification">← Back to parcels</Link>
              <span className="pill neutral">District officer · {profile?.name || 'Assigned officer'}</span>
            </div>
          </div>

          <div className="panel-card">
            <div className="section-header"><h3>{selectedParcel.id}</h3><span className={`status-badge ${selectedReview.status === 'Verified' ? 'success' : selectedReview.status === 'Discrepancy Found' ? 'warning' : 'neutral'}`}>{selectedReview.status}</span></div>
            <div className="mini-grid">
              <div><label>Survey / parcel</label><strong>{selectedParcel.surveyNo}</strong></div>
              <div><label>Verified by</label><strong>{selectedReview.verifiedBy}</strong></div>
              <div><label>Verification date</label><strong>{selectedReview.submittedOn}</strong></div>
              <div><label>Objection raised</label><strong>{selectedReview.objectionRaised ? 'Yes' : 'No'}</strong></div>
            </div>
            <div className="verification-summary">
              <div className="field-info-row"><span>Verification status</span><strong>{selectedReview.status}</strong></div>
              {selectedReview.objectionRaised && <div className="field-info-row"><span>Objection detail</span><strong>{selectedReview.objectionDetail}</strong></div>}
            </div>
            <p className="notification-readonly-note">This review panel is read-only for the district officer. Verification outcomes, objection details and the field officer identity are shown for review only and cannot be modified here.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="stack-block">
        <div className="section-header">
          <div>
            <div className="eyebrow">Survey verification objection</div>
            <h2>District verification review</h2>
          </div>
          <span className="pill neutral">District officer · {profile?.name || 'Assigned officer'}</span>
        </div>

        <div className="panel-card">
          <div className="section-header"><h3>Assigned parcels</h3></div>
          <div className="list-stack">
            {assignedParcels.map((parcel) => {
              const reviewState = getParcelReviewState(parcel)
              return (
                <Link key={parcel.id} to={`/field-verification/${parcel.id}`} className="list-row" onClick={() => handleParcelSelect(parcel)}>
                  <div>
                    <strong>{parcel.id}</strong>
                    <span>{parcel.village}</span>
                  </div>
                  <div className="list-meta">
                    <span className={`status-badge ${reviewState.status === 'Verified' ? 'success' : reviewState.status === 'Discrepancy Found' || reviewState.status === 'Requires Review' ? 'warning' : 'neutral'}`}>{reviewState.status}</span>
                    <small>{reviewState.verifiedBy}</small>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (parcelId && selectedParcel) {
    return (
      <div className="stack-block">
        <div className="section-header">
          <div>
            <div className="eyebrow">Gram Panchayat Officer Workspace</div>
            <h2>Field verification and evidence capture</h2>
          </div>
          <div className="button-row">
            <Link className="secondary-btn small" to="/field-verification">← Back to parcels</Link>
            <span className="pill neutral">Field officer · {profile?.name || 'Assigned officer'}</span>
          </div>
        </div>

        <div className="content-grid two-up">
          <div className="panel-card">
            <div className="section-header"><h3>Parcel snapshot</h3></div>
            <div className="mini-grid">
              <div><label>GPS Status</label><strong>{selectedParcel.gps}</strong></div>
              <div><label>Boundary</label><strong>{selectedParcel.boundary}</strong></div>
              <div><label>Structures</label><strong>{selectedParcel.structures}</strong></div>
              <div><label>Trees</label><strong>{selectedParcel.trees}</strong></div>
              <div><label>Wells</label><strong>{selectedParcel.wells}</strong></div>
              <div><label>Crops</label><strong>{selectedParcel.crops}</strong></div>
            </div>

            <div className="verification-summary">
              <div className="field-info-row"><span>Project</span><strong>{selectedProject?.name || 'Assigned project'}</strong></div>
              <div className="field-info-row"><span>Owner / claimants</span><strong>{selectedParcel.occupantInfo}</strong></div>
              <div className="field-info-row"><span>Current stage</span><strong>{selectedParcel.currentStage}</strong></div>
              <div className="field-info-row"><span>Blocker</span><strong>{selectedParcel.blocker}</strong></div>
            </div>
          </div>

          <div className="panel-card">
            <div className="section-header"><h3>Assigned parcels</h3></div>
            <div className="list-stack">
              {assignedParcels.map((parcel) => (
                <Link key={parcel.id} to={`/field-verification/${parcel.id}`} className={`list-row ${selectedParcel.id === parcel.id ? 'selected' : ''}`} onClick={() => handleParcelSelect(parcel)}>
                  <div>
                    <strong>{parcel.id}</strong>
                    <span>{parcel.village}</span>
                  </div>
                  <div className="list-meta">
                    <span className={`status-badge ${parcel.review === 'Discrepancy Found' || parcel.status === 'Blocked' ? 'danger' : parcel.review === 'Requires Review' ? 'warning' : 'neutral'}`}>{parcel.review || parcel.status}</span>
                    <small>{parcel.area}</small>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="content-grid two-up">
          <div className="panel-card">
            <div className="section-header"><h3>Ground verification form</h3></div>
            <form className="field-report-form" onSubmit={handleSave}>
              <div className="field-grid">
                <div>
                  <label>Verification result</label>
                  <select name="verificationResult" value={formValues.verificationResult} onChange={handleChange}>
                    <option>Verified</option>
                    <option>Discrepancy Found</option>
                    <option>Requires Review</option>
                  </select>
                </div>
                <div>
                  <label>GPS status</label>
                  <select name="gpsStatus" value={formValues.gpsStatus} onChange={handleChange}>
                    <option>Stable</option>
                    <option>Weak</option>
                    <option>Unavailable</option>
                  </select>
                </div>
                <div>
                  <label>Boundary status</label>
                  <select name="boundaryStatus" value={formValues.boundaryStatus} onChange={handleChange}>
                    <option>Verified</option>
                    <option>Discrepancy</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div>
                  <label>Actual area</label>
                  <input name="actualArea" value={formValues.actualArea} onChange={handleChange} />
                </div>
                <div>
                  <label>Land use</label>
                  <input name="landUse" value={formValues.landUse} onChange={handleChange} />
                </div>
                <div>
                  <label>Structures</label>
                  <input name="structures" type="number" min="0" value={formValues.structures} onChange={handleChange} />
                </div>
                <div>
                  <label>Trees</label>
                  <input name="trees" type="number" min="0" value={formValues.trees} onChange={handleChange} />
                </div>
                <div>
                  <label>Wells</label>
                  <input name="wells" type="number" min="0" value={formValues.wells} onChange={handleChange} />
                </div>
                <div>
                  <label>Primary crop</label>
                  <input name="crops" value={formValues.crops} onChange={handleChange} />
                </div>
              </div>

              <label>On-ground observations</label>
              <textarea name="observations" rows="4" value={formValues.observations} onChange={handleChange} />

              <label>Evidence summary</label>
              <textarea name="evidence" rows="3" value={formValues.evidence} onChange={handleChange} />

              <div className="field-tag-row">
                <span>GPS capture</span>
                <span>Photos</span>
                <span>Boundary sketch</span>
                <span>Owner statement</span>
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-btn">Attach evidence</button>
                <button type="submit" className="primary-btn">Submit field report</button>
              </div>
              {savedMessage && <div className="success-banner small">{savedMessage}</div>}
            </form>
          </div>

          <div className="panel-card">
            <div className="section-header"><h3>Objection and discrepancy record</h3></div>
            <div className="field-objection-grid">
              <div>
                <label>Issue type</label>
                <select name="objectionType" value={formValues.objectionType} onChange={handleChange}>
                  <option>Boundary mismatch</option>
                  <option>Structure omission</option>
                  <option>Crop / vegetation omission</option>
                  <option>Ownership discrepancy</option>
                  <option>Area variation</option>
                </select>
              </div>
              <div>
                <label>Raised by</label>
                <input name="objectorName" value={formValues.objectorName} onChange={handleChange} />
              </div>
            </div>

            <label>Discrepancy detail</label>
            <textarea name="discrepancyDetail" rows="5" value={formValues.discrepancyDetail} onChange={handleChange} />

            <div className="form-actions">
              <button type="button" className="secondary-btn">Record GPS point</button>
              <button type="button" className="secondary-btn">Save objection draft</button>
            </div>

            <div className="field-compact-list">
              <div><span>Site status</span><strong>{selectedParcel.review}</strong></div>
              <div><span>Last updated</span><strong>{selectedParcel.lastUpdated}</strong></div>
              <div><span>Officer</span><strong>{profile?.name || 'Field Officer'}</strong></div>
            </div>
          </div>
        </div>

        <div className="panel-card">
          <div className="section-header"><h3>District review queue</h3></div>
          <div className="review-list">
            {districtReviewQueue.map((report) => (
              <div key={report.id} className="review-item">
                <div>
                  <strong>{report.projectName}</strong>
                  <span>{report.parcelId}</span>
                </div>
                <div>
                  <span>{report.officerName}</span>
                  <small>{report.submittedOn}</small>
                </div>
                <span className={`status-badge ${report.status.includes('Pending') ? 'warning' : report.status.includes('Awaiting') ? 'neutral' : 'success'}`}>{report.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!selectedParcel) {
    return <div className="panel-card"><div className="eyebrow">Verification</div><h2>No assigned parcel found.</h2></div>
  }

  return (
    <div className="stack-block">
      <div className="section-header">
        <div>
          <div className="eyebrow">Gram Panchayat Officer Workspace</div>
          <h2>Field verification and evidence capture</h2>
        </div>
        <span className="pill neutral">Field officer · {profile?.name || 'Assigned officer'}</span>
      </div>

      <div className="panel-card">
        <div className="section-header"><h3>Assigned parcels</h3></div>
        <div className="list-stack">
          {assignedParcels.map((parcel) => (
            <Link key={parcel.id} to={`/field-verification/${parcel.id}`} className={`list-row ${selectedParcel.id === parcel.id ? 'selected' : ''}`} onClick={() => handleParcelSelect(parcel)}>
              <div>
                <strong>{parcel.id}</strong>
                <span>{parcel.village}</span>
              </div>
              <div className="list-meta">
                <span className={`status-badge ${parcel.review === 'Discrepancy Found' || parcel.status === 'Blocked' ? 'danger' : parcel.review === 'Requires Review' ? 'warning' : 'neutral'}`}>{parcel.review || parcel.status}</span>
                <small>{parcel.area}</small>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
