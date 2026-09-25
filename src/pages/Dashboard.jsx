import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { AlertTriangle, BrainCircuit, CalendarClock, CheckCircle2, CircleAlert, Download, Gavel, MapPinned, Plus, Send, ShieldCheck, TrendingUp, Users, Wallet } from 'lucide-react'
import { activityFeed, companyProfiles, dashboardStats, getVisibleAlerts, getVisibleProjects, projects, stateComparison, userProfiles } from '../data/mockData'
import { formatNumber } from '../utils/formatters'

const kpiData = [
  { label: 'Total Projects', value: formatNumber(dashboardStats.totalProjects), icon: ShieldCheck, tone: 'blue' },
  { label: 'Total Parcels', value: formatNumber(dashboardStats.totalParcels), icon: MapPinned, tone: 'green' },
  { label: 'Area Proposed', value: '663.1 ha', icon: MapPinned, tone: 'blue' },
  { label: 'Area Notified', value: '512.4 ha', icon: MapPinned, tone: 'green' },
  { label: 'Area Awarded', value: '389.7 ha', icon: CheckCircle2, tone: 'mint' },
  { label: 'Area Possessed', value: '244.8 ha', icon: CheckCircle2, tone: 'mint' },
  { label: 'Compensation Assessed', value: '₹32.6 Cr', icon: Wallet, tone: 'amber' },
  { label: 'Compensation Disbursed', value: '₹17.4 Cr', icon: Wallet, tone: 'green' },
  { label: 'Affected Families', value: '1,248', icon: Users, tone: 'orange' },
  { label: 'Projects at Risk', value: '2', icon: AlertTriangle, tone: 'red' },
  { label: 'Blocked Parcels', value: formatNumber(dashboardStats.blockedParcels), icon: Download, tone: 'red' },
]

const districtCoordinates = {
  varanasi: [25.3176, 82.9739],
  lucknow: [26.8467, 80.9462],
  mirzapur: [25.1337, 82.5644],
  sultanpur: [26.2648, 82.0727],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  gandhinagar: [23.2156, 72.6369],
  bhopal: [23.2599, 77.4126],
  indore: [22.7196, 75.8577],
  delhi: [28.6139, 77.209],
  jaipur: [26.9124, 75.7873],
}

function getProjectLocation(state, district) {
  const districtKey = district.trim().toLowerCase()
  if (districtCoordinates[districtKey]) return districtCoordinates[districtKey]
  const stateKey = state.trim().toLowerCase()
  const stateCenters = { gujarat: [22.2587, 71.1924], 'uttar pradesh': [26.8467, 80.9462], madhya: [22.9734, 78.6569], maharashtra: [19.7515, 75.7139], rajasthan: [27.0238, 74.2179] }
  return stateCenters[stateKey] || [22.9734, 78.6569]
}

function getLandArea(value) {
  const area = Number.parseFloat(value)
  return Number.isFinite(area) && area > 0 ? area : 0
}

function buildLandMarkers(center, parcelCount) {
  const count = Math.min(Math.max(Number(parcelCount) || 0, 0), 12)
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / Math.max(count, 1)) * Math.PI * 2
    const distance = 0.004 + (index % 3) * 0.0015
    return { id: `P-${index + 1}`, position: [center[0] + Math.sin(angle) * distance, center[1] + Math.cos(angle) * distance] }
  })
}

function Card({ title, value, icon: Icon, tone }) {
  return (
    <div className="kpi-card">
      <div className="kpi-head">
        <div className={`kpi-icon ${tone}`}><Icon size={18} /></div>
        <span className="kpi-label">{title}</span>
      </div>
      <strong>{value}</strong>
    </div>
  )
}

