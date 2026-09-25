import { Gavel, ArrowLeft, Send } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { projects } from '../data/mockData'

const temporaryBids = [
  { companyName: 'Arvind Infrastructure Pvt. Ltd.', amount: '42.8 Cr', timeline: '18 months', score: '91%' },
  { companyName: 'Kashi GeoWorks Consortium', amount: '39.6 Cr', timeline: '20 months', score: '87%' },
  { companyName: 'Pragati Urban Systems', amount: '45.2 Cr', timeline: '16 months', score: '83%' },
]

export default function CompanyBiddingPage({ profile, proposalSubmissions = [], activeBiddingProjectIds = [], bidSubmissions = [], onBidSubmitted }) {
  const { projectId } = useParams()
  const project = projects.find((item) => item.id === projectId)
  const companyName = profile?.company || profile?.name || 'Partner company'
  const hasProposal = proposalSubmissions.some((item) => item.projectId === projectId && item.companyName === companyName)
  const isActive = activeBiddingProjectIds.includes(projectId)
  const [bidAmount, setBidAmount] = useState('')
  const [timeline, setTimeline] = useState('')
  const [scope, setScope] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!project) return <div className="panel-card"><h2>Project not found</h2></div>

  const companyBids = bidSubmissions.filter((item) => item.projectId === projectId && item.companyName === companyName)
  const allBids = [...temporaryBids, ...bidSubmissions.filter((item) => item.projectId === projectId).map((item) => ({ ...item, amount: item.amount, score: 'Pending', revision: item.revision }))]

  const submitBid = (event) => {
    event.preventDefault()
    if (!bidAmount || !timeline || !scope || !message || !isActive) return
    onBidSubmitted?.({ projectId, projectName: project.name, companyName, type: 'bid', revision: companyBids.length + 1, amount: bidAmount, timeline, scope, message, submittedAt: new Date().toISOString() })
    setBidAmount('')
    setTimeline('')
    setScope('')
    setMessage('')
    setSubmitted(true)
  }

  return (
    <div className="stack-block company-bidding-page">
      <div className="section-header two-line"><div><div className="eyebrow">Company bidding participation</div><h2>{project.name}</h2><span className="project-id">{project.id} · {companyName}</span></div><span className="status-badge success">{isActive ? 'Bid round active' : 'Awaiting bid round'}</span></div>

      <div className="panel-card bidding-hero-panel"><div className="bidding-hero-icon"><Gavel size={23} /></div><div><div className="eyebrow">Iterative bid simulation</div><h3>Compare bids and submit a new price</h3><p>Review the current company bids, then submit or revise your bid as many times as needed during the active bid round.</p></div></div>

      {!hasProposal && <div className="empty-state">Submit a project proposal before participating in this bid round.</div>}
      {isActive && hasProposal && <div className="content-grid two-up">
        <div className="panel-card table-panel"><div className="section-header"><div><div className="eyebrow">Live bid board</div><h3>Other companies bidding</h3></div><span className="pill neutral">{allBids.length} bids</span></div><table><thead><tr><th>Company</th><th>Bid value</th><th>Timeline</th><th>Score</th></tr></thead><tbody>{allBids.map((bid, index) => <tr key={`${bid.companyName}-${bid.amount}-${index}`}><td><strong>{bid.companyName}</strong><small className="table-subtext">{bid.companyName === companyName ? `Your revision ${bid.revision || 1}` : 'Company bid'}</small></td><td>₹{bid.amount}</td><td>{bid.timeline}</td><td>{bid.score}</td></tr>)}</tbody></table></div>
        <div className="panel-card"><div className="section-header"><div><div className="eyebrow">Your participation</div><h3>{companyBids.length ? `Submit revision ${companyBids.length + 1}` : 'Submit your bid'}</h3></div><span className="pill success">Unlimited revisions</span></div><form className="proposal-form" onSubmit={submitBid}><label>Bid value<input type="number" min="1" value={bidAmount} onChange={(event) => setBidAmount(event.target.value)} placeholder="Amount in INR" required /></label><label>Work scope<input value={scope} onChange={(event) => setScope(event.target.value)} placeholder="Describe your bid scope" required /></label><label>Delivery timeline<input value={timeline} onChange={(event) => setTimeline(event.target.value)} placeholder="e.g. 18 months" required /></label><label>Message to authority<textarea rows="4" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Explain this bid revision" required /></label><button className="primary-btn" type="submit"><Send size={15} /> Submit bid again</button>{submitted && <div className="success-banner">Bid submitted. You may submit another revised value at any time.</div>}</form></div>
      </div>}

      <div className="button-row"><Link className="secondary-btn" to="/company-dashboard"><ArrowLeft size={14} /> Back to company dashboard</Link></div>
    </div>
  )
}
