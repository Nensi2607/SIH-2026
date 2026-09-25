import { useState } from 'react'
import { ArrowRight, CheckCircle2, Download, MessageSquareWarning, Send, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { citizenPortalData, getVisibleParcels, userProfiles } from '../data/mockData'
import { formatCurrency } from '../utils/formatters'

const acquisitionStages = ['Notification', 'Objection', 'Survey', 'Award', 'Compensation', 'R&R', 'Possession', 'Closure']

function useCitizenCase() {
  const profile = userProfiles.find((item) => item.role === 'citizen')
  const parcel = getVisibleParcels('citizen', profile)[0]
  return { profile, parcel, projectName: 'BHU National Highway Corridor' }
}

function CitizenHeader({ eyebrow, title, children }) {
  return <div className="citizen-page-header"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{children}</div>
}

function StageTracker({ currentStage = 'Award' }) {
  const currentIndex = acquisitionStages.indexOf(currentStage)
  return <div className="citizen-stage-tracker">{acquisitionStages.map((stage, index) => <div className={`citizen-stage ${index < currentIndex ? 'complete' : index === currentIndex ? 'current' : ''}`} key={stage}><span>{index < currentIndex ? <CheckCircle2 size={14} /> : index + 1}</span><strong>{stage}</strong></div>)}</div>
}

function CitizenOverview() {
  const { profile, parcel, projectName } = useCitizenCase()
  return <div className="stack-block citizen-page">
    <CitizenHeader eyebrow={`BHU-SETU · Welcome, ${profile.name}`} title="My Land Acquisition Overview"><span className="pill neutral">Citizen Portal</span></CitizenHeader>
    <p className="citizen-subtitle">View the current status of your land acquisition case.</p>
    <div className="kpi-grid four-up citizen-summary-grid"><div className="kpi-card"><span className="kpi-label">My Parcel</span><strong>{parcel.ulpin}</strong></div><div className="kpi-card"><span className="kpi-label">Acquisition Stage</span><strong>{parcel.currentStage}</strong></div><div className="kpi-card"><span className="kpi-label">Compensation</span><strong>{formatCurrency(parcel.compensation.awarded)}</strong><small>{parcel.paymentStatus}</small></div><div className="kpi-card"><span className="kpi-label">Next Action</span><strong>Review acquisition notice</strong></div></div>
    <div className="panel-card citizen-feature-card"><div className="section-header"><div><div className="eyebrow">My land</div><h3>{projectName}</h3></div><span className="status-badge warning">{parcel.currentStage}</span></div><div className="citizen-fact-grid"><div><label>ULPIN</label><strong>{parcel.ulpin}</strong></div><div><label>Survey Number</label><strong>{parcel.surveyNo}</strong></div><div><label>Village</label><strong>{parcel.village}</strong></div><div><label>Acquired Area</label><strong>{parcel.area}</strong></div></div><Link className="primary-btn" to="/citizen/acquisition-status">View Acquisition Status <ArrowRight size={15} /></Link></div>
    <div className="panel-card"><div className="section-header"><div><div className="eyebrow">Where is my case?</div><h3>Acquisition Progress</h3></div><span className="pill neutral">Current stage: {parcel.currentStage}</span></div><StageTracker currentStage={parcel.currentStage} /></div>
    <div className="citizen-two-column"><div className="panel-card citizen-notice"><div className="section-header"><div><div className="eyebrow">Important Notice</div><h3>Your award notice is available</h3></div><span className="status-badge warning">Action needed</span></div><p>Your land is currently under the Award stage for the {projectName} project.</p><strong>Response deadline: 24 Nov 2026</strong><div><Link className="secondary-btn small" to="/citizen/documents">View Notice</Link></div></div><div className="panel-card"><div className="section-header"><h3>Quick Actions</h3></div><div className="citizen-quick-actions"><Link to="/citizen/parcel">View My Parcel</Link><Link to="/citizen/compensation">View Compensation</Link><Link to="/citizen/rr-benefits">View R&R Benefits</Link><Link to="/citizen/objections">Submit Objection</Link><Link to="/citizen/grievances">Submit Grievance</Link><Link to="/citizen/documents">View Documents</Link></div></div></div>
  </div>
}

function ParcelPage() {
  const { parcel, projectName } = useCitizenCase()
  return <div className="stack-block citizen-page"><CitizenHeader eyebrow="Citizen Portal" title="My Parcel" /><div className="panel-card citizen-feature-card"><div className="citizen-fact-grid"><div><label>ULPIN</label><strong>{parcel.ulpin}</strong></div><div><label>Survey Number</label><strong>{parcel.surveyNo}</strong></div><div><label>Village</label><strong>{parcel.village}</strong></div><div><label>Project</label><strong>{projectName}</strong></div><div><label>Land Area</label><strong>{parcel.area}</strong></div><div><label>Acquired Area</label><strong>{parcel.area}</strong></div><div><label>Current Stage</label><strong>{parcel.currentStage}</strong></div></div><Link className="primary-btn" to="/citizen/acquisition-status">View Acquisition Status</Link></div></div>
}

function AcquisitionPage() {
  const { parcel, projectName } = useCitizenCase()
  return <div className="stack-block citizen-page"><CitizenHeader eyebrow="My case" title="Acquisition Status"><span className="pill neutral">{projectName}</span></CitizenHeader><div className="panel-card"><div className="citizen-fact-grid"><div><label>Project</label><strong>{projectName}</strong></div><div><label>ULPIN</label><strong>{parcel.ulpin}</strong></div><div><label>Current Stage</label><strong>{parcel.currentStage}</strong></div><div><label>Status</label><strong>{parcel.status}</strong></div></div><StageTracker currentStage={parcel.currentStage} /></div><div className="panel-card"><div className="section-header"><h3>Current stage details</h3><span className="status-badge warning">Award</span></div><p>Your award record has been issued. Compensation processing and R&R delivery are the next steps in your case.</p></div></div>
}

function CompensationPage() {
  const { parcel } = useCitizenCase()
  return <div className="stack-block citizen-page"><CitizenHeader eyebrow="My case" title="My Compensation" /><div className="kpi-grid four-up citizen-summary-grid"><div className="kpi-card"><span className="kpi-label">Assessment Status</span><strong>Completed</strong></div><div className="kpi-card"><span className="kpi-label">Award Amount</span><strong>{formatCurrency(parcel.compensation.awarded)}</strong></div><div className="kpi-card"><span className="kpi-label">Disbursed Amount</span><strong>{formatCurrency(parcel.compensation.paid)}</strong></div><div className="kpi-card"><span className="kpi-label">Pending Amount</span><strong>{formatCurrency(parcel.compensation.pending)}</strong></div></div><div className="panel-card"><div className="citizen-fact-grid"><div><label>Payment Status</label><strong>{parcel.paymentStatus}</strong></div><div><label>Payment Date</label><strong>Under processing</strong></div><div><label>Project</label><strong>BHU National Highway Corridor</strong></div><div><label>Parcel</label><strong>{parcel.ulpin}</strong></div></div></div></div>
}

function RrPage() {
  const { parcel } = useCitizenCase()
  return <div className="stack-block citizen-page"><CitizenHeader eyebrow="My entitlements" title="My R&R Benefits" /><div className="kpi-grid four-up citizen-summary-grid"><div className="kpi-card"><span className="kpi-label">R&R Status</span><strong>{parcel.rrStatus}</strong></div><div className="kpi-card"><span className="kpi-label">Household Status</span><strong>{parcel.affectedFamily} affected members</strong></div><div className="kpi-card"><span className="kpi-label">Benefits Approved</span><strong>Housing assistance</strong></div><div className="kpi-card"><span className="kpi-label">Pending Benefits</span><strong>1 entitlement</strong></div></div><div className="panel-card"><div className="section-header"><h3>Entitlements</h3><span className="status-badge warning">Pending delivery</span></div><div className="citizen-list-row"><strong>Rehabilitation support</strong><span>Approved · Delivery pending</span></div><div className="citizen-list-row"><strong>Resettlement assistance</strong><span>Under review</span></div></div></div>
}

function DocumentsPage() {
  const [documents, setDocuments] = useState(citizenPortalData.documents)
  const [documentType, setDocumentType] = useState('Ownership proof')
  const [fileName, setFileName] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')
  const submit = (event) => { event.preventDefault(); if (!fileName) return; setDocuments((current) => [...current, { id: `CIT-DOC-${current.length + 1}`, name: fileName, type: documentType, date: '25 Sep 2026', status: 'Submitted for review', notes }]); setFileName(''); setNotes(''); setMessage('Document submitted to the government for review.') }
  return <div className="stack-block citizen-page"><CitizenHeader eyebrow="My case records" title="My Documents" /><form className="panel-card citizen-form" onSubmit={submit}><div className="section-header"><div><div className="eyebrow">Required case documents</div><h3>Add a document</h3></div><Upload size={18} /></div><label>Document type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)}><option>Ownership proof</option><option>Identity proof</option><option>Bank details</option><option>Family or R&R document</option><option>Other supporting document</option></select></label><label>Choose document<input type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} required /></label><label>Notes for government review<textarea rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add any context about this document" /></label><button className="primary-btn" type="submit"><Upload size={15} /> Submit Document</button>{message && <div className="success-banner small">{message}</div>}</form><div className="panel-card document-list"><div className="section-header"><h3>My submitted documents</h3><span className="pill neutral">{documents.length} records</span></div>{documents.map((document) => <div className="document-row" key={document.id}><div><strong>{document.name}</strong><span>{document.type} · {document.date}</span></div><div className="button-row"><button className="secondary-btn small" type="button" onClick={() => setMessage(`${document.name} opened in preview mode.`)}>View</button><button className="secondary-btn small" type="button" onClick={() => setMessage(`${document.name} download prepared.`)}><Download size={13} /> Download</button><span className={`status-badge ${document.status === 'Available' ? 'success' : 'warning'}`}>{document.status}</span></div></div>)}</div></div>
}