function ProjectCreationPanel({ role, profile, onProjectCreated }) {
  const scope = role === 'nationalOfficer' ? 'National' : role === 'stateOfficer' ? 'State' : 'District'
  const initialForm = { name: '', state: role === 'districtOfficer' ? profile.jurisdictionState || 'Uttar Pradesh' : role === 'stateOfficer' ? profile.jurisdiction : '', district: role === 'districtOfficer' ? profile.jurisdiction : '', description: '', totalLandRequired: '', totalParcels: '', authority: '', proposalDeadline: '', bidOpeningDate: '' }
  const [showForm, setShowForm] = useState(false)
  const [projectForm, setProjectForm] = useState(initialForm)
  const updateProjectField = (field, value) => setProjectForm((current) => ({ ...current, [field]: value }))
  const projectCenter = getProjectLocation(projectForm.state, projectForm.district)
  const requiredLand = getLandArea(projectForm.totalLandRequired)
  const requiredLandRadius = requiredLand ? Math.sqrt((requiredLand * 10000) / Math.PI) : 0
  const plannedMarkers = buildLandMarkers(projectCenter, projectForm.totalParcels)

  const addProject = (event) => {
    event.preventDefault()
    if (!projectForm.name || !projectForm.state || !projectForm.district || !projectForm.description || !projectForm.totalLandRequired || !projectForm.totalParcels || !projectForm.proposalDeadline || !projectForm.bidOpeningDate || projectForm.bidOpeningDate <= projectForm.proposalDeadline) return
    const createdProject = {
      id: `NEW-${Date.now()}`,
      name: projectForm.name,
      state: projectForm.state,
      district: projectForm.district,
      totalLandRequired: `${requiredLand} ha`,
      totalParcels: Number(projectForm.totalParcels),
      acquired: 0,
      pending: Number(projectForm.totalParcels),
      blocked: 0,
      progress: 0,
      status: 'New',
      stage: 'Proposal',
      daysRemaining: 90,
      proposalDeadline: projectForm.proposalDeadline,
      bidOpeningDate: projectForm.bidOpeningDate,
      authority: projectForm.authority || `${scope} project authority`,
      description: projectForm.description,
      accessLevel: scope.toLowerCase(),
      ownerRole: role,
      level: scope.toLowerCase(),
      jurisdiction: role === 'nationalOfficer' ? 'India' : role === 'stateOfficer' ? profile.jurisdiction : `${projectForm.district}, ${projectForm.state}`,
      villages: [],
      readiness: 'Pending setup',
      keyParcel: '',
    }
    onProjectCreated(createdProject)
    setProjectForm(initialForm)
    setShowForm(false)
  }

  return <div className="panel-card">
    <div className="section-header">
      <div><div className="eyebrow">{scope} project registration</div><h3>Add New {scope} Project</h3></div>
      <button className="primary-btn small" type="button" onClick={() => setShowForm((current) => !current)}><Plus size={15} /> {showForm ? 'Close Form' : 'Add Project'}</button>
    </div>
    {showForm && <form className="project-form" onSubmit={addProject}>
      <div className="access-scope-banner"><ShieldCheck size={16} /><span>This form creates a <strong>{scope.toLowerCase()} project</strong>{role === 'nationalOfficer' ? ' visible to national monitoring.' : ` within ${role === 'stateOfficer' ? profile.jurisdiction : profile.jurisdiction} only.`}</span></div>
      <div className="form-grid">
        <input aria-label="Project name" value={projectForm.name} onChange={(event) => updateProjectField('name', event.target.value)} placeholder="Project name" required />
        <input aria-label="State" value={projectForm.state} onChange={(event) => updateProjectField('state', event.target.value)} placeholder="State" disabled={role !== 'nationalOfficer'} required />
        <input aria-label="District" value={projectForm.district} onChange={(event) => updateProjectField('district', event.target.value)} placeholder="District" disabled={role === 'districtOfficer'} required />
        <input aria-label="Total land required" type="number" min="0.1" step="0.1" value={projectForm.totalLandRequired} onChange={(event) => updateProjectField('totalLandRequired', event.target.value)} placeholder="Required land (ha)" required />
        <input aria-label="Total parcels" type="number" min="1" value={projectForm.totalParcels} onChange={(event) => updateProjectField('totalParcels', event.target.value)} placeholder="Total parcels" required />
        <input aria-label="Project authority" value={projectForm.authority} onChange={(event) => updateProjectField('authority', event.target.value)} placeholder="Project authority" />
        <label>Proposal submission deadline<input aria-label="Proposal submission deadline" type="date" value={projectForm.proposalDeadline} onChange={(event) => updateProjectField('proposalDeadline', event.target.value)} required /></label>
        <label>Bid opening date<input aria-label="Bid opening date" type="date" min={projectForm.proposalDeadline || undefined} value={projectForm.bidOpeningDate} onChange={(event) => updateProjectField('bidOpeningDate', event.target.value)} required /></label>
        <textarea aria-label="Project description" value={projectForm.description} onChange={(event) => updateProjectField('description', event.target.value)} placeholder="Project description" rows="2" required />
      </div>
      <div className="land-planning-grid">
        <div className="land-map-card">
          <div className="section-header"><h4>Required Land Map</h4><span className="pill neutral">{requiredLand ? `${requiredLand} ha estimated` : 'Enter land area'}</span></div>
          <MapContainer key={`${projectCenter.join('-')}-${requiredLand}`} center={projectCenter} zoom={requiredLand ? 12 : 8} scrollWheelZoom={false} className="project-land-map">
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {requiredLand > 0 && <Circle center={projectCenter} radius={requiredLandRadius} pathOptions={{ color: '#0f766e', fillColor: '#14b8a6', fillOpacity: 0.25 }}><Popup><strong>Estimated required land</strong><br />{requiredLand} hectares<br />{projectForm.description || `New ${scope.toLowerCase()} project`}</Popup></Circle>}
            {plannedMarkers.map((marker) => <Marker key={marker.id} position={marker.position}><Popup>Planned parcel {marker.id}</Popup></Marker>)}
          </MapContainer>
          <div className="map-planning-note">Location: {projectForm.district || 'District'}{projectForm.state ? `, ${projectForm.state}` : ''}. The highlighted boundary is an estimated planning footprint for this prototype.</div>
        </div>
        <div className="land-summary"><div className="eyebrow">Automatic estimate</div><h4>Required land section</h4><div className="mini-grid"><div><label>Required area</label><strong>{requiredLand ? `${requiredLand} ha` : '—'}</strong></div><div><label>Planned parcels</label><strong>{projectForm.totalParcels || '—'}</strong></div><div><label>Map status</label><strong>{projectForm.district || projectForm.state ? 'Location resolved' : 'Awaiting location'}</strong></div><div><label>Project level</label><strong>{scope}</strong></div></div><p>Enter the required land and parcel count to update the map automatically.</p></div>
      </div>
      <div className="form-actions"><button className="primary-btn" type="submit">Create {scope} Project</button><button className="secondary-btn" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
    </form>}
  </div>
}

