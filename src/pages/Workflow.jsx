import { workflowStages } from '../data/mockData'

export default function WorkflowPage({ projectId }) {
  return (
    <div className="stack-block">
      <div className="section-header">
        <div>
          <h2>Acquisition workflow</h2>
        </div>
        <span className="pill neutral">{projectId ? `Project ${projectId}` : 'RFCTLARR / National Highways workflow'}</span>
      </div>

      <div className="panel-card workflow-card-shell">
        <div className="workflow-grid">
          {workflowStages.map((stage, index) => (
            <div key={stage.name} className={`workflow-stage-card ${stage.completed ? 'is-complete' : stage.status === 'Pending Review' ? 'is-review' : stage.status === 'In Progress' ? 'is-active' : 'is-upcoming'}`} aria-current={stage.status === 'In Progress' ? 'step' : undefined}>
              <div className="workflow-stage-head">
                <span className="workflow-number">{index + 1}</span>
                <span className={`status-badge ${stage.status === 'Completed' ? 'success' : stage.status === 'Pending Review' ? 'warning' : 'neutral'}`}>{stage.status}</span>
              </div>
              <h3>{stage.name}</h3>
              <ul>
                <li><strong>Date</strong><span>{stage.date}</span></li>
                <li><strong>Responsible</strong><span>{stage.role}</span></li>
                <li><strong>SLA</strong><span>{stage.sla}</span></li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
