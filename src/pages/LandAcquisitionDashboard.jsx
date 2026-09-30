import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import { ArrowRight, CalendarClock, CheckCircle2, FilePlus2, MapPinned, Plus, Search, ShieldCheck } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { getVisibleAlerts, parcels, projects, userProfiles } from '../data/mockData'

const initialProjectForm = {
  name: '',
  projectType: 'National Highway',
  authority: '',
  state: 'Uttar Pradesh',
  district: '',
  taluka: '',
  villages: '',
  totalLandRequired: '',
  acquisitionArea: '',
  startDate: '',
  completionDate: '',
  department: '',
  contact: '',
  description: '',
}

const stages = ['Project proposal', 'GIS identification', 'Parcel verification', 'Notification', 'Objection & hearing', 'Compensation & award', 'Payment', 'Possession']
const numberFormat = new Intl.NumberFormat('en-IN')

function AlignmentClickCapture({ enabled, onPoint }) {
  useMapEvents({ click(event) { if (enabled) onPoint([event.latlng.lat, event.latlng.lng]) } })
  return null
}

function StatCard({ icon: Icon, label, value, tone = 'blue' }) {
  return <div className="kpi-card"><div className="kpi-head"><span className={`kpi-icon ${tone}`}><Icon size={17} /></span><span className="kpi-label">{label}</span></div><strong>{value}</strong></div>
}

function AcquisitionMap({ projectsInScope }) {
  const mapProject = projectsInScope.find((project) => project.id === 'NHC-2026-014') || projectsInScope[0]
  const point = mapProject?.district === 'Lucknow' ? [26.8467, 80.9462] : [25.3176, 82.9739]
  const projectParcels = parcels.filter((parcel) => parcel.projectId === mapProject?.id)

  return <MapContainer key={mapProject?.id || 'overview'} center={point} zoom={12} scrollWheelZoom={false} className="acquisition-overview-map">
    <TileLayer attribution="&copy; OpenStreetMap contributors &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
    <Circle center={point} radius={2600} pathOptions={{ color: '#0f766e', fillColor: '#14b8a6', fillOpacity: 0.12, weight: 2 }}>
      <Popup>{mapProject?.name || 'Project alignment'} · indicative corridor</Popup>
    </Circle>
    {projectParcels.map((parcel, index) => <Circle key={parcel.id} center={[parcel.mapLocation.lat, parcel.mapLocation.lng]} radius={150 + (index % 2) * 65} pathOptions={{ color: parcel.status === 'Blocked' ? '#b54732' : '#32765f', fillColor: parcel.status === 'Blocked' ? '#f4d5cc' : '#cce7d6', fillOpacity: 0.8, weight: 2 }}>
      <Popup><strong>{parcel.surveyNo}</strong><br />{parcel.village} · {parcel.area}<br />{parcel.currentStage} · {parcel.status}</Popup>
    </Circle>)}
  </MapContainer>
}

