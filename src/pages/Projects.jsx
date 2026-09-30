import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getReviewableProjects, getVisibleProjects, projects, userProfiles } from '../data/mockData'

export default function ProjectsPage({ role = 'nationalOfficer', projectRecords = projects, reviewMode = false }) {
  const [stateFilter, setStateFilter] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [stageFilter, setStageFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [approvalLevelFilter, setApprovalLevelFilter] = useState('All')
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All')
  const [submittedAfter, setSubmittedAfter] = useState('')
  const [submittedBefore, setSubmittedBefore] = useState('')

  const profile = userProfiles.find((item) => item.role === role)
  const scopedProjects = reviewMode ? getReviewableProjects(role, profile, projectRecords) : getVisibleProjects(role, profile, projectRecords)
  const states = [...new Set(scopedProjects.map((project) => project.state).filter(Boolean))]
  const districts = [...new Set(scopedProjects.map((project) => project.district).filter(Boolean))]
  const statuses = [...new Set(scopedProjects.map((project) => project.status).filter(Boolean))]
  const projectTypes = [...new Set(scopedProjects.map((project) => project.projectType).filter(Boolean))]
  const stages = [...new Set(scopedProjects.map((project) => project.stage).filter(Boolean))]
  const approvalLevels = [...new Set(scopedProjects.map((project) => project.approvalLevel).filter(Boolean))]
  const reviewStatuses = [...new Set(scopedProjects.map((project) => project.reviewStatus || project.status).filter(Boolean))]

  const filteredProjects = scopedProjects.filter((project) => {
    const searchMatch = !searchTerm || `${project.name} ${project.id} ${project.district} ${project.state} ${project.lrbOrganization || ''} ${project.createdByName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    const submissionDate = (project.submissionDate || project.createdAt || '').slice(0, 10)
    return searchMatch && (
      (stateFilter === 'All' || project.state === stateFilter) &&
      (districtFilter === 'All' || project.district === districtFilter) &&
      (typeFilter === 'All' || project.projectType === typeFilter) &&
      (statusFilter === 'All' || project.status === statusFilter) &&
      (stageFilter === 'All' || project.stage === stageFilter) &&
      (approvalLevelFilter === 'All' || project.approvalLevel === approvalLevelFilter) &&
      (reviewStatusFilter === 'All' || (project.reviewStatus || project.status) === reviewStatusFilter) &&
      (!submittedAfter || submissionDate >= submittedAfter) &&
      (!submittedBefore || submissionDate <= submittedBefore)
    )
  })

  return (
    <div className="stack-block">
      <div className="section-header"><div><div className="eyebrow">{reviewMode ? 'Authority-assigned government inbox' : role === 'lrb' ? 'LRB proposal register' : 'Project portfolio'}</div><h2>{reviewMode ? 'Review Projects' : role === 'lrb' ? 'My Project Proposals' : 'Projects'}</h2></div><span className="pill neutral">{filteredProjects.length} {reviewMode ? 'awaiting review' : 'projects'}</span></div>

      <div className="project-search-row">
        <input className="project-search-input" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search project, ID, LRB, district or state" />
      </div>

      <div className="filter-grid">
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}><option value="All">All states in scope</option>{states.map((state) => <option key={state}>{state}</option>)}</select>
        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}><option value="All">All districts in scope</option>{districts.map((district) => <option key={district}>{district}</option>)}</select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="All">All project types</option>{projectTypes.map((type) => <option key={type}>{type}</option>)}</select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="All">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
        {!reviewMode && <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}><option value="All">All stages</option>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select>}
        {reviewMode && <><select value={approvalLevelFilter} onChange={(e) => setApprovalLevelFilter(e.target.value)}><option value="All">All approval levels</option>{approvalLevels.map((level) => <option key={level} value={level}>{level[0].toUpperCase() + level.slice(1)}</option>)}</select><select value={reviewStatusFilter} onChange={(event) => setReviewStatusFilter(event.target.value)}><option value="All">All review statuses</option>{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select><label className="date-filter">Submitted after<input type="date" value={submittedAfter} onChange={(event) => setSubmittedAfter(event.target.value)} /></label><label className="date-filter">Submitted before<input type="date" value={submittedBefore} onChange={(event) => setSubmittedBefore(event.target.value)} /></label></>}
      </div>

      <div className="panel-card table-panel">
        <table>
          <thead>
            <tr>
              {reviewMode && <th>Project Name</th>}
              {reviewMode && <th>LRB / Requiring Body</th>}
              {!reviewMode && <th>Project Name</th>}
              <th>Project ID</th>
              {!reviewMode && <th>State</th>}
              {!reviewMode && <th>District</th>}
              {reviewMode && <th>Project Type</th>}
              {reviewMode && <th>State / District</th>}
              {reviewMode && <th>Proposed Area</th>}
              {reviewMode && <th>Submitted</th>}
              {reviewMode && <th>Approval Authority</th>}
              {reviewMode && <th>Review Status</th>}
              {!reviewMode && <th>State</th>}
              {!reviewMode && <th>District</th>}
              {!reviewMode && <th>Parcels</th>}
              {!reviewMode && <th>Acquired</th>}
              {!reviewMode && <th>Pending</th>}
              {!reviewMode && <th>Progress</th>}
              <th>Status</th>
              {reviewMode && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td><Link to={`/projects/${project.id}`}>{project.name}</Link></td>
                {reviewMode && <td>{project.lrbOrganization || project.createdByName || 'LRB'}</td>}
                <td>{project.id}</td>
                {reviewMode && <td>{project.projectType}</td>}
                <td>{reviewMode ? `${project.state}, ${project.district}` : project.state}</td>
                {!reviewMode && <td>{project.district}</td>}
                {reviewMode && <td>{project.proposedAcquisitionArea || project.totalLandRequired}</td>}
                {reviewMode && <td>{project.submissionDate ? new Date(project.submissionDate).toLocaleDateString('en-IN') : '—'}</td>}
                {reviewMode && <td>{project.approvalAuthorityName || '—'}</td>}
                {reviewMode && <td><span className="status-badge warning">{project.reviewStatus || project.status}</span></td>}
                {!reviewMode && <><td>{project.totalParcels}</td><td>{project.acquired}</td><td>{project.pending}</td><td>
                  <div className="progress-line"><span style={{ width: `${project.progress}%` }} /></div>
                  {project.progress}%
                </td></>}
                <td><span className={`status-badge ${project.status === 'Delayed' ? 'danger' : project.status === 'Attention' ? 'warning' : 'success'}`}>{project.status}</span></td>
                {reviewMode && <td><div className="inline-actions"><Link className="secondary-btn small" to={`/projects/${project.id}`}>View</Link><Link className="primary-btn small" to={`/projects/${project.id}`}>Review</Link></div></td>}
              </tr>
            ))}
            {!filteredProjects.length && <tr><td colSpan={reviewMode ? 11 : 9}><div className="empty-state">{reviewMode ? 'No projects are currently assigned for review.' : role === 'lrb' ? <>Create your first project proposal. <Link to="/project-registration">Create proposal</Link></> : 'No projects match the selected filters.'}</div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
