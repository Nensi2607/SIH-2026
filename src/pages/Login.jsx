import { useState } from 'react'
import { ArrowRight, Landmark, ShieldCheck } from 'lucide-react'
import { roleOptions, userProfiles } from '../data/mockData'

const demoPassword = 'LandDemo#2026'
const demoAccounts = roleOptions.map((option) => {
  const profile = userProfiles.find((user) => user.role === option.id)
  const accountPrefix = option.id === 'nationalOfficer' ? 'anita.sharma' : option.id === 'stateOfficer' ? 'rajesh.patel' : option.id === 'districtOfficer' ? 'priya.shah' : option.id === 'lrb' ? 'neha.verma' : option.id === 'fieldOfficer' ? 'amit.solanki' : option.id === 'citizen' ? 'ramesh.patel' : 'kavita.rao'
  return { ...option, name: profile.name, email: `${accountPrefix}@samanvaya.demo`, password: demoPassword }
})

export default function LoginPage({ onContinue }) {
  const [selectedRole, setSelectedRole] = useState(demoAccounts[0].id)
  const [email, setEmail] = useState(demoAccounts[0].email)
  const [password, setPassword] = useState(demoPassword)
  const [error, setError] = useState('')

  const selectRole = (role) => {
    const account = demoAccounts.find((item) => item.id === role)
    setSelectedRole(role)
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  const signIn = (event) => {
    event.preventDefault()
    const account = demoAccounts.find((item) => item.id === selectedRole && item.email === email.trim().toLowerCase() && item.password === password)
    if (!account) {
      setError('Check the selected demo account and password, then try again.')
      return
    }
    onContinue(account.id)
  }

  return <div className="login-shell login-shell-auth">
    <div className="login-layout acquisition-login-layout">
      <section className="login-card">
        <div className="login-brand"><div className="brand-mark large"><Landmark size={23} /></div><div><div className="eyebrow">SAMANVAYA · SECURE ACCESS</div><h1>Sign in to the acquisition system</h1></div></div>
        <p className="subtitle">National Land Acquisition Management System</p>
        <p className="microcopy">GIS-led land acquisition monitoring for government officers, field teams and affected landowners.</p>
        <form className="login-form" onSubmit={signIn}>
          <label>Demo account role<select value={selectedRole} onChange={(event) => selectRole(event.target.value)}>{demoAccounts.map((account) => <option key={account.id} value={account.id}>{account.label} · {account.name}</option>)}</select></label>
          <label>Email address<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <p className="login-hint">Selecting a demo role fills its account credentials automatically. Demo password: <strong>{demoPassword}</strong></p>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="primary-btn large">Sign in <ArrowRight size={17} /></button>
        </form>
        <div className="login-security-note"><ShieldCheck size={15} /><span>Your portal access and jurisdiction are assigned by the selected account. Prototype authentication runs locally in this browser.</span></div>
        <div className="portal-tag">Government land administration · Demo environment</div>
      </section>
      <aside className="login-reference acquisition-login-reference">
        <div className="login-reference-heading"><div className="eyebrow">LAND ACQUISITION, END TO END</div><h2>From project alignment to possession</h2><p>Parcel identification uses project geometry intersected with cadastral GIS data. Each candidate parcel awaits authorized officer verification.</p></div>
        <ol className="login-process-list">{['Project proposal', 'GIS spatial intersection', 'Candidate parcel verification', 'Owner notice & objection', 'Hearing & government decision', 'Measurement & compensation', 'Award, payment & possession'].map((stage, index) => <li key={stage}><span>{index + 1}</span>{stage}</li>)}</ol>
        <div className="login-demo-accounts"><strong>Demo access</strong><span>Seven role-specific sample accounts</span><span>Shared demo password: {demoPassword}</span><span>Sample records only. No external notifications or payments are made.</span></div>
        <p className="provisioning-footnote">Production authentication, role assignment, jurisdiction checks and audit timestamps must be enforced by a secure government identity provider and backend services.</p>
      </aside>
    </div>
  </div>
}
