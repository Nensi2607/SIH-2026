import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { stageDuration } from '../data/mockData'

export default function ReportsPage() {
  return (
    <div className="stack-block">
      <div className="section-header"><h2>Reports & Analytics</h2><span className="pill neutral">Rule-Based Attention Indicator</span></div>

      <div className="panel-card">
        <div className="section-header"><h3>Stage Duration</h3></div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stageDuration}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="days" radius={[8, 8, 0, 0]} fill="#084c61" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="content-grid two-up">
        <div className="panel-card">
          <h3>Bottleneck Analysis</h3>
          <p>Payment stage accounts for the highest pending duration, with several parcels awaiting disbursement and reconciliation.</p>
        </div>
        <div className="panel-card">
          <h3>Risk / Attention Score</h3>
          <p>Deadline approaching + pending payment + unresolved objection = High Attention.</p>
        </div>
      </div>
    </div>
  )
}
