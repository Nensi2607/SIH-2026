import { getVisibleDocuments, userProfiles } from '../data/mockData'

export default function DocumentsPage({ role = 'nationalOfficer' }) {
  const profile = userProfiles.find((item) => item.role === role)
  const visibleDocuments = getVisibleDocuments(role, profile)
  return (
    <div className="stack-block">
      <div className="section-header"><h2>Document Repository</h2><span className="pill neutral">Controlled records</span></div>

      <div className="panel-card table-panel">
        <table>
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Type</th>
              <th>Parcel/Project</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Version</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleDocuments.map((document) => (
              <tr key={document.id}>
                <td>{document.name}</td>
                <td>{document.type}</td>
                <td>{document.parcel}</td>
                <td>{document.uploadedBy}</td>
                <td>{document.date}</td>
                <td>{document.version}</td>
                <td><span className={`status-badge ${document.status === 'Verified' ? 'success' : document.status === 'Pending Review' ? 'warning' : 'neutral'}`}>{document.status}</span></td>
                <td><button className="secondary-btn small">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
