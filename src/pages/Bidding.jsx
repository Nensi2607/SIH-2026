import { Gavel, Link as LinkIcon, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { projects } from '../data/mockData'

const temporaryBids = [
  { companyName: 'Arvind Infrastructure Pvt. Ltd.', amount: '₹42.8 Cr', timeline: '18 months', score: '91%' },
  { companyName: 'Kashi GeoWorks Consortium', amount: '₹39.6 Cr', timeline: '20 months', score: '87%' },
  { companyName: 'Pragati Urban Systems', amount: '₹45.2 Cr', timeline: '16 months', score: '83%' },
]

export default function BiddingPage({ activeBiddingProjectIds = [], bidSubmissions = [] }) {
  const { projectId } = useParams()
  const project = projects.find((item) => item.id === projectId)
  const isActive = activeBiddingProjectIds.includes(projectId)
  const submittedBids = bidSubmissions.filter((item) => item.projectId === projectId)

  if (!project) return <div className="panel-card"><h2>Project not found</h2></div>

  return (
    <div className="stack-block bidding-page">
      <div className="section-header two-line">
        <div><div className="eyebrow">Government bidding simulation</div><h2>{project.name}</h2><span className="project-id">{project.id} · {project.authority}</span></div>
        <span className={`status-badge ${isActive ? 'success' : 'neutral'}`}>{isActive ? 'Bidding active' : 'Ready for bid round'}</span>
      </div>

      <div className="panel-card bidding-hero-panel">
        <div className="bidding-hero-icon"><Gavel size={23} /></div>
        <div><div className="eyebrow">Live simulation</div><h3>{isActive ? 'Companies can now bid for this project' : 'Bid round is ready to open'}</h3><p>{isActive ? 'Temporary company bids are shown below for demonstration. Real company submissions will appear in the same register.' : 'Return to the dashboard and click Start bidding to open this project bidding round.'}</p></div>
      </div>

      <div className="kpi-grid three-up">
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Proposal deadline</span></div><strong>{project.proposalDeadline}</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Bid opening date</span></div><strong>{project.bidOpeningDate}</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Bids received</span></div><strong>{isActive ? temporaryBids.length + submittedBids.length : 0}</strong></div>
      </div>

      {isActive && <div className="panel-card table-panel">
        <div className="section-header"><div><div className="eyebrow">Bid register</div><h3>Companies bidding for this project</h3></div><span className="pill success"><Users size={14} /> {temporaryBids.length + submittedBids.length} bidders</span></div>
        <table>
          <thead><tr><th>Company</th><th>Bid amount</th><th>Delivery timeline</th><th>Evaluation score</th><th>Status</th></tr></thead>
          <tbody>
            {temporaryBids.map((bid) => <tr key={bid.companyName}><td><strong>{bid.companyName}</strong><small className="table-subtext">Temporary simulation bid</small></td><td>{bid.amount}</td><td>{bid.timeline}</td><td>{bid.score}</td><td><span className="status-badge success">Received</span></td></tr>)}
            {submittedBids.map((bid) => <tr key={`${bid.companyName}-${bid.submittedAt}`}><td><strong>{bid.companyName}</strong><small className="table-subtext">Live portal submission</small></td><td>₹{bid.amount}</td><td>{bid.timeline}</td><td>Pending</td><td><span className="status-badge warning">Under review</span></td></tr>)}
          </tbody>
        </table>
      </div>}

      <div className="button-row"><Link className="secondary-btn" to={`/projects/${project.id}`}>Back to project</Link><Link className="secondary-btn" to="/dashboard"><LinkIcon size={14} /> Government dashboard</Link></div>
    </div>
  )
}
