import { useMemo, useState } from 'react'
import { canSendLandownerNotifications, getAffectedParcels, userProfiles } from '../data/mockData'

export default function AffectedParcelsPage({ role = 'districtOfficer', projectRecords = [], notificationRecords = [], onNotifyAll }) {
  const profile = userProfiles.find((item) => item.role === role) || userProfiles[0]
  const affectedParcels = useMemo(() => getAffectedParcels(role, profile, projectRecords), [role, profile, projectRecords])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [sending, setSending] = useState(false)

  const canNotify = canSendLandownerNotifications(role, profile)
  const totalFamilies = affectedParcels.reduce((sum, parcel) => sum + (parcel.affectedFamilyCount || parcel.landownerDetails?.familyMembers || parcel.affectedFamily || 0), 0)

  const handleDispatch = () => {
    if (!canNotify || !affectedParcels.length || typeof onNotifyAll !== 'function') {
      return
    }

    setSending(true)
    onNotifyAll(affectedParcels)
    setSending(false)
    setShowConfirmation(false)
  }

  return (
    <div className="stack-block">
      <div className="section-header">
        <div>
          <div className="eyebrow">Affected parcels</div>
          <h2>Landowner notification queue</h2>
        </div>
        {canNotify && (
          <button className="primary-btn" type="button" disabled={!affectedParcels.length || sending} onClick={() => setShowConfirmation(true)}>
            {sending ? 'Sending...' : 'Notify All Affected Landowners'}
          </button>
        )}
      </div>

      <div className="affected-parcels-grid">
        <div className="kpi-card">
          <span className="kpi-label">Affected parcels</span>
          <strong>{affectedParcels.length}</strong>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Affected families</span>
          <strong>{totalFamilies}</strong>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Notification status</span>
          <strong>{affectedParcels.some((parcel) => parcel.notificationStatus === 'Delivered') ? 'In progress' : 'Awaiting dispatch'}</strong>
        </div>
      </div>

      <div className="panel-card">
        <div className="notification-readonly-note">
          GIS geometry and parcel boundaries are read-only for this workflow. Affected parcels are identified through the existing spatial-intersection process and remain visible to authorized government users only.
        </div>
      </div>

      {showConfirmation && (
        <div className="panel-card notification-confirmation-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Confirm dispatch</div>
              <h3>Send official notice to all affected landowners</h3>
            </div>
          </div>
          <div className="notification-summary-grid">
            <div>
              <label>Parcels</label>
              <strong>{affectedParcels.length}</strong>
            </div>
            <div>
              <label>Affected families</label>
              <strong>{totalFamilies}</strong>
            </div>
            <div>
              <label>Channel</label>
              <strong>SMS / existing notification service</strong>
            </div>
          </div>
          <p className="notification-confirmation-copy">Each affected landowner will receive an official acquisition notice and a generated case document. The notification reference ID, delivery status, and dispatched date will be stored against the relevant parcel and project case.</p>
          <div className="button-row">
            <button className="secondary-btn" type="button" onClick={() => setShowConfirmation(false)}>Cancel</button>
            <button className="primary-btn" type="button" disabled={sending} onClick={handleDispatch}>Confirm and send</button>
          </div>
        </div>
      )}

      <div className="panel-card table-panel">
        <table>
          <thead>
            <tr>
              <th>ULPIN</th>
              <th>Survey / Parcel</th>
              <th>Village</th>
              <th>Area</th>
              <th>Affected Area</th>
              <th>Land Type</th>
              <th>Project</th>
              <th>Landowner / Family</th>
              <th>Field Verification</th>
              <th>Acquisition Status</th>
              <th>Notification</th>
            </tr>
          </thead>
          <tbody>
            {affectedParcels.map((parcel) => (
              <tr key={parcel.id}>
                <td>{parcel.ulpin}</td>
                <td>{parcel.surveyNo}</td>
                <td>{parcel.village}</td>
                <td>{parcel.area}</td>
                <td>{parcel.affectedArea}</td>
                <td>{parcel.landType}</td>
                <td>{parcel.projectName}</td>
                <td>
                  <div className="family-cell">
                    <strong>{parcel.landownerDetails?.name || 'Landowner not available'}</strong>
                    <small>{parcel.landownerDetails?.respondentType || 'Family record'} · {parcel.affectedFamilyCount || parcel.landownerDetails?.familyMembers || parcel.affectedFamily || 0} members</small>
                  </div>
                </td>
                <td><span className={`status-badge ${parcel.fieldVerificationStatus === 'Verified' ? 'success' : parcel.fieldVerificationStatus === 'Discrepancy found' ? 'warning' : 'neutral'}`}>{parcel.fieldVerificationStatus}</span></td>
                <td><span className={`status-badge ${parcel.currentAcquisitionStatus === 'Notification current' || parcel.currentAcquisitionStatus === 'Notification issued' ? 'success' : parcel.currentAcquisitionStatus === 'Objection hearing pending' ? 'warning' : 'neutral'}`}>{parcel.currentAcquisitionStatus}</span></td>
                <td><span className={`status-badge ${parcel.notificationStatus === 'Delivered' ? 'success' : parcel.notificationStatus === 'Awaiting dispatch' ? 'warning' : 'neutral'}`}>{parcel.notificationStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-card">
        <div className="section-header"><h3>Notification history</h3></div>
        {notificationRecords.length ? (
          <table>
            <thead>
              <tr>
                <th>Parcel</th>
                <th>Recipient</th>
                <th>Mobile</th>
                <th>Notification ID</th>
                <th>Document</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {notificationRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.parcelId}</td>
                  <td>{record.recipient}</td>
                  <td>{record.phone}</td>
                  <td>{record.referenceId}</td>
                  <td>{record.documentName}</td>
                  <td>{record.notificationDate}</td>
                  <td><span className="status-badge success">{record.deliveryStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state-copy">No official landowner notifications have been dispatched yet.</p>
        )}
      </div>
    </div>
  )
}
