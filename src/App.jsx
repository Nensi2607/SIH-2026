import { useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeftRight,
  Bell,
  Building2,
  Briefcase,
  FilePlus2,
  FileText,
  FolderKanban,
  Gauge,
  Globe,
  LayoutDashboard,
  Map,
  MapPinned,
  Menu,
  MessageSquareWarning,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import './App.css'
import { citizenPortalData, getVisibleAlerts, getVisibleParcels, getVisibleProjects, lrbProjects, projects, roleHomeMap, roleNavigation, roleOptions, rolePermissions, userProfiles } from './data/mockData'
import LoginPage from './pages/Login'
import Dashboard from './pages/LandAcquisitionDashboard'
import ProjectsPage from './pages/Projects'
import ProjectDetailsPage from './pages/ProjectDetails'
import ParcelListPage from './pages/Parcels'
import ParcelDetailPage from './pages/ParcelDetails'
import GISMapPage from './pages/GISMap'
import WorkflowPage from './pages/Workflow'
import CompensationPage from './pages/Compensation'
import RnRPage from './pages/RnR'
import FieldVerificationPage from './pages/FieldVerification'
import AlertsPage from './pages/Alerts'
import DocumentsPage from './pages/Documents'
import ReportsPage from './pages/Reports'
import CitizenPortalPage from './pages/CitizenPortal'
import AffectedParcelsPage from './pages/AffectedParcels'

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Project Registration', path: '/project-registration', icon: FilePlus2 },
  { name: 'Review Projects', path: '/review-projects', icon: FileText },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Parcels', path: '/parcels', icon: FileText },
  { name: 'GIS Map', path: '/gis', icon: Map },
  { name: 'Workflow', path: '/workflow', icon: ArrowLeftRight },
  { name: 'Compensation & Payment', path: '/compensation', icon: Wallet },
  { name: 'R&R', path: '/rr', icon: Users },
  { name: 'Field Verification', path: '/field-verification', icon: MapPinned },
  { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
  { name: 'Documents', path: '/documents', icon: Briefcase },
  { name: 'Reports', path: '/reports', icon: Gauge },
  { name: 'Profile', path: '/profile', icon: Users },
  { name: 'Citizen Portal', path: '/citizen', icon: MessageSquareWarning },
]

function AppLayout({ role, setRole, setIsLoggedIn, projectRecords, setProjectRecords, fieldReports, setFieldReports, landownerNotifications, handleBulkLandownerNotifications }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const currentPage = location.pathname
  const dashboardRole = currentPage === '/minister/rr' ? 'rrAdministrator' : currentPage === '/minister/finance' ? 'financeOfficer' : role
  const profile = userProfiles.find((item) => item.role === dashboardRole) || userProfiles[0]
  const configuredNav = roleNavigation[role] || []
  const visibleNavItems = configuredNav.map(([path, name], index) => ({
    name,
    path,
    icon: navItems.find((item) => item.path === path)?.icon || LayoutDashboard,
    key: `${path}-${index}`,
  }))
  const searchValue = searchTerm.trim().toLowerCase()
  const searchProjects = role === 'citizen' ? [] : getVisibleProjects(role, profile, projectRecords).filter((project) => `${project.name} ${project.id}`.toLowerCase().includes(searchValue)).slice(0, 4)
  const searchParcels = getVisibleParcels(role, profile, projectRecords).filter((parcel) => `${parcel.ulpin} ${parcel.surveyNo} ${parcel.village}`.toLowerCase().includes(searchValue)).slice(0, 4)
  const notifications = getVisibleAlerts(role, profile, projectRecords).slice(0, 5)

  const routeMap = {
    '/dashboard': 'Dashboard',
    '/project-registration': 'Project Registration',
    '/review-projects': 'Review Projects',
    '/projects': 'Projects',
    '/parcels': 'Parcels',
    '/affected-parcels': 'Affected Parcels',
    '/gis': 'GIS Map',
    '/workflow': 'Workflow',
    '/compensation': 'Compensation & Payment',
    '/rr': 'R&R',
    '/field-verification': role === 'districtOfficer' ? 'Survey Verification Objection' : 'Field Verification',
    '/alerts': 'Alerts',
    '/documents': 'Documents',
    '/reports': 'Reports',
    '/profile': 'Profile',
    '/citizen': 'Citizen Portal',
    '/citizen/parcel': 'My Parcel',
    '/citizen/acquisition-status': 'Acquisition Status',
    '/citizen/compensation': 'Compensation',
    '/citizen/rr-benefits': 'R&R Benefits',
    '/citizen/documents': 'My Documents',
    '/citizen/objections': 'My Objections',
    '/citizen/grievances': 'My Grievances',
  }

  const pageTitle =
    currentPage.startsWith('/projects/')
      ? currentPage.endsWith('/workflow') ? 'Workflow monitoring' : currentPage.endsWith('/compensation') ? 'Compensation & payment' : currentPage.endsWith('/rr') ? 'R&R' : 'Projects'
      : currentPage.startsWith('/parcels/')
        ? 'Parcels'
        : currentPage.startsWith('/citizen/public-projects/')
          ? 'Public Project'
        : routeMap[currentPage] || 'Dashboard'

  const showBackButton = currentPage.startsWith('/projects/') || currentPage.startsWith('/parcels/') || currentPage.startsWith('/citizen/')
  const projectPath = currentPage.match(/^\/projects\/([^/]+)(?:\/(.*))?$/)
  const projectId = projectPath?.[1]

  const handleNav = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const upsertFieldReport = (report) => setFieldReports((current) => current.some((item) => item.id === report.id)
    ? current.map((item) => item.id === report.id ? report : item)
    : [report, ...current])

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-mark">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="brand-title">Samanvaya</div>
            <div className="brand-subtitle">Land Acquisition Monitoring Portal</div>
          </div>
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {visibleNavItems.map(({ name, path, icon: Icon, key }) => (
            <button key={key} className={`nav-item ${currentPage === path ? 'active' : ''}`} onClick={() => handleNav(path)}>
              <Icon size={16} />
              <span>{name}</span>
            </button>
          ))}
        </nav>

        {role !== 'citizen' && <div className="sidebar-footer">
          <div className="role-chip">
            <Building2 size={14} />
            <span>{profile.title}</span>
          </div>
          <label className="role-switcher">Switch Portal Role<select value={role} onChange={(event) => { setRole(event.target.value); navigate(roleHomeMap[event.target.value]) }}>{roleOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <button className="text-button danger" onClick={() => { setIsLoggedIn(false); setRole('nationalOfficer'); navigate('/') }}>Logout / Change Role</button>
        </div>}
      </aside>

      <div className="content-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
              <Menu size={17} />
            </button>
            {showBackButton && (
              <button className="secondary-btn small" type="button" onClick={() => navigate(-1)} aria-label="Go back">← Back</button>
            )}
            <div>
              <div className="eyebrow">Samanvaya</div>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="search-box search-wrapper">
              <Globe size={15} />
              <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={role === 'citizen' ? 'Search my ULPIN or case...' : role === 'fieldOfficer' ? 'Search assigned parcels...' : 'Search project, ULPIN, family...'} />
              {searchValue && <div className="search-results">{searchProjects.map((project) => <button key={project.id} onClick={() => { navigate(`/projects/${project.id}`); setSearchTerm('') }}>{project.name}</button>)}{searchParcels.map((parcel) => <button key={parcel.id} onClick={() => { navigate(role === 'citizen' ? '/citizen/parcel' : `/parcels/${parcel.ulpin}`); setSearchTerm('') }}>{parcel.ulpin} · {parcel.village}</button>)}{!searchProjects.length && !searchParcels.length && <span>{role === 'citizen' ? 'No matching record found in your account.' : 'No accessible records found'}</span>}</div>}
            </div>
            <button className="icon-button notification-trigger" aria-label="Notifications" onClick={() => setNotificationsOpen((current) => !current)}>
              <Bell size={16} />
              <span className="badge-dot" />
            </button>
            {notificationsOpen && <div className="notification-panel"><strong>Notifications & deadlines</strong>{role === 'citizen' ? citizenPortalData.notifications.map((notification) => <span key={notification}>• {notification}</span>) : notifications.map((notification) => <span key={notification.id}>• {notification.title} · due {notification.deadline}</span>)}{!notifications.length && role !== 'citizen' && <span>No current acquisition alerts.</span>}</div>}
            <div className={role === 'citizen' ? 'profile-menu-wrap' : undefined}>
              <button className="user-chip" type="button" onClick={() => role === 'citizen' && setProfileMenuOpen((current) => !current)}>
                <div className="avatar">{profile.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <strong>{profile.name}</strong>
                  <span>{profile.title} • {profile.jurisdiction}</span>
                </div>
              </button>
              {role === 'citizen' && profileMenuOpen && <div className="profile-menu"><strong>My Profile</strong><span>{profile.name}</span><span>{profile.jurisdiction}</span><button type="button" onClick={() => setNotificationsOpen(true)}>Notifications</button><label>Change Role<select value={role} onChange={(event) => { setRole(event.target.value); setProfileMenuOpen(false); navigate(roleHomeMap[event.target.value]) }}>{roleOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label><button type="button" className="danger-link" onClick={() => { setIsLoggedIn(false); setRole('nationalOfficer'); navigate('/') }}>Logout</button></div>}
              </div>
          </div>
        </header>

        <main className="page-content">
          {projectId && <nav className="project-workspace-nav" aria-label="Project navigation">
            <div className="project-workspace-links">
              {[
                [`/projects/${projectId}`, 'Overview'],
                [`/projects/${projectId}/workflow`, 'Workflow monitoring'],
                [`/projects/${projectId}/compensation`, 'Compensation & payment'],
                [`/projects/${projectId}/rr`, 'R&R'],
              ].map(([path, label]) => <Link key={path} className={currentPage === path ? 'secondary-btn active' : 'secondary-btn'} to={path}>{label}</Link>)}
            </div>
            <Link className="pill neutral" to="/projects">All projects</Link>
          </nav>}
          <Routes>
            <Route path="/dashboard" element={<RoleRoute role={role} path="/dashboard"><Dashboard role={role} projectRecords={projectRecords} onProjectCreated={(project) => setProjectRecords((current) => [project, ...current])} onProjectUpdated={(project) => setProjectRecords((current) => current.map((item) => item.id === project.id ? project : item))} /></RoleRoute>} />
            <Route path="/project-registration" element={<RoleRoute role={role} path="/project-registration"><Dashboard role={role} projectRecords={projectRecords} onProjectCreated={(project) => setProjectRecords((current) => [project, ...current])} onProjectUpdated={(project) => setProjectRecords((current) => current.map((item) => item.id === project.id ? project : item))} registrationMode /></RoleRoute>} />
            <Route path="/review-projects" element={<RoleRoute role={role} path="/review-projects"><ProjectsPage role={role} projectRecords={projectRecords} reviewMode /></RoleRoute>} />
            <Route path="/projects" element={<RoleRoute role={role} path="/projects"><ProjectsPage role={role} projectRecords={projectRecords} /></RoleRoute>} />
            <Route path="/projects/:projectId" element={<RoleRoute role={role} path="/projects"><ProjectDetailsPage role={role} projectRecords={projectRecords} onProjectUpdated={(project) => setProjectRecords((current) => current.map((item) => item.id === project.id ? project : item))} /></RoleRoute>} />
            <Route path="/projects/:projectId/workflow" element={<RoleRoute role={role} path="/projects"><WorkflowPage projectId={location.pathname.split('/')[2]} /></RoleRoute>} />
            <Route path="/projects/:projectId/compensation" element={<RoleRoute role={role} path="/projects"><CompensationPage role={role} projectId={location.pathname.split('/')[2]} /></RoleRoute>} />
            <Route path="/projects/:projectId/rr" element={<RoleRoute role={role} path="/projects"><RnRPage role={role} projectId={location.pathname.split('/')[2]} /></RoleRoute>} />
            <Route path="/parcels" element={<RoleRoute role={role} path="/parcels"><ParcelListPage role={role} projectRecords={projectRecords} /></RoleRoute>} />
            <Route path="/affected-parcels" element={<RoleRoute role={role} path="/affected-parcels"><AffectedParcelsPage role={role} projectRecords={projectRecords} notificationRecords={landownerNotifications} onNotifyAll={handleBulkLandownerNotifications} /></RoleRoute>} />
            <Route path="/parcels/:parcelId" element={<RoleRoute role={role} path="/parcels"><ParcelDetailPage role={role} projectRecords={projectRecords} /></RoleRoute>} />
            <Route path="/gis" element={<RoleRoute role={role} path="/gis"><GISMapPage role={role} projectRecords={projectRecords} /></RoleRoute>} />
            <Route path="/workflow" element={<RoleRoute role={role} path="/workflow"><WorkflowPage role={role} /></RoleRoute>} />
            <Route path="/compensation" element={<RoleRoute role={role} path="/compensation"><CompensationPage role={role} /></RoleRoute>} />
            <Route path="/rr" element={<RoleRoute role={role} path="/rr"><RnRPage role={role} /></RoleRoute>} />
            <Route path="/field-verification" element={<RoleRoute role={role} path="/field-verification"><FieldVerificationPage role={role} profile={profile} projectRecords={projectRecords} fieldReports={fieldReports} onFieldReportSave={upsertFieldReport} /></RoleRoute>} />
            <Route path="/field-verification/:parcelId" element={<RoleRoute role={role} path="/field-verification"><FieldVerificationPage role={role} profile={profile} projectRecords={projectRecords} fieldReports={fieldReports} onFieldReportSave={upsertFieldReport} /></RoleRoute>} />
            <Route path="/alerts" element={<RoleRoute role={role} path="/alerts"><AlertsPage role={role} projectRecords={projectRecords} /></RoleRoute>} />
            <Route path="/documents" element={<RoleRoute role={role} path="/documents"><DocumentsPage role={role} projectRecords={projectRecords} /></RoleRoute>} />
            <Route path="/reports" element={<RoleRoute role={role} path="/reports"><ReportsPage role={role} projectRecords={projectRecords} /></RoleRoute>} />
            <Route path="/profile" element={<RoleRoute role={role} path="/profile"><ProfilePage profile={profile} /></RoleRoute>} />
            <Route path="/citizen" element={<RoleRoute role={role} path="/citizen"><CitizenPortalPage /></RoleRoute>} />
            <Route path="/citizen/parcel" element={<RoleRoute role={role} path="/citizen/parcel"><CitizenPortalPage view="parcel" /></RoleRoute>} />
            <Route path="/citizen/acquisition-status" element={<RoleRoute role={role} path="/citizen/acquisition-status"><CitizenPortalPage view="acquisition-status" /></RoleRoute>} />
            <Route path="/citizen/compensation" element={<RoleRoute role={role} path="/citizen/compensation"><CitizenPortalPage view="compensation" /></RoleRoute>} />
            <Route path="/citizen/rr-benefits" element={<RoleRoute role={role} path="/citizen/rr-benefits"><CitizenPortalPage view="rr-benefits" /></RoleRoute>} />
            <Route path="/citizen/documents" element={<RoleRoute role={role} path="/citizen/documents"><CitizenPortalPage view="documents" /></RoleRoute>} />
            <Route path="/citizen/objections" element={<RoleRoute role={role} path="/citizen/objections"><CitizenPortalPage view="objections" /></RoleRoute>} />
            <Route path="/citizen/grievances" element={<RoleRoute role={role} path="/citizen/grievances"><CitizenPortalPage view="grievances" /></RoleRoute>} />
            <Route path="*" element={<Navigate to={roleHomeMap[role]} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function ProfilePage({ profile }) {
  return <div className="stack-block"><div className="section-header"><div><div className="eyebrow">Account</div><h2>Profile</h2></div></div><section className="panel-card profile-details"><div className="avatar">{profile.name.slice(0, 2).toUpperCase()}</div><div><strong>{profile.name}</strong><span>{profile.title}</span><span>{profile.department || profile.organization || profile.jurisdiction}</span><span>{profile.state || profile.jurisdiction}</span>{profile.district && <span>{profile.district}</span>}</div></section></div>
}

function App() {
  const [role, setRole] = useState('nationalOfficer')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [projectRecords, setProjectRecords] = useState([...projects, ...lrbProjects])
  const [fieldReports, setFieldReports] = useState([])
  const [landownerNotifications, setLandownerNotifications] = useState([])

  const handleBulkLandownerNotifications = (affectedParcels) => {
    const records = affectedParcels.map((parcel) => {
      const mobile = parcel.landownerDetails?.mobile || '+91 90000 00000'
      const recipient = parcel.landownerDetails?.name || 'Affected landowner'
      const notificationId = `NT-${parcel.id.slice(-6)}-${String(Date.now()).slice(-4)}`
      return {
        id: `${notificationId}-DOC`,
        parcelId: parcel.id,
        projectId: parcel.projectId,
        projectName: projectRecords.find((project) => project.id === parcel.projectId)?.name || parcel.projectName,
        recipient,
        phone: mobile,
        deliveryStatus: 'Delivered',
        notificationDate: new Date().toISOString().slice(0, 10),
        referenceId: notificationId,
        documentName: `Landowner Notice - ${parcel.ulpin}`,
        channel: 'SMS / existing notification service',
      }
    })

    setLandownerNotifications((current) => [...records, ...current])
  }

  if (!isLoggedIn) {
    return <LoginPage onContinue={(selectedRole) => { setRole(selectedRole); setIsLoggedIn(true) }} />
  }

  return (
    <BrowserRouter>
      <AppLayout role={role} setRole={setRole} setIsLoggedIn={setIsLoggedIn} projectRecords={projectRecords} setProjectRecords={setProjectRecords} fieldReports={fieldReports} setFieldReports={setFieldReports} landownerNotifications={landownerNotifications} handleBulkLandownerNotifications={handleBulkLandownerNotifications} />
    </BrowserRouter>
  )
}

function RoleRoute({ role, path, children }) {
  return rolePermissions[role]?.includes(path) ? children : <Navigate to={roleHomeMap[role]} replace />
}

export default App