function BiddingManagementPanel({ projectsToBid, proposalSubmissions, bidSubmissions, activeBiddingProjectIds, onStartBidding }) {
  const navigate = useNavigate()
  return <div className="panel-card bidding-management-panel">
    <div className="section-header"><div><div className="eyebrow">Government bidding desk</div><h3>Proposal deadline & bid calendar</h3></div><span className="pill neutral">{projectsToBid.length} projects</span></div>
    <p className="intelligence-note"><CalendarClock size={15} /> Companies can submit proposals until the closing date. The bid-opening date is fixed after submissions close.</p>
    <div className="bidding-calendar-list">
      {projectsToBid.map((project) => {
        const proposalCount = proposalSubmissions.filter((item) => item.projectId === project.id).length
        const projectBids = bidSubmissions.filter((item) => item.projectId === project.id)
        const bidCount = projectBids.length
        const isBiddingActive = activeBiddingProjectIds.includes(project.id)
        return <div className="bidding-calendar-row" key={project.id}>
          <div className="bidding-project-copy"><strong>{project.name}</strong><span>{project.id} · {project.district}</span></div>
          <div className="bidding-date"><CalendarClock size={14} /><span>Proposal deadline<strong>{project.proposalDeadline || 'Not set'}</strong></span></div>
          <div className="bidding-date"><Gavel size={14} /><span>Bid opening<strong>{project.bidOpeningDate || 'Not set'}</strong></span></div>
          <div className="bidding-counts"><span className={`status-badge ${proposalCount ? 'warning' : 'neutral'}`}>{proposalCount} proposal{proposalCount === 1 ? '' : 's'}</span><span className={`status-badge ${bidCount ? 'success' : 'neutral'}`}>{bidCount} bid{bidCount === 1 ? '' : 's'}</span><span className={`status-badge ${isBiddingActive ? 'success' : 'neutral'}`}>{isBiddingActive ? 'Bidding active' : 'Not started'}</span>{projectBids.length > 0 && <div className="bid-submission-list">{projectBids.map((bid) => <span key={`${bid.companyName}-${bid.submittedAt}`}>{bid.companyName} · ₹{bid.amount}</span>)}</div>}<button className="primary-btn small" type="button" disabled={isBiddingActive} onClick={() => { onStartBidding(project.id); navigate(`/projects/${project.id}/bidding`) }}>{isBiddingActive ? 'Bidding started' : 'Start bidding'}</button></div>
        </div>
      })}
      {!projectsToBid.length && <div className="empty-state">No projects are available for bidding management at this level.</div>}
    </div>
  </div>
}