function ProjectForm({ role, profile, onSave, onClose }) {
  const [form, setForm] = useState({ ...initialProjectForm, state: role === 'stateOfficer' ? profile.jurisdiction : 'Uttar Pradesh', district: role === 'districtOfficer' ? profile.jurisdiction : '' })
  const [error, setError] = useState('')
  const [files, setFiles] = useState([])
  const [alignmentPoints, setAlignmentPoints] = useState([])
  const [drawingAlignment, setDrawingAlignment] = useState(false)
  const [alignmentFile, setAlignmentFile] = useState(null)
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.district.trim() || !form.authority.trim() || !form.totalLandRequired) {
      setError('Complete the project name, authority, district, and proposed land area.')
      return
    }
    const createdAt = new Date().toISOString()
    onSave({
      id: `LA-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      name: form.name.trim(),
      projectType: form.projectType,
      authority: form.authority.trim(),
      state: form.state.trim(),
      district: form.district.trim(),
      taluka: form.taluka.trim(),
      villages: form.villages.split(',').map((village) => village.trim()).filter(Boolean),
      totalLandRequired: `${Number(form.totalLandRequired).toLocaleString('en-IN')} ha`,
      proposedAcquisitionArea: form.acquisitionArea ? `${Number(form.acquisitionArea).toLocaleString('en-IN')} ha` : `${Number(form.totalLandRequired).toLocaleString('en-IN')} ha`,
      totalParcels: 0,
      acquired: 0,
      pending: 0,
      blocked: 0,
      progress: 0,
      status: 'New',
      stage: 'Proposal',
      readiness: 'Proposal submitted',
      daysRemaining: form.completionDate ? Math.max(0, Math.ceil((new Date(form.completionDate) - new Date()) / 86400000)) : 90,
      proposalDeadline: form.completionDate,
      level: role === 'nationalOfficer' || role === 'admin' ? 'national' : role === 'stateOfficer' ? 'state' : 'district',
      ownerRole: role,
      implementingAgency: form.authority.trim(),
      contactDepartment: form.department.trim(),
      contact: form.contact.trim(),
      description: form.description.trim(),
      projectCreatedBy: { userId: profile.id, name: profile.name, designation: profile.title, department: profile.department || form.department.trim(), role, createdAt },
      projectGeometry: { type: 'LineString', coordinates: alignmentPoints.map(([latitude, longitude]) => [longitude, latitude]) },
      alignmentReference: alignmentFile?.name || null,
      documents: [...files, ...(alignmentFile ? [alignmentFile] : [])].map((file) => ({ name: file.name, uploadedBy: profile.name, uploadedAt: createdAt, version: 1 })),
      keyParcel: '',
    })
  }

  return <form className="panel-card acquisition-project-form" onSubmit={submit}>
    <div className="section-header"><div><div className="eyebrow">Project registration</div><h3>New acquisition project</h3></div><button className="icon-button" type="button" aria-label="Close project form" onClick={onClose}>×</button></div>
    <p className="form-intro">Project creation is attributed automatically to the signed-in officer. The assigned GIS service identifies parcels from project alignment and cadastral boundaries; this form does not derive parcels from uploaded documents.</p>
    <div className="form-grid acquisition-fields">
      <label>Project name *<input value={form.name} onChange={(event) => change('name', event.target.value)} required /></label>
      <label>Project ID<input value="Generated when saved" readOnly /></label>
      <label>Project type<select value={form.projectType} onChange={(event) => change('projectType', event.target.value)}>{['National Highway', 'State Highway', 'Railway', 'Irrigation', 'Industrial Corridor', 'Urban Infrastructure', 'Other'].map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>Project requiring authority *<input value={form.authority} onChange={(event) => change('authority', event.target.value)} required /></label>
      <label>State<input value={form.state} onChange={(event) => change('state', event.target.value)} disabled={role === 'stateOfficer'} /></label>
      <label>District *<input value={form.district} onChange={(event) => change('district', event.target.value)} disabled={role === 'districtOfficer'} required /></label>
      <label>Taluka<input value={form.taluka} onChange={(event) => change('taluka', event.target.value)} /></label>
      <label>Villages<input value={form.villages} onChange={(event) => change('villages', event.target.value)} placeholder="Separate villages with commas" /></label>
      <label>Estimated project area (ha) *<input type="number" min="0.01" step="0.01" value={form.totalLandRequired} onChange={(event) => change('totalLandRequired', event.target.value)} required /></label>
      <label>Proposed acquisition area (ha)<input type="number" min="0.01" step="0.01" value={form.acquisitionArea} onChange={(event) => change('acquisitionArea', event.target.value)} /></label>
      <label>Project start date<input type="date" value={form.startDate} onChange={(event) => change('startDate', event.target.value)} /></label>
      <label>Target completion date<input type="date" value={form.completionDate} onChange={(event) => change('completionDate', event.target.value)} /></label>
      <label>Department<input value={form.department} onChange={(event) => change('department', event.target.value)} /></label>
      <label>Contact information<input value={form.contact} onChange={(event) => change('contact', event.target.value)} /></label>
      <label className="acquisition-full-field">Project description<textarea rows="3" value={form.description} onChange={(event) => change('description', event.target.value)} /></label>
      <label className="acquisition-full-field">Proposal and supporting documents<input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(event) => setFiles(Array.from(event.target.files || []))} /></label>
    </div>
    <div className="alignment-section"><div className="alignment-note"><MapPinned size={17} /><span><strong>Project alignment & parcel identification</strong>Draw the corridor on the map or upload GIS-compatible alignment data. Candidate parcels must be generated by intersecting saved geometry with cadastral GIS data; project documents are references only.</span></div><div className="alignment-controls"><button type="button" className={drawingAlignment ? 'secondary-btn small alignment-active' : 'secondary-btn small'} onClick={() => setDrawingAlignment((active) => !active)}>{drawingAlignment ? 'Finish drawing' : 'Draw alignment'}</button><button type="button" className="secondary-btn small" onClick={() => setAlignmentPoints([])} disabled={!alignmentPoints.length}>Clear points</button><label className="alignment-upload">Upload GIS alignment<input type="file" accept=".geojson,.json,.kml,.kmz,.zip" onChange={(event) => setAlignmentFile(event.target.files?.[0] || null)} /></label><span>{alignmentPoints.length} alignment points{alignmentFile ? ` · ${alignmentFile.name}` : ''}</span></div><MapContainer center={[25.3176, 82.9739]} zoom={13} scrollWheelZoom={false} className="alignment-map"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><AlignmentClickCapture enabled={drawingAlignment} onPoint={(point) => setAlignmentPoints((current) => [...current, point])} />{alignmentPoints.map((position, index) => <Marker key={`${position.join('-')}-${index}`} position={position}><Popup>Alignment point {index + 1}</Popup></Marker>)}{alignmentPoints.length > 1 && <Polyline positions={alignmentPoints} pathOptions={{ color: '#0f766e', weight: 5 }} />}</MapContainer><p className="map-planning-note">{drawingAlignment ? 'Click the map to add corridor points. Select Finish drawing when the alignment is complete.' : 'Click Draw alignment to digitize a project corridor on the map.'} No AI or document/image processing is used to identify parcels.</p></div>
    {error && <p className="login-error" role="alert">{error}</p>}
    <div className="form-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button type="submit" className="primary-btn"><Plus size={16} /> Create acquisition project</button></div>
  </form>
}

function LrbProjectForm({ profile, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    projectType: 'State Highway',
    authority: profile.organization || profile.department || 'Varanasi Development Authority',
    state: 'Uttar Pradesh',
    district: profile.jurisdiction || 'Varanasi',
    taluka: '',
    villages: '',
    totalLandRequired: '',
    acquisitionArea: '',
    startDate: '',
    completionDate: '',
    department: profile.department || '',
    organizationName: profile.organization || profile.department || 'Varanasi Development Authority',
    projectDescription: '',
    purpose: '',
    category: 'State Government Project',
    contactName: profile.name,
    designation: profile.title,
    email: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [files, setFiles] = useState([])
  const [alignmentPoints, setAlignmentPoints] = useState([])
  const [alignmentFile, setAlignmentFile] = useState(null)
  const [drawingAlignment, setDrawingAlignment] = useState(false)

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = (event, mode = 'draft') => {
    event.preventDefault()
    if (!form.name.trim() || !form.district.trim() || !form.authority.trim() || !form.totalLandRequired || !form.projectDescription.trim() || !form.purpose.trim() || !form.contactName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Complete the required project proposal fields before saving or submitting.')
      return
    }

    const createdAt = new Date().toISOString()
    const projectStatus = mode === 'submit' ? 'SUBMITTED' : 'DRAFT'
    const projectStage = mode === 'submit' ? 'UNDER REVIEW' : 'DRAFT'
    const project = {
      id: `LRB-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      name: form.name.trim(),
      projectType: form.projectType,
      authority: form.authority.trim(),
      state: form.state.trim(),
      district: form.district.trim(),
      taluka: form.taluka.trim(),
      villages: form.villages.split(',').map((village) => village.trim()).filter(Boolean),
      totalLandRequired: `${Number(form.totalLandRequired).toLocaleString('en-IN')} ha`,
      proposedAcquisitionArea: form.acquisitionArea ? `${Number(form.acquisitionArea).toLocaleString('en-IN')} ha` : `${Number(form.totalLandRequired).toLocaleString('en-IN')} ha`,
      totalParcels: 0,
      acquired: 0,
      pending: 0,
      blocked: 0,
      progress: mode === 'submit' ? 5 : 0,
      status: projectStatus,
      stage: projectStage,
      readiness: mode === 'submit' ? 'Submitted for government review' : 'Draft saved by LRB',
      daysRemaining: form.completionDate ? Math.max(0, Math.ceil((new Date(form.completionDate) - new Date()) / 86400000)) : 90,
      proposalDeadline: form.completionDate || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      level: 'lrb',
      ownerRole: 'lrb',
      implementingAgency: form.organizationName.trim(),
      contactDepartment: form.department.trim(),
      contact: `${form.contactName.trim()} · ${form.email.trim()} · ${form.phone.trim()}`,
      description: form.projectDescription.trim(),
      purpose: form.purpose.trim(),
      category: form.category,
      projectCreatedBy: { userId: profile.id, name: profile.name, designation: profile.title, department: profile.department || form.department.trim(), role: 'lrb', createdAt },
      createdByUserId: profile.id,
      createdByName: profile.name,
      lrbOrganization: profile.organization || profile.department || form.organizationName.trim(),
      userRole: 'lrb',
      createdAt,
      updatedAt: createdAt,
      projectGeometry: { type: 'LineString', coordinates: alignmentPoints.map(([latitude, longitude]) => [longitude, latitude]) },
      alignmentReference: alignmentFile?.name || null,
      documents: [...files, ...(alignmentFile ? [alignmentFile] : [])].map((file) => ({ name: file.name, uploadedBy: profile.name, uploadedAt: createdAt, version: 1 })),
      keyParcel: '',
    }
    onSave(project)
  }

  return <form className="panel-card acquisition-project-form" onSubmit={(event) => submit(event, 'draft')}>
    <div className="section-header"><div><div className="eyebrow">LRB proposal form</div><h3>Create project proposal</h3></div><button className="icon-button" type="button" aria-label="Close project form" onClick={onClose}>×</button></div>
    <p className="form-intro">The logged-in LRB user is recorded automatically as the creator of the proposal. Drafts remain editable by the LRB until the proposal is formally submitted for government review.</p>

    <div className="form-grid acquisition-fields">
      <label>Project Name *<input value={form.name} onChange={(event) => change('name', event.target.value)} required /></label>
      <label>Project ID<input value="Auto-generated on save" readOnly /></label>
      <label>Project Type<select value={form.projectType} onChange={(event) => change('projectType', event.target.value)}>{['State Highway', 'National Highway', 'Railway', 'Industrial Corridor', 'Urban Infrastructure', 'Irrigation', 'Other'].map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>Project Requiring Body *<input value={form.authority} onChange={(event) => change('authority', event.target.value)} required /></label>
      <label>Department / Organization<input value={form.department} onChange={(event) => change('department', event.target.value)} /></label>
      <label>State<input value={form.state} onChange={(event) => change('state', event.target.value)} /></label>
      <label>District *<input value={form.district} onChange={(event) => change('district', event.target.value)} required /></label>
      <label>Taluka / Tehsil<input value={form.taluka} onChange={(event) => change('taluka', event.target.value)} /></label>
      <label>Villages<input value={form.villages} onChange={(event) => change('villages', event.target.value)} placeholder="Separate villages with commas" /></label>
      <label>Estimated Project Area (ha) *<input type="number" step="0.01" min="0.01" value={form.totalLandRequired} onChange={(event) => change('totalLandRequired', event.target.value)} required /></label>
      <label>Proposed Land Acquisition Area (ha)<input type="number" step="0.01" min="0.01" value={form.acquisitionArea} onChange={(event) => change('acquisitionArea', event.target.value)} /></label>
      <label>Proposed Start Date<input type="date" value={form.startDate} onChange={(event) => change('startDate', event.target.value)} /></label>
      <label>Expected Completion Date<input type="date" value={form.completionDate} onChange={(event) => change('completionDate', event.target.value)} /></label>
      <label>Project Category<select value={form.category} onChange={(event) => change('category', event.target.value)}>{['State Government Project', 'Central Government Project', 'Other Government Project'].map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>Organization Name<input value={form.organizationName} onChange={(event) => change('organizationName', event.target.value)} /></label>
      <label>Authorized Contact Person *<input value={form.contactName} onChange={(event) => change('contactName', event.target.value)} required /></label>
      <label>Designation<input value={form.designation} onChange={(event) => change('designation', event.target.value)} /></label>
      <label>Email *<input type="email" value={form.email} onChange={(event) => change('email', event.target.value)} required /></label>
      <label>Phone Number *<input value={form.phone} onChange={(event) => change('phone', event.target.value)} required /></label>
      <label className="acquisition-full-field">Project Description *<textarea rows="3" value={form.projectDescription} onChange={(event) => change('projectDescription', event.target.value)} required /></label>
      <label className="acquisition-full-field">Purpose of Project *<textarea rows="2" value={form.purpose} onChange={(event) => change('purpose', event.target.value)} required /></label>
      <label className="acquisition-full-field">Supporting Documents<input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.geojson,.json,.kml,.kmz,.zip" onChange={(event) => setFiles(Array.from(event.target.files || []))} /></label>
    </div>

    <div className="alignment-section"><div className="alignment-note"><MapPinned size={17} /><span><strong>Project alignment / GIS input</strong>Draw the corridor on the map or upload GIS-compatible alignment data. Candidate parcels are identified only through GIS spatial intersection with cadastral parcel layers.</span></div><div className="alignment-controls"><button type="button" className={drawingAlignment ? 'secondary-btn small alignment-active' : 'secondary-btn small'} onClick={() => setDrawingAlignment((active) => !active)}>{drawingAlignment ? 'Finish drawing' : 'Draw alignment'}</button><button type="button" className="secondary-btn small" onClick={() => setAlignmentPoints([])} disabled={!alignmentPoints.length}>Clear points</button><label className="alignment-upload">Upload GIS alignment<input type="file" accept=".geojson,.json,.kml,.kmz,.zip" onChange={(event) => setAlignmentFile(event.target.files?.[0] || null)} /></label><span>{alignmentPoints.length} alignment points{alignmentFile ? ` · ${alignmentFile.name}` : ''}</span></div><MapContainer center={[25.3176, 82.9739]} zoom={13} scrollWheelZoom={false} className="alignment-map"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><AlignmentClickCapture enabled={drawingAlignment} onPoint={(point) => setAlignmentPoints((current) => [...current, point])} />{alignmentPoints.map((position, index) => <Marker key={`${position.join('-')}-${index}`} position={position}><Popup>Alignment point {index + 1}</Popup></Marker>)}{alignmentPoints.length > 1 && <Polyline positions={alignmentPoints} pathOptions={{ color: '#0f766e', weight: 5 }} />}</MapContainer><p className="map-planning-note">{drawingAlignment ? 'Click the map to add corridor points.' : 'Click Draw alignment to digitize the project area.'} The system relies on GIS spatial intersection only; it does not use AI detection or document-based parcel extraction.</p></div>

    {error && <p className="login-error" role="alert">{error}</p>}
    <div className="form-actions">
      <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
      <button type="submit" className="secondary-btn">Save as Draft</button>
      <button type="button" className="primary-btn" onClick={(event) => {
        if (window.confirm('Are you sure you want to submit this project proposal for government review? After submission, editing will be restricted until the proposal is returned for correction.')) {
          submit(event, 'submit')
        }
      }}><Plus size={16} /> Submit Proposal</button>
    </div>
  </form>
}

export default function LandAcquisitionDashboard({ role, projectRecords = projects, onProjectCreated, registrationMode = false }) {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(Boolean(registrationMode))
  const [search, setSearch] = useState('')
  const profile = userProfiles.find((item) => item.role === role) || userProfiles[0]
  const visibleProjects = useMemo(() => {
    let scoped = projectRecords
    if (role === 'stateOfficer') scoped = scoped.filter((project) => project.state === profile.jurisdiction || project.ownerRole === role)
    if (role === 'districtOfficer') scoped = scoped.filter((project) => project.district === profile.jurisdiction || project.ownerRole === role)
    if (role === 'fieldOfficer') scoped = scoped.filter((project) => profile.assignedParcelIds?.some((id) => parcels.find((parcel) => parcel.id === id)?.projectId === project.id))
    if (role === 'citizen') scoped = scoped.filter((project) => profile.parcelIds?.some((id) => parcels.find((parcel) => parcel.id === id)?.projectId === project.id))
    return scoped.filter((project) => `${project.name} ${project.id} ${project.district} ${project.state}`.toLowerCase().includes(search.toLowerCase()))
  }, [projectRecords, profile, role, search])

  const alerts = getVisibleAlerts(role, profile).slice(0, 4)
  const canCreate = ['nationalOfficer', 'stateOfficer', 'districtOfficer', 'lrb', 'admin'].includes(role)
  const title = role === 'stateOfficer' ? 'State acquisition dashboard' : role === 'districtOfficer' ? 'District acquisition dashboard' : role === 'lrb' ? 'LRB project dashboard' : role === 'fieldOfficer' ? 'Field verification dashboard' : role === 'citizen' ? 'My land acquisition' : role === 'admin' ? 'Administration dashboard' : 'Dashboard'
  const stateProgressData = Object.values(visibleProjects.reduce((result, project) => {
    const existing = result[project.state] || { state: project.state, active: 0, completed: 0, total: 0 }
    existing.active += project.status !== 'Completed' ? 1 : 0
    existing.completed += project.status === 'Completed' ? 1 : 0
    existing.total += 1
    result[project.state] = existing
    return result
  }, {})).map((item) => ({ ...item, progress: Math.round((item.completed / item.total) * 100) || 0 })).sort((a, b) => b.total - a.total)

  const upcomingDeadlines = visibleProjects
    .map((project) => ({
      projectId: project.id,
      project: project.name,
      state: project.state,
      stage: project.stage,
      due: project.proposalDeadline || `${project.daysRemaining} days`,
      remaining: project.daysRemaining || 0,
      risk: project.status === 'Delayed' ? 'Delayed' : project.status === 'Attention' ? 'At risk' : 'On track',
    }))
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 5)

  const metrics = [
    { label: 'Total projects', value: numberFormat.format(visibleProjects.length), icon: ShieldCheck, tone: 'blue' },
    { label: 'Active projects', value: numberFormat.format(visibleProjects.filter((project) => project.status !== 'Completed').length), icon: MapPinned, tone: 'mint' },
    { label: 'Completed projects', value: numberFormat.format(visibleProjects.filter((project) => project.status === 'Completed').length), icon: CheckCircle2, tone: 'green' },
  ]

  const createProject = (project) => {
    onProjectCreated(project)
    if (registrationMode) navigate(`/projects/${project.id}`)
    else setShowForm(false)
  }

  if (registrationMode) return <div className="stack-block registration-page">
    <div className="section-header"><div><div className="eyebrow">Project registration</div><h2>Register an acquisition project</h2><p>Project creator and responsible officer are recorded from your signed-in account.</p></div><span className="pill neutral">{profile.jurisdiction || 'India'}</span></div>
    {showForm ? <ProjectForm role={role} profile={profile} onSave={createProject} onClose={() => setShowForm(false)} /> : <div className="panel-card registration-restart"><p>Registration was closed without saving.</p><button className="primary-btn" type="button" onClick={() => setShowForm(true)}><FilePlus2 size={15} /> Continue registration</button></div>}
  </div>

  if (role === 'lrb') {
    const lrbMetrics = [
      { label: 'Total Projects', value: String(visibleProjects.length), icon: ShieldCheck, tone: 'blue' },
      { label: 'Draft Projects', value: String(visibleProjects.filter((project) => project.status === 'DRAFT').length), icon: FilePlus2, tone: 'mint' },
      { label: 'Submitted Projects', value: String(visibleProjects.filter((project) => project.status === 'SUBMITTED').length), icon: ArrowRight, tone: 'orange' },
      { label: 'Under Government Review', value: String(visibleProjects.filter((project) => project.status === 'UNDER REVIEW').length), icon: Search, tone: 'purple' },
      { label: 'Projects with Query Raised', value: String(visibleProjects.filter((project) => project.status === 'QUERY RAISED').length), icon: CalendarClock, tone: 'warning' },
      { label: 'Approved Projects', value: String(visibleProjects.filter((project) => project.status === 'APPROVED').length), icon: CheckCircle2, tone: 'green' },
      { label: 'Rejected Projects', value: String(visibleProjects.filter((project) => project.status === 'REJECTED').length), icon: ShieldCheck, tone: 'danger' },
      { label: 'Projects in Land Acquisition', value: String(visibleProjects.filter((project) => project.status === 'APPROVED' || project.status === 'RESUBMITTED').length), icon: MapPinned, tone: 'blue' },
      { label: 'Projects Completed', value: String(visibleProjects.filter((project) => project.status === 'COMPLETED').length), icon: CheckCircle2, tone: 'green' },
    ]

    return <div className="stack-block acquisition-dashboard">
      <div className="section-header acquisition-dashboard-heading"><div><div className="eyebrow">Land Requiring Body Portal</div><h2>LRB dashboard</h2><p>Track project proposals, drafts, review queries and acquisition progress for projects initiated by your organization.</p></div><span className="pill neutral">{profile.organization || profile.department || profile.jurisdiction}</span></div>
      <div className="kpi-grid acquisition-metrics">{lrbMetrics.map((metric) => <StatCard key={metric.label} {...metric} />)}</div>
      <div className="acquisition-toolbar"><div><strong>Project proposals</strong><span>{visibleProjects.length} proposals in your portfolio</span></div><button className="primary-btn small" type="button" onClick={() => setShowForm(true)}><FilePlus2 size={15} /> Create New Project Proposal</button></div>
      {showForm && <LrbProjectForm profile={profile} onSave={(project) => { createProject(project); setShowForm(false) }} onClose={() => setShowForm(false)} />}

      <div className="panel-card acquisition-project-section"><div className="section-header"><div><div className="eyebrow">Proposal register</div><h3>Project proposals</h3></div><label className="acquisition-search"><Search size={15} /><input aria-label="Search LRB proposals" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search project name, ID or status" /></label></div>
        <div className="table-panel acquisition-project-table"><table><thead><tr><th>Project Name</th><th>Project ID</th><th>Project Type</th><th>State</th><th>District</th><th>Date Created</th><th>Current Status</th><th>Last Updated</th><th>Action</th></tr></thead><tbody>{visibleProjects.map((project) => <tr key={project.id}><td><strong>{project.name}</strong></td><td>{project.id}</td><td>{project.projectType}</td><td>{project.state}</td><td>{project.district}</td><td>{project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN') : 'New'}</td><td><span className={`status-badge ${project.status === 'DRAFT' ? 'warning' : project.status === 'QUERY RAISED' ? 'danger' : project.status === 'APPROVED' ? 'success' : 'neutral'}`}>{project.status || 'DRAFT'}</span></td><td>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}</td><td><div className="inline-actions"><Link className="secondary-btn small" to={`/projects/${project.id}`}>View</Link>{project.status === 'DRAFT' && <button type="button" className="secondary-btn small" onClick={() => setShowForm(true)}>Edit Draft</button>}{project.status === 'QUERY RAISED' && <button type="button" className="secondary-btn small" onClick={() => navigate(`/projects/${project.id}`)}>Respond to Query</button>}{project.status === 'APPROVED' && <button type="button" className="secondary-btn small" onClick={() => navigate(`/projects/${project.id}`)}>View Acquisition Progress</button>}</div></td></tr>)}{visibleProjects.length === 0 && <tr><td colSpan="9"><div className="empty-state">No project proposals match the current filter.</div></td></tr>}</tbody></table></div>
      </div>
    </div>
  }

  if (role === 'nationalOfficer') return <div className="stack-block acquisition-dashboard national-dashboard">
    <div className="section-header acquisition-dashboard-heading"><div><div className="eyebrow">National Land Acquisition Management System</div><h2>Dashboard</h2></div><span className="pill neutral">India</span></div>
    <div className="kpi-grid acquisition-metrics">{metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}</div>

    <div className="dashboard-two-up">
      <section className="panel-card dashboard-panel">
        <div className="section-header"><div><div className="eyebrow">State-wise overview</div><h3>State progress</h3></div></div>
        <div className="state-progress-list">
          {stateProgressData.map((item) => (
            <div className="state-progress-item" key={item.state}>
              <div className="state-progress-head">
                <strong>{item.state}</strong>
                <span>{item.active} active</span>
              </div>
              <div className="progress-line"><span style={{ width: `${item.progress}%` }} /></div>
              <small>{item.completed} completed of {item.total} projects</small>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card dashboard-panel">
        <div className="section-header"><div><div className="eyebrow">Next statutory actions</div><h3>Upcoming deadlines</h3></div></div>
        <div className="deadline-list">
          {upcomingDeadlines.map((item) => (
            <Link key={`${item.projectId}-${item.stage}`} to={`/projects/${item.projectId}`} className="deadline-item">
              <div className="deadline-copy">
                <strong>{item.project}</strong>
                <small>{item.stage} · {item.state}</small>
              </div>
              <div className="deadline-meta">
                <span className={`status-badge ${item.risk === 'Delayed' ? 'danger' : item.risk === 'At risk' ? 'warning' : 'success'}`}>{item.risk}</span>
                <small>{typeof item.due === 'string' && item.due.includes('days') ? `Due in ${item.due}` : `Due ${item.due}`}</small>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  </div>

  return <div className="stack-block acquisition-dashboard">
    <div className="section-header acquisition-dashboard-heading"><div><div className="eyebrow">National Land Acquisition Management System</div><h2>{title}</h2><p>Parcel-centred oversight from project alignment and GIS intersection through verification, award and possession.</p></div><span className="pill neutral">{profile.jurisdiction || 'India'}</span></div>
    <div className="kpi-grid acquisition-metrics">{metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}</div>
    {canCreate && <div className="acquisition-toolbar"><div><strong>Project register</strong><span>{visibleProjects.length} projects in your jurisdiction</span></div><button className="primary-btn small" type="button" onClick={() => setShowForm((open) => !open)}><FilePlus2 size={15} /> {registrationMode ? 'Register new project' : 'Register project'}</button></div>}
    {showForm && <ProjectForm key={role} role={role} profile={profile} onSave={createProject} onClose={() => setShowForm(false)} />}

    {!registrationMode && (
      <>
        <div className="acquisition-main-grid">
          <section className="panel-card acquisition-map-card"><div className="section-header"><div><div className="eyebrow">Project alignment & cadastral parcels</div><h3>GIS parcel identification</h3></div><Link className="secondary-btn small" to="/gis">Open GIS map <ArrowRight size={14} /></Link></div><AcquisitionMap projectsInScope={visibleProjects} /><div className="gis-intersection-flow"><span>Project alignment</span><ArrowRight size={14} /><span>PostGIS intersection</span><ArrowRight size={14} /><span>Candidate parcels</span><ArrowRight size={14} /><span>Officer verification</span></div><p className="map-planning-note">Indicative demo geometry. Official candidate parcels must be generated by spatial intersection of project geometry and cadastral GIS parcels, then verified by an authorized officer.</p></section>
          <section className="panel-card acquisition-workflow-card"><div className="section-header"><div><div className="eyebrow">Parcel-centred process</div><h3>Acquisition workflow</h3></div><Link className="icon-link" to="/workflow" aria-label="Open complete workflow"><ArrowRight size={17} /></Link></div><ol className="acquisition-workflow-list">{stages.map((stage, index) => <li className={index < 2 ? 'completed' : index === 2 ? 'current' : ''} key={stage}><span className="workflow-number">{index < 2 ? <CheckCircle2 size={15} /> : index + 1}</span><span>{stage}</span>{index === 2 && <small>Next milestone</small>}</li>)}</ol><Link className="workflow-full-link" to="/workflow">View complete 17-stage statutory workflow <ArrowRight size={14} /></Link></section>
        </div>

        <div className="acquisition-project-section panel-card"><div className="section-header"><div><div className="eyebrow">Project portfolio</div><h3>Projects</h3></div><label className="acquisition-search"><Search size={15} /><input aria-label="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Project, ID, district or state" /></label></div>
          <div className="table-panel acquisition-project-table"><table><thead><tr><th>Project</th><th>District / state</th><th>Parcels</th><th>Current stage</th><th>Progress</th><th>Status</th><th /></tr></thead><tbody>{visibleProjects.map((project) => <tr key={project.id}><td><Link to={`/projects/${project.id}`}><strong>{project.name}</strong></Link><small className="table-subtext">{project.id} · {project.authority}</small></td><td>{project.district}, {project.state}</td><td>{project.totalParcels}</td><td>{project.stage}</td><td><div className="progress-line"><span style={{ width: `${project.progress}%` }} /></div> {project.progress}%</td><td><span className={`status-badge ${project.status === 'Delayed' ? 'danger' : project.status === 'Attention' ? 'warning' : 'success'}`}>{project.status}</span></td><td><Link className="icon-link" to={`/projects/${project.id}`} aria-label={`Open ${project.name}`}><ArrowRight size={16} /></Link></td></tr>)}{visibleProjects.length === 0 && <tr><td colSpan="7"><div className="empty-state">No projects match this search.</div></td></tr>}</tbody></table></div>
        </div>

        <div className="acquisition-bottom-grid"><section className="panel-card"><div className="section-header"><div><div className="eyebrow">Statutory clocks</div><h3>Deadlines & actions</h3></div><Link className="secondary-btn small" to="/alerts">All alerts <ArrowRight size={14} /></Link></div><div className="list-stack">{alerts.map((alert) => <div className="alert-item" key={alert.id}><span className={`alert-icon ${alert.severity === 'Critical' ? 'critical' : ''}`}><CalendarClock size={15} /></span><div className="alert-body"><strong>{alert.title}</strong><p>{alert.project} · {alert.parcel}</p><small>Due {alert.deadline} · {alert.officer}</small></div><span className={`status-badge ${alert.severity === 'Critical' ? 'danger' : 'warning'}`}>{alert.severity}</span></div>)}{!alerts.length && <div className="empty-state">No upcoming actions in this account.</div>}</div></section>
          <section className="panel-card"><div className="section-header"><div><div className="eyebrow">Accountability</div><h3>Project creation record</h3></div><ShieldCheck size={18} color="var(--primary)" /></div><div className="responsible-officer"><div className="avatar">{profile.name.slice(0, 2).toUpperCase()}</div><div><strong>{profile.name}</strong><span>{profile.title}</span><span>{profile.department || profile.jurisdiction}</span></div></div><p className="audit-note">Every new project records its creating officer, designation, user ID and server-time creation timestamp. Workflow decisions and document references remain associated with their responsible officer.</p><Link className="workflow-full-link" to="/documents">Project documents & audit history <ArrowRight size={14} /></Link></section></div>
      </>
    )}
  </div>
}