function ObjectionsPage() {
  const [items, setItems] = useState(citizenPortalData.objections)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const submit = (event) => { event.preventDefault(); if (!subject.trim() || !description.trim()) return; setItems((current) => [...current, { id: `OBJ-${current.length + 2027}`, project: 'BHU National Highway Corridor', submittedDate: '25 Sep 2026', status: 'Submitted', response: 'Awaiting response' }]); setSubject(''); setDescription('') }
  return <div className="stack-block citizen-page"><CitizenHeader eyebrow="My case" title="My Objections" /><div className="panel-card table-panel"><table><thead><tr><th>Objection ID</th><th>Project</th><th>Submitted Date</th><th>Status</th><th>Response</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.project}</td><td>{item.submittedDate}</td><td><span className="status-badge warning">{item.status}</span></td><td>{item.response}</td></tr>)}</tbody></table></div><form className="panel-card citizen-form" onSubmit={submit}><div className="section-header"><h3>Submit New Objection</h3><MessageSquareWarning size={18} /></div><label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} required /></label><label>Description<textarea rows="4" value={description} onChange={(event) => setDescription(event.target.value)} required /></label><label>Supporting Document<input type="file" /></label><button className="primary-btn" type="submit"><Send size={15} /> Submit Objection</button></form></div>
}

