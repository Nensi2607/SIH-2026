import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { paymentDistribution } from '../data/mockData'

const paymentRows = [
  { parcel: 'ULPIN-UP-7812-004', ulpin: 'ULPIN-UP-7812-004', beneficiary: 'Ritu Singh', award: '₹76.0L', paid: '₹32.0L', status: 'Pending' },
  { parcel: 'ULPIN-UP-7812-011', ulpin: 'ULPIN-UP-7812-011', beneficiary: 'Anil Verma', award: '₹1.21Cr', paid: '₹26.0L', status: 'Failed' },
  { parcel: 'ULPIN-UP-7812-008', ulpin: 'ULPIN-UP-7812-008', beneficiary: 'Shyam Lal', award: '₹84.5L', paid: '₹84.5L', status: 'Paid' },
]

export default function CompensationPage({ projectId }) {
  const projectLabel = projectId ? `Project ${projectId}` : 'Payment monitoring'

  return (
    <div className="stack-block">
      <div className="section-header"><h2>Compensation & Payment</h2><span className="pill neutral">{projectLabel}</span></div>

      <div className="kpi-grid four-up">
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Total Assessed</span></div><strong>₹ 32.6 Cr</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Total Awarded</span></div><strong>₹ 30.1 Cr</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Total Paid</span></div><strong>₹ 17.4 Cr</strong></div>
        <div className="kpi-card"><div className="kpi-head"><span className="kpi-label">Pending</span></div><strong>₹ 12.7 Cr</strong></div>
      </div>

      <div className="content-grid compensation-detail-grid">
        <div className="panel-card">
          <div className="section-header"><h3>Payment Distribution</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paymentDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-card table-panel">
          <div className="section-header"><h3>Payment Table</h3></div>
          <table>
            <thead>
              <tr>
                <th>Parcel</th>
                <th>Beneficiary</th>
                <th>Award Amount</th>
                <th>Paid Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentRows.map((row) => (
                <tr key={row.ulpin}>
                  <td>{row.parcel}</td>
                  <td>{row.beneficiary}</td>
                  <td>{row.award}</td>
                  <td>{row.paid}</td>
                  <td><span className={`status-badge ${row.status === 'Paid' ? 'success' : row.status === 'Pending' ? 'warning' : 'danger'}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
