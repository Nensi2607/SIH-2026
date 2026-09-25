import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CalendarClock, CheckCircle2, FileText, Gavel, Search, Send, Target, X } from 'lucide-react'
import { projects } from '../data/mockData'

const initialProposal = { projectId: '', scope: '', timeline: '', amount: '', message: '' }

function getBidPhase(project, activeBiddingProjectIds) {
  if (activeBiddingProjectIds.includes(project.id)) return { label: 'Bidding in progress', tone: 'neutral', canSubmit: false, canBid: true }
  const now = new Date()
  const deadline = project.proposalDeadline ? new Date(`${project.proposalDeadline}T23:59:59`) : null
  const bidOpening = project.bidOpeningDate ? new Date(`${project.bidOpeningDate}T00:00:00`) : null
  if (deadline && now <= deadline) return { label: 'Open for proposals', tone: 'success', canSubmit: true, canBid: false }
  if (bidOpening && now < bidOpening) return { label: 'Proposal review in progress', tone: 'warning', canSubmit: false, canBid: false }
  if (bidOpening && now >= bidOpening) return { label: 'Bidding in progress', tone: 'neutral', canSubmit: false, canBid: true }
  return { label: 'Bidding schedule unavailable', tone: 'neutral', canSubmit: false, canBid: false }
}

