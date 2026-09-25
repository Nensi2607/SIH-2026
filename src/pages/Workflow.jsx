import { workflowStages } from '../data/mockData'

export default function WorkflowPage({ projectId }) {
  return (
    <div className="stack-block">
      <div className="section-header"><h2>Acquisition Workflow</h2><span className="pill neutral">{projectId ? `Project ${projectId}` : 'RFCTLARR / National Highways workflow'}</span></div>

      <div className="workflow-panel">
        {workflowStages.map((stage) => (
          <div key={stage.name} className={`workflow-step ${stage.completed ? 'done' : ''}`}>
            <div className="workflow-connector" />
            <div className="workflow-box">
              <div className="workflow-head">
                <strong>{stage.name}</strong>
                <span className={`status-badge ${stage.status === 'Completed' ? 'success' : stage.status === 'Pending Review' ? 'warning' : 'neutral'}`}>{stage.status}</span>
              </div>
              <ul>
                <li>Date: {stage.date}</li>
                <li>Responsible: {stage.role}</li>
                <li>SLA: {stage.sla}</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