function GrievancesPage() {
  const [items, setItems] = useState(citizenPortalData.grievances)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const submit = (event) => { event.preventDefault(); if (!subject.trim() || !description.trim()) return; setItems((current) => [...current, { id: `GRV-${current.length + 2027}`, subject, submittedDate: '25 Sep 2026', status: 'Submitted', lastUpdate: '25 Sep 2026' }]); setSubject(''); setDescription('') }
  return <div className="stack-block citizen-page"><CitizenHeader eyebrow="Citizen support" title="My Grievances" /><div className="panel-card table-panel"><table><thead><tr><th>Grievance ID</th><th>Subject</th><th>Submitted Date</th><th>Status</th><th>Last Update</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.subject}</td><td>{item.submittedDate}</td><td><span className="status-badge warning">{item.status}</span></td><td>{item.lastUpdate}</td></tr>)}</tbody></table></div><form className="panel-card citizen-form" onSubmit={submit}><div className="section-header"><h3>Submit Grievance</h3><MessageSquareWarning size={18} /></div><label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} required /></label><label>Description<textarea rows="4" value={description} onChange={(event) => setDescription(event.target.value)} required /></label><button className="primary-btn" type="submit"><Send size={15} /> Submit Grievance</button></form></div>
}

export default function CitizenPortalPage({ view = 'overview' }) {
  if (view === 'parcel') return <ParcelPage />
  if (view === 'acquisition-status') return <AcquisitionPage />
  if (view === 'compensation') return <CompensationPage />
  if (view === 'rr-benefits') return <RrPage />
  if (view === 'documents') return <DocumentsPage />
  if (view === 'objections') return <ObjectionsPage />
  if (view === 'grievances') return <GrievancesPage />
  return <CitizenOverview />
}