const aiCompanyProfiles = [
  { name: 'Arvind Infrastructure Pvt. Ltd.', specialty: 'Highways and heavy civil', baseScore: 91 },
  { name: 'Kashi GeoWorks Consortium', specialty: 'Survey, GIS and land services', baseScore: 87 },
  { name: 'Pragati Urban Systems', specialty: 'Urban infrastructure delivery', baseScore: 83 },
]

function ProposalIntelligencePanel({ level, projectsToReview, proposalSubmissions }) {
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const levelLabel = level === 'national' ? 'National ministry' : level === 'state' ? 'State government' : 'District administration'
  const getRecommendations = (project) => aiCompanyProfiles.map((company) => {
    const proposal = proposalSubmissions.find((item) => item.projectId === project.id && item.companyName === company.name)
    const fitAdjustment = project.projectType.includes('Rail') && company.name === 'Pragati Urban Systems' ? -7 : 0
    return { ...company, proposal, score: Math.min(99, company.baseScore + fitAdjustment + (proposal ? 5 : 0)) }
  }).sort((first, second) => second.score - first.score)

  const selectedProject = projectsToReview.find((project) => project.id === selectedProjectId)
  const selectedProposals = selectedProject ? proposalSubmissions.filter((item) => item.projectId === selectedProject.id) : []
  const selectedRecommendations = selectedProject ? getRecommendations(selectedProject) : []

  return <div className="panel-card proposal-intelligence">
    <div className="section-header"><div><div className="eyebrow">AI-assisted procurement desk</div><h3>Company proposals & recommendations</h3></div><span className="pill neutral">{levelLabel}</span></div>
    <p className="intelligence-note"><BrainCircuit size={15} /> Select a project to review every company proposal and see the AI-ranked recommendation. Officers retain final approval.</p>
    <div className="proposal-review-layout">
      <div className="proposal-project-list">
        <div className="proposal-list-label">Projects awaiting review</div>
        {projectsToReview.map((project) => {
          const proposalCount = proposalSubmissions.filter((item) => item.projectId === project.id).length
          return <button className={`proposal-project-select ${selectedProjectId === project.id ? 'selected' : ''}`} type="button" key={project.id} onClick={() => setSelectedProjectId(project.id)}><span><strong>{project.name}</strong><small>{project.id} · {project.district}</small></span><span className={`status-badge ${proposalCount ? 'warning' : 'neutral'}`}>{proposalCount ? `${proposalCount} proposal${proposalCount > 1 ? 's' : ''}` : 'No proposals'}</span></button>
        })}
        {!projectsToReview.length && <div className="empty-state">No {levelLabel.toLowerCase()} projects are currently assigned for proposal review.</div>}
      </div>
      {selectedProject && <div className="proposal-review-detail">
        <div className="proposal-review-heading"><div><div className="eyebrow">Selected project</div><strong>{selectedProject.name}</strong><span>{selectedProject.id} · {selectedProject.authority}</span></div><span className="status-badge neutral">{selectedProject.stage}</span></div>
        <div className="proposal-project-facts"><div><label>Location</label><strong>{selectedProject.district}, {selectedProject.state}</strong></div><div><label>Project type</label><strong>{selectedProject.projectType}</strong></div><div><label>Land required</label><strong>{selectedProject.totalLandRequired}</strong></div><div><label>Parcels</label><strong>{selectedProject.totalParcels}</strong></div><div><label>Proposal deadline</label><strong>{selectedProject.proposalDeadline}</strong></div><div><label>Bid opening</label><strong>{selectedProject.bidOpeningDate || 'Not set'}</strong></div></div>
        <div className="proposal-detail-section"><div className="proposal-detail-title"><h4>Received proposals</h4><span className="pill neutral">{selectedProposals.length} received</span></div>{selectedProposals.length ? selectedProposals.map((proposal) => { const company = companyProfiles[proposal.companyName]; return <div className="proposal-full-card" key={`${proposal.companyName}-${proposal.submittedAt}`}><div className="proposal-full-header"><div><strong>{proposal.companyName}</strong><span>Submitted {new Date(proposal.submittedAt).toLocaleDateString('en-IN')} · {company?.legalName || 'Registered partner'}</span></div><span className="status-badge warning">Under review</span></div>{company && <div className="company-profile-summary"><div className="company-profile-heading"><div><div className="eyebrow">Company profile</div><strong>{company.legalName}</strong></div><span className="status-badge success">Rating {company.rating}</span></div><div className="company-profile-grid"><div><label>Registration</label><p>{company.registrationNumber}</p></div><div><label>Headquarters</label><p>{company.headquarters}</p></div><div><label>Experience</label><p>{company.yearsInBusiness} years · {company.completedProjects} projects</p></div><div><label>Scale</label><p>{company.employees} employees · {company.annualTurnover} turnover</p></div><div><label>Contact</label><p>{company.contact}</p></div><div><label>Phone</label><p>{company.phone}</p></div></div><div><label>Services offered</label><div className="service-tags">{company.services.map((service) => <span key={service}>{service}</span>)}</div></div><div><label>Certifications</label><div className="service-tags muted-tags">{company.certifications.map((certification) => <span key={certification}>{certification}</span>)}</div></div></div>}<div className="proposal-field-grid"><div><label>Proposed work scope</label><p>{proposal.scope}</p></div><div><label>Delivery timeline</label><p>{proposal.timeline}</p></div><div><label>Estimated value</label><p>₹{Number(proposal.amount).toLocaleString('en-IN')}</p></div></div><div><label>Message to authority</label><p className="proposal-message">{proposal.message}</p></div></div> }) : <div className="empty-state">No company has submitted a proposal for this project yet.</div>}</div>
        {selectedProposals.length > 0 ? <div className="proposal-detail-section recommendation-section"><div className="proposal-detail-title"><div><div className="eyebrow">Decision support</div><h4>AI recommendation</h4></div><span className="pill success">Best match: {selectedRecommendations[0]?.score}%</span></div><p className="recommendation-method"><BrainCircuit size={14} /> Ranked only from companies that submitted proposals for this project.</p><div className="recommendation-grid">{selectedRecommendations.filter((company) => company.proposal).map((company, index) => <div className={`recommendation-item ${index === 0 ? 'top-recommendation' : ''}`} key={company.name}><div className="recommendation-rank">{index + 1}</div><div className="recommendation-copy"><strong>{company.name}</strong><span>{company.specialty}</span><small><Send size={12} /> Proposal received · {company.proposal.timeline}</small></div><b>{company.score}%</b></div>)}</div></div> : <div className="proposal-detail-section recommendation-section recommendation-pending"><BrainCircuit size={16} /><div><h4>AI recommendation pending</h4><p>The system will rank the best company after one or more proposals are received.</p></div></div>}
      </div>}
    </div>
  </div>
}

