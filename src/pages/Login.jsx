import { useState } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { roleOptions } from '../data/mockData'

export default function LoginPage({ onContinue }) {
  const [selectedRole, setSelectedRole] = useState('nationalOfficer')

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark large">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="eyebrow">BHU-SETU</div>
            <h1>Welcome to BHU-SETU</h1>
          </div>
        </div>

        <p className="subtitle">National Land Acquisition & Management System</p>
        <p className="microcopy">One Parcel. One Acquisition Record. One View from National to Parcel.</p>

        <div className="role-section-label">Select User</div>
        <div className="role-grid">
          {roleOptions.map((role) => (
            <button
              key={role.id}
              type="button"
              className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <strong>{role.label}</strong>
              <span>{role.focus}</span>
            </button>
          ))}
        </div>

        <button type="button" className="primary-btn large" onClick={() => onContinue(selectedRole)}>
          Enter Portal
          <ArrowRight size={18} />
        </button>

        <div className="portal-tag">BHU-SETU Portal</div>
      </div>
    </div>
  )
}
