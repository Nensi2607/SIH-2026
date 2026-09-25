import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getVisibleProjects, projects, userProfiles } from '../data/mockData'

const states = ['All', ...new Set(projects.map((project) => project.state))]
const districts = ['All', ...new Set(projects.map((project) => project.district))]
const statuses = ['All', ...new Set(projects.map((project) => project.status))]
const projectTypes = ['All', ...new Set(projects.map((project) => project.projectType))]
const stages = ['All', ...new Set(projects.map((project) => project.stage))]

export default function ProjectsPage({ role = 'nationalOfficer' }) {
  const [stateFilter, setStateFilter] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [stageFilter, setStageFilter] = useState('All')

  const profile = userProfiles.find((item) => item.role === role)
  const scopedProjects = getVisibleProjects(role, profile)

  const filteredProjects = useMemo(() => scopedProjects.filter((project) => {
    return (
      (stateFilter === 'All' || project.state === stateFilter) &&
      (districtFilter === 'All' || project.district === districtFilter) &&
      (typeFilter === 'All' || project.projectType === typeFilter) &&
      (statusFilter === 'All' || project.status === statusFilter) &&
      (stageFilter === 'All' || project.stage === stageFilter)
    )
  }), [stateFilter, districtFilter, typeFilter, statusFilter, stageFilter, scopedProjects])

  return (
    <div className="stack-block">
      <div className="section-header"><h2>Project Portfolio</h2><span className="pill neutral">{filteredProjects.length} projects</span></div>

      <div className="filter-grid">
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}><option>All</option>{states.slice(1).map((state) => <option key={state}>{state}</option>)}</select>
        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}><option>All</option>{districts.slice(1).map((district) => <option key={district}>{district}</option>)}</select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option>All</option>{projectTypes.slice(1).map((type) => <option key={type}>{type}</option>)}</select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All</option>{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}><option>All</option>{stages.slice(1).map((stage) => <option key={stage}>{stage}</option>)}</select>
      </div>

      <div className="panel-card table-panel">
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Project ID</th>
              <th>State</th>
              <th>District</th>
              <th>Parcels</th>
              <th>Acquired</th>
              <th>Pending</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td><Link to={`/projects/${project.id}`}>{project.name}</Link></td>
                <td>{project.id}</td>
                <td>{project.state}</td>
                <td>{project.district}</td>
                <td>{project.totalParcels}</td>
                <td>{project.acquired}</td>
                <td>{project.pending}</td>
                <td>
                  <div className="progress-line"><span style={{ width: `${project.progress}%` }} /></div>
                  {project.progress}%
                </td>
                <td><span className={`status-badge ${project.status === 'Delayed' ? 'danger' : project.status === 'Attention' ? 'warning' : 'success'}`}>{project.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