function NationalDashboard({ proposalSubmissions, bidSubmissions, activeBiddingProjectIds, onStartBidding }) {
  const [newProjects, setNewProjects] = useState([])
  const visibleProjects = [...newProjects, ...projects]
  const visibleAlerts = getVisibleAlerts('nationalOfficer')
  const title = 'National Monitoring Dashboard'
  const scopeLabel = 'India'

  return (
    <div className="stack-block">
      <div className="section-header"><h2>{title}</h2><span className="pill neutral">Scope: {scopeLabel}</span></div>

      <div className="kpi-grid">
        {kpiData.map((item) => (
          <Card key={item.label} title={item.label} value={item.value} icon={item.icon} tone={item.tone} />
        ))}
      </div>

      <ProjectCreationPanel role="nationalOfficer" profile={userProfiles.find((item) => item.role === 'nationalOfficer')} onProjectCreated={(project) => setNewProjects((current) => [project, ...current])} />
      <BiddingManagementPanel projectsToBid={visibleProjects} proposalSubmissions={proposalSubmissions} bidSubmissions={bidSubmissions} activeBiddingProjectIds={activeBiddingProjectIds} onStartBidding={onStartBidding} />
      <ProposalIntelligencePanel level="national" projectsToReview={visibleProjects.filter((project) => project.level === 'national')} proposalSubmissions={proposalSubmissions} />

      <div className="content-grid two-up">
        <div className="panel-card table-panel">
          <div className="section-header"><h3>Projects Requiring Attention</h3></div>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>State</th>
                <th>Parcels</th>
                <th>Blocked</th>
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.state}</td>
                  <td>{project.totalParcels}</td>
                  <td>{project.blocked}</td>
                  <td>{project.daysRemaining} days</td>
                  <td><span className={`status-badge ${project.status === 'Delayed' ? 'danger' : project.status === 'Attention' ? 'warning' : 'success'}`}>{project.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel-card">
          <div className="section-header"><h3>Critical Alerts</h3></div>
          <div className="alert-stack">
            {visibleAlerts.map((alert) => (
              <div key={alert.id} className="alert-item">
                <div className={`alert-icon ${alert.severity.toLowerCase()}`}><AlertTriangle size={14} /></div>
                <div className="alert-body">
                  <div className="alert-topline">
                    <strong>{alert.title}</strong>
                    <span className={`status-badge ${alert.severity === 'Critical' ? 'danger' : 'warning'}`}>{alert.severity}</span>
                  </div>
                  <p>{alert.project} • {alert.parcel}</p>
                  <small>{alert.deadline}</small>
                </div>
                <button className="secondary-btn small">View Details</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="section-header"><h3>Recent Activity</h3></div>
        <ul className="activity-list">
          {activityFeed.map((item, index) => (
            <li key={index}><span className="dot" />{item}</li>
          ))}
        </ul>
      </div>

      <div className="panel-card">
        <div className="section-header"><h3>State Comparison</h3></div>
        <div className="chart-wrap wide">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stateComparison}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="state" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="#0f766e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function MetricStrip({ items }) {
  return <div className="kpi-grid">{items.map((item) => <Card key={item.label} title={item.label} {...item} />)}</div>
}

function StateDashboard({ profile, proposalSubmissions, bidSubmissions, activeBiddingProjectIds, onStartBidding }) {
  const [newProjects, setNewProjects] = useState([])
  const stateProjects = [...newProjects, ...getVisibleProjects('stateOfficer', profile)]
  const stateAlerts = getVisibleAlerts('stateOfficer', profile)
  return <div className="stack-block">
    <div className="section-header"><h2>State Monitoring Dashboard</h2><span className="pill neutral">Scope: {profile.jurisdiction}</span></div>
    <MetricStrip items={[
      { label: 'Projects in State', value: stateProjects.length, icon: ShieldCheck, tone: 'blue' },
      { label: 'State Acquisition Area', value: '663.1 ha', icon: MapPinned, tone: 'green' },
      { label: 'Pending Objections', value: '18', icon: CircleAlert, tone: 'amber' },
      { label: 'Awards Due', value: '11', icon: AlertTriangle, tone: 'orange' },
      { label: 'Failed Payments', value: '12', icon: Download, tone: 'red' },
      { label: 'R&R Progress', value: '68%', icon: CheckCircle2, tone: 'mint' },
    ]} />
    <ProjectCreationPanel role="stateOfficer" profile={profile} onProjectCreated={(project) => setNewProjects((current) => [project, ...current])} />
    <BiddingManagementPanel projectsToBid={stateProjects} proposalSubmissions={proposalSubmissions} bidSubmissions={bidSubmissions} activeBiddingProjectIds={activeBiddingProjectIds} onStartBidding={onStartBidding} />
    <ProposalIntelligencePanel level="state" projectsToReview={stateProjects.filter((project) => project.level === 'state')} proposalSubmissions={proposalSubmissions} />
    <div className="content-grid two-up"><div className="panel-card table-panel"><div className="section-header"><h3>State Project Register</h3></div><table><thead><tr><th>Project</th><th>District</th><th>Parcels</th><th>Progress</th></tr></thead><tbody>{stateProjects.map((project) => <tr key={project.id}><td>{project.name}</td><td>{project.district}</td><td>{project.totalParcels}</td><td>{project.progress}%</td></tr>)}</tbody></table></div><div className="panel-card"><div className="section-header"><h3>State Alerts</h3></div><div className="alert-stack">{stateAlerts.slice(0, 3).map((alert) => <div className="alert-item" key={alert.id}><div className="alert-icon warning"><AlertTriangle size={14} /></div><div className="alert-body"><strong>{alert.title}</strong><p>{alert.project}</p></div></div>)}</div></div></div>
    <div className="panel-card"><div className="section-header"><h3>Cross-district Coordination</h3><span className="pill neutral">State statutory clocks</span></div><ul className="activity-list"><li><span className="dot" />8 acquisition cases require CALA follow-up in Ahmedabad-equivalent district workload.</li><li><span className="dot" />11 awards are approaching their statutory decision window.</li><li><span className="dot" />Payment validation is the leading state-level bottleneck.</li></ul></div>
  </div>
}

function DistrictDashboard({ profile, proposalSubmissions, bidSubmissions, activeBiddingProjectIds, onStartBidding }) {
  const [newProjects, setNewProjects] = useState([])
  const districtProjects = [...newProjects, ...getVisibleProjects('districtOfficer', profile)]
  return <div className="stack-block"><div className="section-header"><h2>District Acquisition Dashboard</h2><span className="pill neutral">Scope: {profile.jurisdiction}</span></div><MetricStrip items={[{ label: 'Pending Objections', value: '5', icon: CircleAlert, tone: 'amber' }, { label: 'Hearings Due', value: '8', icon: AlertTriangle, tone: 'orange' }, { label: 'Surveys Pending', value: '12', icon: MapPinned, tone: 'blue' }, { label: 'Awards Due', value: '4', icon: ShieldCheck, tone: 'green' }, { label: 'Failed Payments', value: '3', icon: Download, tone: 'red' }, { label: 'Possession Pending', value: '9', icon: CheckCircle2, tone: 'mint' }]} /><ProjectCreationPanel role="districtOfficer" profile={profile} onProjectCreated={(project) => setNewProjects((current) => [project, ...current])} /><BiddingManagementPanel projectsToBid={districtProjects} proposalSubmissions={proposalSubmissions} bidSubmissions={bidSubmissions} activeBiddingProjectIds={activeBiddingProjectIds} onStartBidding={onStartBidding} /><ProposalIntelligencePanel level="district" projectsToReview={districtProjects.filter((project) => project.level === 'district')} proposalSubmissions={proposalSubmissions} /><div className="content-grid two-up"><div className="panel-card"><div className="section-header"><h3>Pending Actions</h3></div><ul className="activity-list"><li><span className="dot" />5 objections require hearing scheduling</li><li><span className="dot" />12 survey records need verification</li><li><span className="dot" />3 compensation cases failed validation</li><li><span className="dot" />9 parcels are ready for possession review</li></ul></div><div className="panel-card table-panel"><div className="section-header"><h3>District Projects</h3></div><table><thead><tr><th>Project</th><th>Parcels</th><th>Progress</th></tr></thead><tbody>{districtProjects.map((project) => <tr key={project.id}><td>{project.name}</td><td>{project.totalParcels}</td><td>{project.progress}%</td></tr>)}</tbody></table></div></div></div>
}

export function SpecialistDashboard({ role, profile, projectId }) {
  const isFinance = role === 'financeOfficer'
  const items = isFinance ? [{ label: 'Compensation Assessed', value: '₹32.6 Cr', icon: Wallet, tone: 'blue' }, { label: 'Payment Initiated', value: '₹21.4 Cr', icon: TrendingUp, tone: 'green' }, { label: 'Payment Successful', value: '₹17.4 Cr', icon: CheckCircle2, tone: 'mint' }, { label: 'Payment Failed', value: '12', icon: CircleAlert, tone: 'red' }, { label: 'Beneficiary Validation', value: '24', icon: AlertTriangle, tone: 'amber' }] : [{ label: 'Affected Families', value: '1,248', icon: Users, tone: 'blue' }, { label: 'Displaced Families', value: '462', icon: Users, tone: 'orange' }, { label: 'Entitlements Pending', value: '572', icon: CircleAlert, tone: 'amber' }, { label: 'Entitlements Delivered', value: '1,218', icon: CheckCircle2, tone: 'green' }, { label: 'Evidence Pending', value: '7', icon: AlertTriangle, tone: 'red' }]
  return <div className="stack-block"><div className="section-header"><h2>{isFinance ? 'Finance Operations Dashboard' : 'R&R Dashboard'}</h2><span className="pill neutral">{projectId ? `Project ${projectId}` : profile.jurisdiction}</span></div><MetricStrip items={items} /><div className="content-grid two-up"><div className="panel-card"><div className="section-header"><h3>{isFinance ? 'Payment Queue' : 'Families Requiring Attention'}</h3></div><ul className="activity-list">{(isFinance ? ['12 payments failed beneficiary validation', '18 beneficiaries await validation', '₹12.7 Cr remains pending disbursement'] : ['7 entitlement deliveries are pending evidence', '18 families await rehabilitation linkage', '4 displaced families need case review']).map((item) => <li key={item}><span className="dot" />{item}</li>)}</ul></div><div className="panel-card"><div className="section-header"><h3>Role-specific Actions</h3></div><div className="button-row"><button className="primary-btn">{isFinance ? 'Validate Beneficiary' : 'Review Pending Case'}</button><button className="secondary-btn">{isFinance ? 'Payment Reports' : 'Delivery Evidence'}</button></div></div></div></div>
}

export default function Dashboard({ role, proposalSubmissions = [], bidSubmissions = [], activeBiddingProjectIds = [], onStartBidding }) {
  const profile = userProfiles.find((item) => item.role === role) || userProfiles[0]
  if (role === 'stateOfficer') return <StateDashboard profile={profile} proposalSubmissions={proposalSubmissions} bidSubmissions={bidSubmissions} activeBiddingProjectIds={activeBiddingProjectIds} onStartBidding={onStartBidding} />
  if (role === 'districtOfficer') return <DistrictDashboard profile={profile} proposalSubmissions={proposalSubmissions} bidSubmissions={bidSubmissions} activeBiddingProjectIds={activeBiddingProjectIds} onStartBidding={onStartBidding} />
  if (role === 'financeOfficer' || role === 'rrAdministrator') return <SpecialistDashboard role={role} profile={profile} />
  return <NationalDashboard proposalSubmissions={proposalSubmissions} bidSubmissions={bidSubmissions} activeBiddingProjectIds={activeBiddingProjectIds} onStartBidding={onStartBidding} />
}
