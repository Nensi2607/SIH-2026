import { useParams } from 'react-router-dom'
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getVisibleProjects, projectStageFlow, userProfiles } from '../data/mockData'

const projectCoordinates = {
  Varanasi: [25.3176, 82.9739],
  Lucknow: [26.8467, 80.9462],
  Mirzapur: [25.1337, 82.5644],
  Sultanpur: [26.2648, 82.0727],
}

function getProjectCoordinates(project) {
  return projectCoordinates[project.district] || [26.8467, 80.9462]
}

export default function ProjectDetailsPage({ role = 'nationalOfficer', projectRecords = [] }) {
  const { projectId } = useParams()
  const profile = userProfiles.find((item) => item.role === role)
  const project = getVisibleProjects(role, profile, projectRecords.length ? projectRecords : undefined).find((item) => item.id === projectId)

  if (!project) return <div className="panel-card"><h2>Project access restricted</h2><p>This project is outside your assigned jurisdiction.</p></div>

  return (
    <div className="stack-block">
      <div className="section-header two-line">
        <div>
          <h2>{project.name}</h2>
        </div>
        <span className="pill success">{project.status}</span>
      </div>

      <div className="panel-card">
        <div className="project-meta-grid">
          <div><label>Project ID</label><strong>{project.id}</strong></div>
          <div><label>Project Authority</label><strong>{project.authority}</strong></div>
          <div><label>Applicable Statute</label><strong>{project.statute}</strong></div>
          <div><label>State</label><strong>{project.state}</strong></div>
          <div><label>District</label><strong>{project.district}</strong></div>
          <div><label>Villages</label><strong>{project.villages.join(', ')}</strong></div>
          <div><label>Total Land Required</label><strong>{project.totalLandRequired}</strong></div>
          <div><label>Total Parcels</label><strong>{project.totalParcels}</strong></div>
          <div><label>Acquisition Progress</label><strong>{project.progress}%</strong></div>
          <div><label>Project Readiness</label><strong>{project.readiness}</strong></div>
          {project.projectCreatedBy && <div><label>Project created by</label><strong>{project.projectCreatedBy.name} · {project.projectCreatedBy.designation}</strong></div>}
        </div>
      </div>

      <div className="content-grid two-up project-acquisition-grid">
        <div className="panel-card">
          <div className="section-header"><div><div className="eyebrow">Project-specific monitoring</div><h3>Acquisition Progress</h3></div><span className="pill success">{project.progress}% complete</span></div>
          <div className="project-progress-summary"><div className="progress-line"><span style={{ width: `${project.progress}%` }} /></div><strong>{project.acquired} of {project.totalParcels} parcels acquired</strong></div>
          <div className="project-stage-list">{projectStageFlow.map((stage, index) => { const stageIndex = projectStageFlow.indexOf(project.stage); const status = index < stageIndex ? 'Completed' : index === stageIndex ? 'Current' : 'Upcoming'; return <div className={`project-stage ${status.toLowerCase()}`} key={stage}><span className="project-stage-dot" /><div><strong>{stage}</strong><small>{status}</small></div></div> })}</div>
        </div>
        <div className="panel-card">
          <div className="section-header"><div><div className="eyebrow">Current project position</div><h3>Acquisition Status</h3></div><span className={`status-badge ${project.status === 'Delayed' ? 'danger' : project.status === 'Attention' ? 'warning' : 'success'}`}>{project.status}</span></div>
          <div className="project-status-grid"><div><label>Current stage</label><strong>{project.stage}</strong></div><div><label>Readiness</label><strong>{project.readiness}</strong></div><div><label>Pending parcels</label><strong>{project.pending}</strong></div><div><label>Blocked parcels</label><strong>{project.blocked}</strong></div><div><label>Target deadline</label><strong>{project.proposalDeadline || 'Under review'}</strong></div><div><label>Days remaining</label><strong>{project.daysRemaining}</strong></div></div>
          <div className="project-status-note"><strong>Status note</strong><p>{project.status === 'Delayed' ? 'This project needs escalation against its current statutory timeline.' : project.status === 'Attention' ? 'Review blocked parcels and pending actions before the next milestone.' : 'The project is progressing within the current monitoring timeline.'}</p></div>
        </div>
      </div>

      <div className="panel-card project-map-card">
        <div className="section-header"><div><div className="eyebrow">Project boundary and parcel context</div><h3>GIS Acquisition Map</h3></div><span className="pill neutral">{project.district}, {project.state}</span></div>
        <MapContainer center={getProjectCoordinates(project)} zoom={11} scrollWheelZoom className="project-detail-map">
          <TileLayer attribution="&copy; OpenStreetMap contributors &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <Circle center={getProjectCoordinates(project)} radius={Math.max(1800, project.totalParcels * 80)} pathOptions={{ color: '#0f766e', fillColor: '#14b8a6', fillOpacity: 0.22 }}><Popup><strong>{project.name}</strong><br />{project.totalLandRequired} planned area<br />{project.totalParcels} project parcels</Popup></Circle>
          {project.villages.map((village, index) => <Marker key={village} position={[getProjectCoordinates(project)[0] + (index - 1) * 0.012, getProjectCoordinates(project)[1] + (index % 2 ? 0.014 : -0.01)]}><Popup><strong>{village}</strong><br />Project village</Popup></Marker>)}
        </MapContainer>
        <div className="map-planning-note">The map is scoped to this individual project. Use the parcel and village markers to review the project footprint before opening related records.</div>
      </div>

      <div className="kpi-grid three-up">
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Total Parcels</span></div><strong>{project.totalParcels}</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Completed</span></div><strong>{project.acquired}</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Pending</span></div><strong>{project.pending}</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Blocked</span></div><strong>{project.blocked}</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Compensation Paid</span></div><strong>₹ 24.2 Cr</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">R&R Completed</span></div><strong>67%</strong></div>
      </div>

      <div className="panel-card">
        <div className="section-header"><h3>Village-wise Progress</h3></div>
        <table>
          <thead>
            <tr>
              <th>Village</th>
              <th>Total Parcels</th>
              <th>Completed</th>
              <th>Pending</th>
              <th>Blocked</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {project.villages.map((village, index) => (
              <tr key={village}>
                <td>{village}</td>
                <td>{12 + index}</td>
                <td>{8 + index}</td>
                <td>{3 + index}</td>
                <td>{index % 2 === 0 ? 1 : 0}</td>
                <td>
                  <div className="progress-line"><span style={{ width: `${55 + index * 7}%` }} /></div>
                  {55 + index * 7}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-card">
        <div className="section-header"><h3>Blocked Parcel Section</h3></div>
        <table>
          <thead>
            <tr>
              <th>ULPIN</th>
              <th>Village</th>
              <th>Current Stage</th>
              <th>Blocker</th>
              <th>Days Blocked</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ULPIN-UP-7812-011</td>
              <td>Rasalpur</td>
              <td>Objection</td>
              <td>Objection hearing pending</td>
              <td>26</td>
              <td><button className="secondary-btn small">View Parcel</button></td>
            </tr>
            <tr>
              <td>ULPIN-UP-4821-220</td>
              <td>Katra</td>
              <td>Survey</td>
              <td>Survey verification incomplete</td>
              <td>21</td>
              <td><button className="secondary-btn small">View Parcel</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