function formatBidDate(date) {
  if (!date) return 'Not set'
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Metric({ icon: Icon, label, value, tone }) {
  return <div className="kpi-card company-metric">
    <div className={`kpi-icon ${tone}`}><Icon size={18} /></div>
    <span className="kpi-label">{label}</span>
    <strong>{value}</strong>
  </div>
}

export default function CompanyDashboard({ profile, proposalSubmissions = [], bidSubmissions = [], activeBiddingProjectIds = [], onProposalSubmitted, onBidSubmitted }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [selectedProject, setSelectedProject] = useState(null)
  const [proposal, setProposal] = useState(initialProposal)
  const navigate = useNavigate()

  const projectTypes = ['All', ...new Set(projects.map((project) => project.projectType))]
  const filteredProjects = useMemo(() => projects.filter((project) => {
    const query = searchTerm.trim().toLowerCase()
    const matchesSearch = !query || `${project.name} ${project.id} ${project.state} ${project.district}`.toLowerCase().includes(query)
    return matchesSearch && (typeFilter === 'All' || project.projectType === typeFilter)
  }), [searchTerm, typeFilter])
  const openProjects = projects.filter((project) => getBidPhase(project, activeBiddingProjectIds).canSubmit)

  const openProposal = (project) => {
    setSelectedProject(project)
    setProposal((current) => ({ ...current, projectId: project.id }))
  }

  const submitProposal = (event) => {
    event.preventDefault()
    if (!proposal.scope || !proposal.timeline || !proposal.amount || !proposal.message) return
    const selectedCompany = profile?.company || profile?.name || 'Partner company'
    const selectedHasProposal = proposalSubmissions.some((item) => item.projectId === selectedProject.id && item.companyName === selectedCompany)
    const isBid = getBidPhase(selectedProject, activeBiddingProjectIds).canBid && selectedHasProposal
    const previousBids = bidSubmissions.filter((item) => item.projectId === selectedProject.id && item.companyName === (profile?.company || profile?.name || 'Partner company')).length
    const submission = { ...proposal, type: isBid ? 'bid' : 'proposal', revision: isBid ? previousBids + 1 : undefined, projectName: selectedProject.name, companyName: profile?.company || profile?.name || 'Partner company', submittedAt: new Date().toISOString() }
    if (isBid) onBidSubmitted?.(submission)
    else onProposalSubmitted?.(submission)
    setSelectedProject(null)
    setProposal(initialProposal)
  }

  return <div className="stack-block company-dashboard">
    <div className="company-hero">
      <div>
        <div className="eyebrow">Partner workspace · procurement opportunities</div>
        <h2>Find the next project to build</h2>
        <p>Review government-led land acquisition projects and send a capability proposal directly to the responsible authority.</p>
      </div>
      <div className="company-hero-mark"><Building2 size={30} /></div>
    </div>

    <div className="kpi-grid four-up">
      <Metric icon={Target} label="Open opportunities" value={projects.length} tone="blue" />
      <Metric icon={FileText} label="Proposals submitted" value={proposalSubmissions.length} tone="mint" />
      <Metric icon={Gavel} label="Bids submitted" value={bidSubmissions.length} tone="green" />
      <Metric icon={CalendarClock} label="Closing this month" value="2" tone="amber" />
      <Metric icon={CheckCircle2} label="Average readiness" value="83%" tone="blue" />
    </div>

    <div className="section-header company-section-heading">
      <div><div className="eyebrow">Government project marketplace</div><h3>Available projects</h3></div>
      <span className="pill neutral">{filteredProjects.length} of {projects.length} visible</span>
    </div>

    <div className="panel-card company-bidding-module">
      <div className="section-header"><div><div className="eyebrow">Bidding module</div><h3>Proposal and bid schedule</h3></div><span className="pill neutral">{openProjects.length} open for proposals</span></div>
      <div className="company-bidding-flow"><div><CalendarClock size={16} /><span>1. Submit proposal<strong>Before government deadline</strong></span></div><div className="company-bidding-arrow">→</div><div><Gavel size={16} /><span>2. Government opens bids<strong>After submissions close</strong></span></div><div className="company-bidding-arrow">→</div><div><CheckCircle2 size={16} /><span>3. Award decision<strong>Government evaluation</strong></span></div></div>
    </div>

    <div className="filter-grid company-filters">
      <div className="search-box company-search"><Search size={15} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search project, location or ID" /></div>
      <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>{projectTypes.map((type) => <option key={type}>{type}</option>)}</select>
    </div>

    <div className="company-project-grid">
      {filteredProjects.map((project) => {
        const hasProposal = proposalSubmissions.some((item) => item.projectId === project.id && item.companyName === (profile?.company || profile?.name))
        const hasBid = bidSubmissions.some((item) => item.projectId === project.id && item.companyName === (profile?.company || profile?.name))
        const bidPhase = getBidPhase(project, activeBiddingProjectIds)
        const canSeeBids = hasProposal && bidPhase.canBid
        const canAct = bidPhase.canSubmit || hasProposal
        return <article className="company-project-card" key={project.id}>
          <div className="project-card-topline"><span className={`status-badge ${hasBid ? 'success' : bidPhase.tone}`}>{hasBid ? 'Bid submitted' : hasProposal && !bidPhase.canBid ? 'Proposal submitted' : bidPhase.label}</span><span className="project-id">{project.id}</span></div>
          <h3>{project.name}</h3>
          <p className="company-project-location">{project.district}, {project.state} · {project.projectType}</p>
          <div className="company-project-details"><span><strong>{project.totalLandRequired}</strong> land</span><span><strong>{project.totalParcels}</strong> parcels</span><span><strong>{formatBidDate(project.proposalDeadline)}</strong> proposal close</span><span><strong>{formatBidDate(project.bidOpeningDate)}</strong> bid opening</span></div>
          <div className="company-progress"><div><span>Government readiness</span><strong>{project.readiness}</strong></div><div className="progress-line"><span style={{ width: project.readiness }} /></div></div>
          <div className="company-card-footer"><span>Authority: {project.authority}</span><div className="company-project-actions"><button className="secondary-btn small" type="button" disabled={!hasProposal} onClick={() => navigate(`/company-dashboard/projects/${project.id}/bidding`)}>{hasProposal ? 'Participate in bid' : 'Submit proposal first'}</button><button className="primary-btn small" type="button" disabled={!canAct} onClick={() => hasProposal ? navigate(`/company-dashboard/projects/${project.id}/bidding`) : openProposal(project)}>{hasBid && canSeeBids ? <><Gavel size={14} /> Change bid price</> : hasBid ? <><CheckCircle2 size={14} /> Bid submitted</> : hasProposal ? <><Gavel size={14} /> Participate in bid</> : bidPhase.canSubmit ? <><Send size={14} /> Send proposal</> : bidPhase.canBid ? 'Submit proposal first' : 'Submissions closed'}</button></div></div>
        </article>
      })}
    </div>

    {(proposalSubmissions.length > 0 || bidSubmissions.length > 0) && <div className="panel-card proposal-history"><div className="section-header"><div><div className="eyebrow">Your activity</div><h3>Proposals and bids</h3></div><span className="pill success">Tracked</span></div>{[...proposalSubmissions, ...bidSubmissions].filter((item) => item.companyName === (profile?.company || profile?.name)).map((item) => <div className="proposal-row" key={`${item.type || 'proposal'}-${item.projectId}-${item.amount}`}><div><strong>{item.projectName}</strong><span>{item.projectId} · {item.timeline}</span></div><span className={`status-badge ${item.type === 'bid' ? 'success' : 'warning'}`}>{item.type === 'bid' ? 'Bid submitted' : 'Proposal submitted'}</span></div>)}</div>}

    {selectedProject && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProject(null) }}><div className="proposal-modal" role="dialog" aria-modal="true" aria-labelledby="proposal-title"><div className="section-header"><div><div className="eyebrow">{getBidPhase(selectedProject, activeBiddingProjectIds).canBid ? 'Bid' : 'Proposal'} for {selectedProject.id}</div><h3 id="proposal-title">{selectedProject.name}</h3></div><button className="icon-button" type="button" aria-label="Close proposal form" onClick={() => setSelectedProject(null)}><X size={16} /></button></div><p className="modal-intro">{getBidPhase(selectedProject, activeBiddingProjectIds).canBid ? 'Submit your commercial bid for government evaluation.' : 'Tell the government team how your company can deliver this project.'}</p><form className="proposal-form" onSubmit={submitProposal}><label>{getBidPhase(selectedProject, activeBiddingProjectIds).canBid ? 'Bid work scope' : 'Work scope'}<input value={proposal.scope} onChange={(event) => setProposal({ ...proposal, scope: event.target.value })} placeholder="e.g. Survey, civil works and project management" required /></label><div className="proposal-form-grid"><label>Delivery timeline<input value={proposal.timeline} onChange={(event) => setProposal({ ...proposal, timeline: event.target.value })} placeholder="e.g. 18 months" required /></label><label>{getBidPhase(selectedProject, activeBiddingProjectIds).canBid ? 'Bid amount' : 'Estimated proposal value'}<input type="number" min="1" value={proposal.amount} onChange={(event) => setProposal({ ...proposal, amount: event.target.value })} placeholder="Amount in INR" required /></label></div><label>Message to authority<textarea rows="4" value={proposal.message} onChange={(event) => setProposal({ ...proposal, message: event.target.value })} placeholder="Add your approach, experience and delivery strengths" required /></label><div className="form-actions"><button className="primary-btn" type="submit">{getBidPhase(selectedProject, activeBiddingProjectIds).canBid ? <><Gavel size={15} /> Submit bid</> : <><Send size={15} /> Submit proposal</>}</button><button className="secondary-btn" type="button" onClick={() => setSelectedProject(null)}>Cancel</button></div></form></div></div>}
  </div>
}
