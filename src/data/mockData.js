export const roleOptions = [
  { id: 'nationalOfficer', label: 'National / Ministry Officer', focus: 'National KPIs, state comparison, national alerts', jurisdiction: 'India' },
  { id: 'stateOfficer', label: 'State Officer', focus: 'State projects, district progress, pending cases', jurisdiction: 'Uttar Pradesh' },
  { id: 'districtOfficer', label: 'District / CALA Officer', focus: 'Parcels, objections, compensation, deadlines', jurisdiction: 'Varanasi' },
  { id: 'lrb', label: 'Land Requiring Body (LRB)', focus: 'Project proposal, draft creation, government review status, query response', jurisdiction: 'Varanasi' },
  { id: 'fieldOfficer', label: 'Field Officer / Agent', focus: 'Assigned parcel surveys, evidence and field reports', jurisdiction: 'Varanasi' },
  { id: 'citizen', label: 'Citizen / Landowner', focus: 'My parcel, compensation, grievance, next step', jurisdiction: 'Personal' },
  { id: 'admin', label: 'System Administrator', focus: 'Administration, access and acquisition system oversight', jurisdiction: 'India' },
]

export const userProfiles = [
  { id: 'USR001', name: 'Anita Sharma', role: 'nationalOfficer', title: 'National Ministry Officer', department: 'Ministry of Road Transport and Highways', jurisdiction: 'India', authorityId: 'central-morth', authorityIds: ['central-morth', 'central-railways'] },
  { id: 'USR002', name: 'Rajesh Patel', role: 'stateOfficer', title: 'State Land Acquisition Officer', department: 'Revenue Department, Uttar Pradesh', jurisdiction: 'Uttar Pradesh', state: 'Uttar Pradesh', authorityId: 'state-up-pwd', authorityIds: ['state-up-pwd', 'state-up-irrigation', 'state-up-development', 'state-up-revenue'] },
  { id: 'USR003', name: 'Priya Shah', role: 'districtOfficer', title: 'District Collector / CALA', department: 'District Administration, Varanasi', jurisdiction: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', authorityId: 'district-up-varanasi' },
  { id: 'USR007', name: 'Neha Verma', role: 'lrb', title: 'Land Requiring Body Officer', department: 'Varanasi Development Authority', jurisdiction: 'Varanasi', organization: 'Varanasi Development Authority' },
  { id: 'USR004', name: 'Amit Solanki', role: 'fieldOfficer', title: 'Field Verification Officer', department: 'District Land Records Office', jurisdiction: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', email: 'amit.solanki@bhu-setu.demo', phone: '+91 90000 00004', assignedParcelIds: ['ULPIN-UP-7812-004', 'ULPIN-UP-7812-011', 'ULPIN-UP-4821-220'] },
  { id: 'USR005', name: 'Ramesh Patel', role: 'citizen', title: 'Citizen / Landowner', jurisdiction: 'Varanasi', parcelIds: ['ULPIN-UP-7812-004'] },
  { id: 'USR006', name: 'Kavita Rao', role: 'admin', title: 'System Administrator', department: 'Land Acquisition System Administration', jurisdiction: 'India' },
]

export const affectedParcelMetadata = {
  'ULPIN-UP-7812-004': {
    gisAffected: true,
    affectedArea: '0.64 ha',
    landownerDetails: {
      name: 'Ritu Singh',
      familyMembers: 4,
      mobile: '+91 98765 43210',
      respondentType: 'Owner / cultivator',
      status: 'Primary claimant',
    },
    fieldVerificationStatus: 'Pending district review',
    currentAcquisitionStatus: 'Notification issued',
    notificationStatus: 'Not yet sent',
    notificationHistory: [],
  },
  'ULPIN-UP-7812-011': {
    gisAffected: true,
    affectedArea: '0.88 ha',
    landownerDetails: {
      name: 'Anil Verma',
      familyMembers: 6,
      mobile: '+91 99887 55661',
      respondentType: 'Joint ownership',
      status: 'Multiple claimants',
    },
    fieldVerificationStatus: 'Discrepancy found',
    currentAcquisitionStatus: 'Objection hearing pending',
    notificationStatus: 'In draft',
    notificationHistory: [],
  },
  'ULPIN-UP-7402-012': {
    gisAffected: true,
    affectedArea: '0.42 ha',
    landownerDetails: {
      name: 'Suman Yadav',
      familyMembers: 2,
      mobile: '+91 97654 12890',
      respondentType: 'Residential owner',
      status: 'Primary claimant',
    },
    fieldVerificationStatus: 'Verified',
    currentAcquisitionStatus: 'Notification current',
    notificationStatus: 'Awaiting dispatch',
    notificationHistory: [],
  },
  'ULPIN-UP-4821-220': {
    gisAffected: true,
    affectedArea: '0.71 ha',
    landownerDetails: {
      name: 'Gopal Mishra',
      familyMembers: 5,
      mobile: '+91 94150 33662',
      respondentType: 'Agricultural owner',
      status: 'Family affected',
    },
    fieldVerificationStatus: 'Survey in progress',
    currentAcquisitionStatus: 'Survey in progress',
    notificationStatus: 'Not yet sent',
    notificationHistory: [],
  },
}

export function canSendLandownerNotifications(role, profile) {
  if (role === 'admin') return true
  if (role === 'districtOfficer' && profile?.district) return true
  return false
}

export function getAffectedParcels(role, profile, projectRecords = projects) {
  const visibleParcels = getVisibleParcels(role, profile, projectRecords)
  return visibleParcels
    .filter((parcel) => Boolean(affectedParcelMetadata[parcel.id]))
    .map((parcel) => {
      const metadata = affectedParcelMetadata[parcel.id]
      const projectName = projectRecords.find((project) => project.id === parcel.projectId)?.name || 'Project parcel'
      return {
        ...parcel,
        ...metadata,
        projectName,
        affectedFamilyCount: metadata.landownerDetails?.familyMembers || parcel.affectedFamily || 1,
        affectedArea: metadata.affectedArea || parcel.area,
        notificationStatus: metadata.notificationStatus || 'Not yet sent',
      }
    })
}

export const configuredAuthorities = [
  { id: 'central-morth', name: 'Ministry of Road Transport and Highways', level: 'central', projectTypes: ['National Highway', 'National Highways'] },
  { id: 'central-railways', name: 'Ministry of Railways', level: 'central', projectTypes: ['Railway'] },
  { id: 'state-up-pwd', name: 'Public Works Department, Uttar Pradesh', level: 'state', state: 'Uttar Pradesh', projectTypes: ['State Highway', 'Road Infrastructure'] },
  { id: 'state-up-irrigation', name: 'Irrigation Department, Uttar Pradesh', level: 'state', state: 'Uttar Pradesh', projectTypes: ['Irrigation'] },
  { id: 'state-up-development', name: 'Uttar Pradesh State Industrial Development Authority', level: 'state', state: 'Uttar Pradesh', projectTypes: ['Industrial Corridor'] },
  { id: 'state-up-revenue', name: 'Revenue Department, Uttar Pradesh', level: 'state', state: 'Uttar Pradesh', projectTypes: ['Other'] },
  { id: 'state-gujarat-pwd', name: 'Roads and Buildings Department, Gujarat', level: 'state', state: 'Gujarat', projectTypes: ['State Highway', 'Road Infrastructure'] },
  { id: 'state-gujarat-irrigation', name: 'Water Resources Department, Gujarat', level: 'state', state: 'Gujarat', projectTypes: ['Irrigation'] },
  { id: 'state-gujarat-development', name: 'Gujarat Industrial Development Corporation', level: 'state', state: 'Gujarat', projectTypes: ['Industrial Corridor'] },
  { id: 'state-gujarat-revenue', name: 'Revenue Department, Gujarat', level: 'state', state: 'Gujarat', projectTypes: ['Other'] },
  { id: 'district-up-varanasi', name: 'District Collector / CALA, Varanasi', level: 'district', state: 'Uttar Pradesh', district: 'Varanasi', projectTypes: ['Urban Infrastructure'] },
  { id: 'district-up-lucknow', name: 'District Collector / CALA, Lucknow', level: 'district', state: 'Uttar Pradesh', district: 'Lucknow', projectTypes: ['Urban Infrastructure'] },
  { id: 'district-up-mirzapur', name: 'District Collector / CALA, Mirzapur', level: 'district', state: 'Uttar Pradesh', district: 'Mirzapur', projectTypes: ['Urban Infrastructure'] },
  { id: 'district-up-sultanpur', name: 'District Collector / CALA, Sultanpur', level: 'district', state: 'Uttar Pradesh', district: 'Sultanpur', projectTypes: ['Urban Infrastructure'] },
  { id: 'district-gujarat-anand', name: 'District Collector / Competent Authority, Anand', level: 'district', state: 'Gujarat', district: 'Anand', projectTypes: ['Urban Infrastructure'] },
]

export const configuredLocations = [
  { state: 'Uttar Pradesh', districts: ['Varanasi', 'Lucknow', 'Mirzapur', 'Sultanpur'] },
  { state: 'Gujarat', districts: ['Anand'] },
]

const approvalLevelByProjectType = {
  'National Highway': 'central',
  'National Highways': 'central',
  Railway: 'central',
  'State Highway': 'state',
  'Road Infrastructure': 'state',
  Irrigation: 'state',
  'Industrial Corridor': 'state',
  'Urban Infrastructure': 'district',
  Other: 'state',
}

const purposeTermsByProjectType = {
  'National Highway': /highway|road|transport|connectivity|corridor|safety|mobility/i,
  'National Highways': /highway|road|transport|connectivity|corridor|safety|mobility/i,
  Railway: /rail|transport|connectivity|corridor/i,
  'State Highway': /highway|road|transport|connectivity|corridor|safety|mobility/i,
  'Road Infrastructure': /highway|road|transport|connectivity|corridor|safety|mobility/i,
  Irrigation: /irrigat|water|canal|reservoir/i,
  'Industrial Corridor': /industrial|logistic|manufactur|employment|corridor|procurement/i,
  'Urban Infrastructure': /urban|infrastructure|mobility|public|city|drainage|water|connectivity|safety|access/i,
}

export function getConfiguredAuthorities(level, state, district) {
  return configuredAuthorities.filter((authority) => authority.level === level &&
    (level === 'central' || authority.state === state) &&
    (level !== 'district' || authority.district === district))
}

export function getRoutingSuggestion({ projectType, state, district, purpose }) {
  const level = approvalLevelByProjectType[projectType]
  if (!level || !state || !district || !purpose?.trim()) {
    return { valid: false, reason: 'Complete the project type, location, and purpose to validate the approval route.' }
  }
  const authority = configuredAuthorities.find((item) => item.level === level && item.state === (level === 'central' ? undefined : state) && item.district === (level === 'district' ? district : undefined) && item.projectTypes.includes(projectType))
  if (!authority) {
    return { valid: false, reason: `No configured ${level} authority is available for ${projectType} in ${district}, ${state}.` }
  }
  const purposeMatches = purposeTermsByProjectType[projectType]?.test(purpose) ?? purpose.trim().length >= 12
  return {
    valid: purposeMatches,
    approvalLevel: level,
    authority,
    reason: purposeMatches
      ? `${projectType} projects with this purpose in ${district}, ${state} are routed to this configured ${level} authority.`
      : `The stated purpose does not match configured routing rules for ${projectType}. Review the project purpose and location before submission.`,
  }
}

export function validateProjectRouting(project) {
  const suggestion = getRoutingSuggestion(project)
  const selectedAuthority = configuredAuthorities.find((authority) => authority.id === project.approvalAuthorityId)
  const valid = Boolean(suggestion.valid && selectedAuthority && project.approvalLevel === suggestion.approvalLevel && selectedAuthority.id === suggestion.authority.id)
  return {
    valid,
    suggestion,
    selectedAuthority,
    reason: valid ? suggestion.reason : 'Selected approval authority does not match the configured authority for this project. Please review the project details or select the appropriate authority.',
  }
}

export function canReviewProject(project, role, profile) {
  if (!['nationalOfficer', 'stateOfficer', 'districtOfficer', 'admin'].includes(role)) return false
  if (role === 'admin') return true
  const assignedAuthorities = profile?.authorityIds || [profile?.authorityId]
  if (!assignedAuthorities.includes(project.approvalAuthorityId)) return false
  if (role === 'nationalOfficer') return project.approvalLevel === 'central'
  if (role === 'stateOfficer') return project.approvalLevel === 'state' && project.state === profile.state
  return project.approvalLevel === 'district' && project.state === profile.state && project.district === profile.district
}

export function getReviewableProjects(role, profile, projectRecords = projects) {
  const reviewStatuses = ['SUBMITTED', 'UNDER REVIEW', 'RESUBMITTED']
  return getVisibleProjects(role, profile, projectRecords).filter((project) => reviewStatuses.includes(project.status) && canReviewProject(project, role, profile))
}

export const companyProfiles = {
  'Arvind Infrastructure Pvt. Ltd.': {
    legalName: 'Arvind Infrastructure Private Limited', registrationNumber: 'CIN: U45203DL2012PTC241908', headquarters: 'New Delhi, India', contact: 'procurement@arvindinfra.example', phone: '+91 11 4567 8920', yearsInBusiness: 14, employees: '1,240+', annualTurnover: '₹486 Cr', completedProjects: 38, rating: '4.7 / 5', services: ['Highway construction', 'Bridge and culvert works', 'Land development', 'Project management'], certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'NHAI Class A contractor'],
  },
  'Kashi GeoWorks Consortium': {
    legalName: 'Kashi GeoWorks Consortium LLP', registrationNumber: 'LLPIN: AAX-4482', headquarters: 'Varanasi, Uttar Pradesh', contact: 'bids@kashigeoworks.example', phone: '+91 542 402 1180', yearsInBusiness: 9, employees: '185+', annualTurnover: '₹72 Cr', completedProjects: 64, rating: '4.5 / 5', services: ['GIS mapping and survey', 'Drone-based verification', 'Land records digitisation', 'Environmental surveys'], certifications: ['ISO 9001:2015', 'DGCA drone authorisation', 'Geospatial services certified'],
  },
  'Himalaya Corridor Builders': {
    legalName: 'Himalaya Corridor Builders Private Limited', registrationNumber: 'CIN: U45200UP2020PTC126840', headquarters: 'Lucknow, Uttar Pradesh', contact: 'tenders@himalayacorridors.example', phone: '+91 522 410 9080', yearsInBusiness: 6, employees: '340+', annualTurnover: '₹96 Cr', completedProjects: 12, rating: '4.3 / 5', services: ['Highway construction', 'Bridge works', 'Corridor maintenance'], certifications: ['ISO 9001:2015', 'UP PWD registered contractor'],
  },
  'Pragati Urban Systems': {
    legalName: 'Pragati Urban Systems Limited', registrationNumber: 'CIN: U74999MH2016PLC287401', headquarters: 'Mumbai, Maharashtra', contact: 'partnerships@pragatiurban.example', phone: '+91 22 4912 6400', yearsInBusiness: 10, employees: '620+', annualTurnover: '₹214 Cr', completedProjects: 27, rating: '4.6 / 5', services: ['Urban infrastructure', 'Utility relocation', 'Smart corridor systems', 'Construction supervision'], certifications: ['ISO 9001:2015', 'ISO 45001:2018', 'CPWD registered contractor'],
  },
}

export const rolePermissions = {
  nationalOfficer: ['/dashboard', '/review-projects', '/projects', '/parcels', '/affected-parcels', '/gis', '/workflow', '/compensation', '/rr', '/alerts', '/documents', '/reports', '/profile'],
  stateOfficer: ['/dashboard', '/review-projects', '/projects', '/parcels', '/affected-parcels', '/gis', '/workflow', '/compensation', '/rr', '/alerts', '/documents', '/reports', '/profile'],
  districtOfficer: ['/dashboard', '/review-projects', '/projects', '/parcels', '/affected-parcels', '/gis', '/workflow', '/compensation', '/rr', '/field-verification', '/alerts', '/documents', '/reports', '/profile'],
  lrb: ['/dashboard', '/project-registration', '/projects', '/affected-parcels', '/gis', '/workflow', '/alerts', '/documents', '/profile'],
  fieldOfficer: ['/dashboard', '/field-verification', '/gis', '/parcels', '/documents', '/alerts'],
  citizen: ['/citizen', '/citizen/parcel', '/citizen/acquisition-status', '/citizen/compensation', '/citizen/rr-benefits', '/citizen/documents', '/citizen/objections', '/citizen/grievances'],
  admin: ['/dashboard', '/review-projects', '/projects', '/parcels', '/affected-parcels', '/gis', '/workflow', '/compensation', '/rr', '/field-verification', '/alerts', '/documents', '/reports', '/profile'],
}

export const roleNavigation = {
  nationalOfficer: [
    ['/dashboard', 'Dashboard'], ['/review-projects', 'Review Projects'], ['/projects', 'All Projects'], ['/parcels', 'Acquisition Cases'], ['/affected-parcels', 'Affected Parcels'],
    ['/alerts', 'Alerts'], ['/reports', 'Reports'], ['/profile', 'Profile'],
  ],
  stateOfficer: [
    ['/dashboard', 'Dashboard'], ['/review-projects', 'Review Projects'], ['/projects', 'Projects'], ['/parcels', 'Acquisition Cases'], ['/affected-parcels', 'Affected Parcels'],
    ['/alerts', 'Alerts'], ['/reports', 'Reports'], ['/profile', 'Profile'],
  ],
  districtOfficer: [
    ['/dashboard', 'Dashboard'], ['/review-projects', 'Review Projects'], ['/projects', 'Projects'], ['/parcels', 'Acquisition Cases'], ['/affected-parcels', 'Affected Parcels'],
    ['/field-verification', 'Survey Verification Objection'], ['/documents', 'Documents'], ['/alerts', 'Alerts'], ['/reports', 'Reports'], ['/profile', 'Profile'],
  ],
  lrb: [
    ['/dashboard', 'Dashboard'], ['/projects', 'Projects'], ['/project-registration', 'Create Project Proposal'], ['/affected-parcels', 'Affected Parcels'], ['/workflow', 'Project Progress'], ['/alerts', 'Notifications'], ['/documents', 'Documents'], ['/profile', 'Profile'],
  ],
  fieldOfficer: [
    ['/dashboard', 'Dashboard'], ['/field-verification', 'Assigned field tasks'], ['/parcels', 'Assigned parcels'], ['/gis', 'GIS map'], ['/documents', 'Field documents'], ['/alerts', 'Deadlines & alerts'],
  ],
  citizen: [
    ['/citizen', 'Overview'], ['/citizen/parcel', 'My Parcel'], ['/citizen/acquisition-status', 'Acquisition Status'], ['/citizen/compensation', 'Compensation'], ['/citizen/rr-benefits', 'R&R Benefits'], ['/citizen/documents', 'My Documents'], ['/citizen/objections', 'My Objections'], ['/citizen/grievances', 'My Grievances'],
  ],
  admin: [
    ['/dashboard', 'Dashboard'], ['/review-projects', 'Review Projects'], ['/projects', 'Projects'], ['/parcels', 'Parcel records'], ['/affected-parcels', 'Affected Parcels'], ['/gis', 'GIS map'], ['/workflow', 'Acquisition workflow'], ['/compensation', 'Compensation & payment'], ['/rr', 'Resettlement & rehabilitation'], ['/field-verification', 'Field verification'], ['/documents', 'Documents & records'], ['/alerts', 'Alerts'], ['/reports', 'Reports'], ['/profile', 'Profile'],
  ],
}

export const roleHomeMap = {
  nationalOfficer: '/dashboard',
  stateOfficer: '/dashboard',
  districtOfficer: '/dashboard',
  lrb: '/dashboard',
  fieldOfficer: '/dashboard',
  citizen: '/citizen',
  admin: '/dashboard',
}

export const projectStageFlow = [
  'Proposal',
  'Scrutiny',
  'Notification',
  'Objection',
  'Survey',
  'Declaration',
  'Award',
  'Compensation',
  'R&R',
  'Possession',
  'Closure',
]

export const workflowStages = [
  { name: 'Proposal', status: 'Completed', date: '2026-08-02', role: 'Project Planning Cell', sla: '10 days', completed: true },
  { name: 'Scrutiny', status: 'Completed', date: '2026-08-07', role: 'State Secretariat', sla: '14 days', completed: true },
  { name: 'Notification', status: 'Completed', date: '2026-08-15', role: 'District Collector', sla: '21 days', completed: true },
  { name: 'Objection', status: 'Pending Review', date: '2026-08-27', role: 'CALA Officer', sla: '30 days', completed: false },
  { name: 'Survey', status: 'In Progress', date: '2026-09-04', role: 'Field Officer', sla: '18 days', completed: false },
  { name: 'Declaration', status: 'Pending', date: '2026-09-20', role: 'State Government', sla: '45 days', completed: false },
  { name: 'Award', status: 'Pending', date: '2026-10-08', role: 'District Officer', sla: '12 days', completed: false },
  { name: 'Compensation', status: 'Pending', date: '2026-10-18', role: 'Treasury & Finance', sla: '7 days', completed: false },
  { name: 'R&R', status: 'Pending', date: '2026-10-30', role: 'R&R Cell', sla: '22 days', completed: false },
  { name: 'Possession', status: 'Pending', date: '2026-11-20', role: 'District Administration', sla: '15 days', completed: false },
  { name: 'Closure', status: 'Pending', date: '2026-12-05', role: 'Project Closure Cell', sla: '30 days', completed: false },
]

export const projects = [
  {
    id: 'NHC-2026-014',
    name: 'BHU National Highway Corridor',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    villages: ['Sahupur', 'Bhadiya', 'Rasalpur', 'Maheshpur'],
    projectType: 'National Highways',
    statute: 'RFCTLARR Act, 2013',
    authority: 'National Highways Authority of India',
    totalLandRequired: '245.8 ha',
    totalParcels: 54,
    acquired: 31,
    pending: 14,
    blocked: 9,
    progress: 58,
    status: 'Attention',
    stage: 'Award',
    readiness: '92%',
    daysRemaining: 18,
    proposalDeadline: '2026-10-12',
    bidOpeningDate: '2026-10-15',
    level: 'national',
    keyParcel: 'ULPIN-UP-7812-004',
  },
  {
    id: 'RRT-2026-119',
    name: 'Rani Tola Ring Road Project',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    villages: ['Bharwara', 'Khargapur'],
    projectType: 'Road Infrastructure',
    statute: 'RFCTLARR Act, 2013',
    authority: 'UP State Road Development Agency',
    totalLandRequired: '132.4 ha',
    totalParcels: 38,
    acquired: 29,
    pending: 6,
    blocked: 3,
    progress: 76,
    status: 'On Track',
    stage: 'Notification',
    readiness: '87%',
    daysRemaining: 41,
    proposalDeadline: '2026-10-28',
    bidOpeningDate: '2026-10-31',
    level: 'state',
    keyParcel: 'ULPIN-UP-7402-012',
  },
  {
    id: 'MSR-2026-833',
    name: 'Mirzapur Smart Rail Spur',
    state: 'Uttar Pradesh',
    district: 'Mirzapur',
    villages: ['Katra', 'Aman', 'Tisar'],
    projectType: 'Rail Corridor',
    statute: 'RFCTLARR Act, 2013',
    authority: 'Ministry of Railways',
    totalLandRequired: '186.2 ha',
    totalParcels: 61,
    acquired: 35,
    pending: 21,
    blocked: 5,
    progress: 57,
    status: 'Delayed',
    stage: 'Survey',
    readiness: '71%',
    daysRemaining: 11,
    proposalDeadline: '2026-10-04',
    bidOpeningDate: '2026-10-07',
    level: 'state',
    keyParcel: 'ULPIN-UP-4821-220',
  },
  {
    id: 'SIP-2026-440',
    name: 'Sultanpur Industrial Park',
    state: 'Uttar Pradesh',
    district: 'Sultanpur',
    villages: ['Pipra', 'Dantupur'],
    projectType: 'Industrial Zone',
    statute: 'State Land Acquisition Rules',
    authority: 'UP Industrial Development Authority',
    totalLandRequired: '98.7 ha',
    totalParcels: 28,
    acquired: 19,
    pending: 6,
    blocked: 3,
    progress: 68,
    status: 'On Track',
    stage: 'Compensation',
    readiness: '83%',
    daysRemaining: 29,
    proposalDeadline: '2026-10-19',
    bidOpeningDate: '2026-10-22',
    level: 'state',
    keyParcel: 'ULPIN-UP-4908-118',
  },
  {
    id: 'VFT-2026-207',
    name: 'Varanasi Freight Terminal Access Road',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    villages: ['Lakhanpur', 'Chitaipur'],
    projectType: 'Road Infrastructure',
    statute: 'State Land Acquisition Rules',
    authority: 'Varanasi District Administration',
    totalLandRequired: '42.6 ha',
    totalParcels: 19,
    acquired: 6,
    pending: 13,
    blocked: 2,
    progress: 32,
    status: 'New',
    stage: 'Proposal',
    readiness: '64%',
    daysRemaining: 72,
    proposalDeadline: '2026-11-08',
    bidOpeningDate: '2026-11-11',
    level: 'district',
    keyParcel: 'ULPIN-UP-7812-011',
  },
]

export const lrbProjects = [
  {
    id: 'LRB-2026-101',
    name: 'Varanasi Ring Road Expansion',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    villages: ['Sahupur', 'Bhadiya'],
    projectType: 'Road Infrastructure',
    statute: 'RFCTLARR Act, 2013',
    authority: 'Varanasi Development Authority',
    totalLandRequired: '82.5 ha',
    totalParcels: 0,
    acquired: 0,
    pending: 0,
    blocked: 0,
    progress: 0,
    status: 'DRAFT',
    stage: 'DRAFT',
    readiness: 'Draft saved by LRB',
    daysRemaining: 42,
    proposalDeadline: '2026-10-14',
    level: 'lrb',
    keyParcel: '',
    ownerRole: 'lrb',
    createdByUserId: 'USR007',
    createdByName: 'Neha Verma',
    lrbOrganization: 'Varanasi Development Authority',
    userRole: 'lrb',
    createdAt: '2026-09-20T09:10:00.000Z',
    updatedAt: '2026-09-22T08:30:00.000Z',
    approvalLevel: 'state',
    approvalAuthorityId: 'state-up-pwd',
    approvalAuthorityName: 'Public Works Department, Uttar Pradesh',
    approvalState: 'Uttar Pradesh',
    approvalDistrict: 'Varanasi',
    routingStatus: 'NOT VALIDATED',
    routingValidated: false,
    routingValidatedAt: null,
    projectCreatedBy: { userId: 'USR007', name: 'Neha Verma', designation: 'Land Requiring Body Officer', department: 'Varanasi Development Authority', role: 'lrb', createdAt: '2026-09-20T09:10:00.000Z' },
    description: 'Proposed ring road expansion for decongestion and intercity connectivity.',
    purpose: 'Improve transport connectivity and reduce congestion near the city core.',
    category: 'State Government Project',
  },
  {
    id: 'LRB-2026-102',
    name: 'Varanasi Canal Link Project',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    villages: ['Nagwa', 'Madhopur'],
    projectType: 'Irrigation',
    statute: 'RFCTLARR Act, 2013',
    authority: 'Irrigation Department, Uttar Pradesh',
    totalLandRequired: '126.1 ha',
    totalParcels: 0,
    acquired: 0,
    pending: 0,
    blocked: 0,
    progress: 5,
    status: 'QUERY RAISED',
    stage: 'UNDER REVIEW',
    readiness: 'Query under review by government',
    daysRemaining: 8,
    proposalDeadline: '2026-09-30',
    level: 'lrb',
    keyParcel: '',
    ownerRole: 'lrb',
    createdByUserId: 'USR007',
    createdByName: 'Neha Verma',
    lrbOrganization: 'Varanasi Development Authority',
    userRole: 'lrb',
    createdAt: '2026-09-15T12:00:00.000Z',
    updatedAt: '2026-09-28T17:10:00.000Z',
    approvalLevel: 'state',
    approvalAuthorityId: 'state-up-irrigation',
    approvalAuthorityName: 'Irrigation Department, Uttar Pradesh',
    approvalState: 'Uttar Pradesh',
    approvalDistrict: 'Varanasi',
    routingStatus: 'VALIDATED',
    routingValidated: true,
    routingValidatedAt: '2026-09-15T12:00:00.000Z',
    governmentQuery: 'Please provide the updated GIS alignment and confirm affected village boundaries.',
    projectCreatedBy: { userId: 'USR007', name: 'Neha Verma', designation: 'Land Requiring Body Officer', department: 'Varanasi Development Authority', role: 'lrb', createdAt: '2026-09-15T12:00:00.000Z' },
    description: 'Canal alignment to improve irrigation and water distribution to agricultural belt.',
    purpose: 'Support irrigation and regional water management.',
    category: 'State Government Project',
  },
  {
    id: 'LRB-2026-103',
    name: 'BHU Procurement Corridor',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    villages: ['Sundarpur', 'Rasoolpur'],
    projectType: 'Industrial Corridor',
    statute: 'RFCTLARR Act, 2013',
    authority: 'Varanasi Development Authority',
    totalLandRequired: '44.6 ha',
    totalParcels: 18,
    acquired: 12,
    pending: 3,
    blocked: 1,
    progress: 72,
    status: 'APPROVED',
    stage: 'GIS IDENTIFICATION',
    readiness: 'Government approval received',
    daysRemaining: 17,
    proposalDeadline: '2026-10-09',
    level: 'lrb',
    keyParcel: 'ULPIN-UP-7812-004',
    ownerRole: 'lrb',
    createdByUserId: 'USR007',
    createdByName: 'Neha Verma',
    lrbOrganization: 'Varanasi Development Authority',
    userRole: 'lrb',
    createdAt: '2026-08-12T08:00:00.000Z',
    updatedAt: '2026-09-25T11:05:00.000Z',
    approvalLevel: 'state',
    approvalAuthorityId: 'state-up-development',
    approvalAuthorityName: 'Uttar Pradesh State Industrial Development Authority',
    approvalState: 'Uttar Pradesh',
    approvalDistrict: 'Varanasi',
    routingStatus: 'VALIDATED',
    routingValidated: true,
    routingValidatedAt: '2026-08-12T08:00:00.000Z',
    projectCreatedBy: { userId: 'USR007', name: 'Neha Verma', designation: 'Land Requiring Body Officer', department: 'Varanasi Development Authority', role: 'lrb', createdAt: '2026-08-12T08:00:00.000Z' },
    description: 'Approved access corridor for procurement and logistics project at the university region.',
    purpose: 'Create a dedicated logistics corridor while preserving nearby settlements.',
    category: 'State Government Project',
  },
  {
    id: 'LRB-2026-104',
    name: 'Varanasi Urban Mobility Link',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    villages: ['Sundarpur', 'Lanka'],
    projectType: 'Urban Infrastructure',
    authority: 'Varanasi Development Authority',
    totalLandRequired: '18.4 ha',
    proposedAcquisitionArea: '12.8 ha',
    totalParcels: 0,
    acquired: 0,
    pending: 0,
    blocked: 0,
    progress: 5,
    status: 'SUBMITTED',
    reviewStatus: 'SUBMITTED',
    stage: 'UNDER REVIEW',
    readiness: 'Submitted for district review',
    daysRemaining: 35,
    proposalDeadline: '2026-11-04',
    level: 'lrb',
    ownerRole: 'lrb',
    createdByUserId: 'USR007',
    createdByName: 'Neha Verma',
    lrbOrganization: 'Varanasi Development Authority',
    userRole: 'lrb',
    createdAt: '2026-09-29T09:00:00.000Z',
    updatedAt: '2026-09-29T09:00:00.000Z',
    submissionDate: '2026-09-29T09:00:00.000Z',
    approvalLevel: 'district',
    approvalAuthorityId: 'district-up-varanasi',
    approvalAuthorityName: 'District Collector / CALA, Varanasi',
    approvalState: 'Uttar Pradesh',
    approvalDistrict: 'Varanasi',
    routingStatus: 'VALIDATED',
    routingValidated: true,
    routingValidatedAt: '2026-09-29T09:00:00.000Z',
    projectCreatedBy: { userId: 'USR007', name: 'Neha Verma', designation: 'Land Requiring Body Officer', department: 'Varanasi Development Authority', role: 'lrb', createdAt: '2026-09-29T09:00:00.000Z' },
    description: 'A local mobility connection to improve safe access between residential areas and the transit corridor.',
    purpose: 'Reduce travel time and improve safe public access in Varanasi.',
    category: 'State Government Project',
    documents: [],
    timeline: [{ status: 'SUBMITTED', description: 'Proposal submitted for government review.', actor: 'Neha Verma', at: '2026-09-29T09:00:00.000Z' }],
  },
  {
    id: 'LRB-2026-105',
    name: 'Eastern Uttar Pradesh Highway Connector',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    villages: ['Mohan', 'Kakori'],
    projectType: 'National Highway',
    authority: 'National Highways Authority of India',
    totalLandRequired: '96.2 ha',
    proposedAcquisitionArea: '64.5 ha',
    totalParcels: 0,
    acquired: 0,
    pending: 0,
    blocked: 0,
    progress: 5,
    status: 'SUBMITTED',
    reviewStatus: 'SUBMITTED',
    stage: 'UNDER REVIEW',
    readiness: 'Submitted for central review',
    daysRemaining: 50,
    proposalDeadline: '2026-11-19',
    level: 'lrb',
    ownerRole: 'lrb',
    createdByUserId: 'USR007',
    createdByName: 'Neha Verma',
    lrbOrganization: 'Varanasi Development Authority',
    userRole: 'lrb',
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    submissionDate: '2026-09-28T10:00:00.000Z',
    approvalLevel: 'central',
    approvalAuthorityId: 'central-morth',
    approvalAuthorityName: 'Ministry of Road Transport and Highways',
    approvalState: 'Uttar Pradesh',
    approvalDistrict: 'Lucknow',
    routingStatus: 'VALIDATED',
    routingValidated: true,
    routingValidatedAt: '2026-09-28T10:00:00.000Z',
    projectCreatedBy: { userId: 'USR007', name: 'Neha Verma', designation: 'Land Requiring Body Officer', department: 'Varanasi Development Authority', role: 'lrb', createdAt: '2026-09-28T10:00:00.000Z' },
    description: 'A proposed highway connector to improve regional logistics and reduce congestion on local routes.',
    purpose: 'Provide a safer high-capacity link between regional transport corridors.',
    category: 'Central Government Project',
    documents: [],
    timeline: [{ status: 'SUBMITTED', description: 'Proposal submitted for government review.', actor: 'Neha Verma', at: '2026-09-28T10:00:00.000Z' }],
  },
  {
    id: 'LRB-2026-106',
    name: 'Varanasi State Highway Safety Upgrade',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    villages: ['Rohania', 'Shivpur'],
    projectType: 'State Highway',
    authority: 'Varanasi Development Authority',
    totalLandRequired: '27.3 ha',
    proposedAcquisitionArea: '16.2 ha',
    totalParcels: 0,
    acquired: 0,
    pending: 0,
    blocked: 0,
    progress: 5,
    status: 'SUBMITTED',
    reviewStatus: 'SUBMITTED',
    stage: 'UNDER REVIEW',
    readiness: 'Submitted for state review',
    daysRemaining: 39,
    proposalDeadline: '2026-11-08',
    level: 'lrb',
    ownerRole: 'lrb',
    createdByUserId: 'USR007',
    createdByName: 'Neha Verma',
    lrbOrganization: 'Varanasi Development Authority',
    userRole: 'lrb',
    createdAt: '2026-09-30T09:00:00.000Z',
    updatedAt: '2026-09-30T09:00:00.000Z',
    submissionDate: '2026-09-30T09:00:00.000Z',
    approvalLevel: 'state',
    approvalAuthorityId: 'state-up-pwd',
    approvalAuthorityName: 'Public Works Department, Uttar Pradesh',
    approvalState: 'Uttar Pradesh',
    approvalDistrict: 'Varanasi',
    routingStatus: 'VALIDATED',
    routingValidated: true,
    routingValidatedAt: '2026-09-30T09:00:00.000Z',
    projectCreatedBy: { userId: 'USR007', name: 'Neha Verma', designation: 'Land Requiring Body Officer', department: 'Varanasi Development Authority', role: 'lrb', createdAt: '2026-09-30T09:00:00.000Z' },
    description: 'Safety improvements and targeted widening for the Varanasi state highway connection.',
    purpose: 'Improve road safety and reduce congestion along the state highway.',
    category: 'State Government Project',
    documents: [],
    timeline: [{ status: 'SUBMITTED', description: 'Proposal submitted for government review.', actor: 'Neha Verma', at: '2026-09-30T09:00:00.000Z' }],
  },
]

export const parcels = [
  {
    id: 'ULPIN-UP-7812-004',
    ulpin: 'ULPIN-UP-7812-004',
    projectId: 'NHC-2026-014',
    surveyNo: '12/2A',
    village: 'Sahupur',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    area: '1.44 ha',
    landType: 'Agricultural',
    currentStage: 'Award',
    status: 'Attention',
    paymentStatus: 'Pending',
    rrStatus: 'Pending',
    compensation: { assessed: 9800000, awarded: 7600000, paid: 3200000, pending: 4400000 },
    affectedFamily: 4,
    displacedFamily: 2,
    blocker: 'Pending compensation verification',
    daysBlocked: 12,
    lastUpdated: '2026-09-12',
    mapLocation: { lat: 25.3174, lng: 82.9738 },
    timeline: [
      { date: '2026-08-02', title: 'Proposal created' },
      { date: '2026-08-07', title: 'Scrutiny completed' },
      { date: '2026-08-15', title: 'Notification issued' },
      { date: '2026-08-27', title: 'Objection received' },
      { date: '2026-09-04', title: 'Survey completed' },
      { date: '2026-09-12', title: 'Award passed' },
    ],
    documentTypes: ['Notification', 'Survey report', 'Award document', 'Payment proof'],
    review: 'Discrepancy Found',
    occupantInfo: 'Three cultivators and one tenant occupant',
    gps: 'Stable',
    boundary: 'Verified',
    structures: 2,
    trees: 18,
    wells: 1,
    crops: 'Rice and wheat',
    relatedFamilyRecords: ['RR-2041', 'RR-2042'],
    acquisition: {
      notification: 'Completed',
      objection: 'Pending hearing',
      survey: 'Completed',
      declaration: 'Awaiting approval',
      award: 'In final review',
      possession: 'Not started',
    },
  },
  {
    id: 'ULPIN-UP-7812-008',
    ulpin: 'ULPIN-UP-7812-008',
    projectId: 'NHC-2026-014',
    surveyNo: '14/3B',
    village: 'Bhadiya',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    area: '1.28 ha',
    landType: 'Agricultural',
    currentStage: 'Payment',
    status: 'In Progress',
    paymentStatus: 'Deposited',
    rrStatus: 'Delivered',
    compensation: { assessed: 8450000, awarded: 8450000, paid: 8450000, pending: 0 },
    affectedFamily: 3,
    displacedFamily: 1,
    blocker: 'No blocker',
    daysBlocked: 0,
    lastUpdated: '2026-09-18',
    mapLocation: { lat: 25.3261, lng: 82.9612 },
    timeline: [
      { date: '2026-08-05', title: 'Proposal created' },
      { date: '2026-08-12', title: 'Notification issued' },
      { date: '2026-08-22', title: 'Survey completed' },
      { date: '2026-09-02', title: 'Award passed' },
      { date: '2026-09-18', title: 'Payment deposited' },
    ],
    documentTypes: ['Notification', 'Award document', 'Payment proof'],
    review: 'Verified',
    occupantInfo: 'Single owner family',
    gps: 'Stable',
    boundary: 'Verified',
    structures: 0,
    trees: 7,
    wells: 0,
    crops: 'Mustard',
    relatedFamilyRecords: ['RR-2056'],
    acquisition: {
      notification: 'Completed',
      objection: 'Resolved',
      survey: 'Completed',
      declaration: 'Approved',
      award: 'Completed',
      possession: 'Pending',
    },
  },
  {
    id: 'ULPIN-UP-7812-011',
    ulpin: 'ULPIN-UP-7812-011',
    projectId: 'NHC-2026-014',
    surveyNo: '20/1',
    village: 'Rasalpur',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    area: '2.16 ha',
    landType: 'Mixed use',
    currentStage: 'Objection',
    status: 'Blocked',
    paymentStatus: 'Failed',
    rrStatus: 'Pending',
    compensation: { assessed: 12150000, awarded: 12150000, paid: 2600000, pending: 9550000 },
    affectedFamily: 6,
    displacedFamily: 3,
    blocker: 'Objection hearing pending',
    daysBlocked: 26,
    lastUpdated: '2026-09-10',
    mapLocation: { lat: 25.3309, lng: 82.9891 },
    timeline: [
      { date: '2026-08-04', title: 'Proposal created' },
      { date: '2026-08-14', title: 'Notification issued' },
      { date: '2026-08-29', title: 'Objection filed' },
      { date: '2026-09-02', title: 'Hearing awaited' },
    ],
    documentTypes: ['Notification', 'Objection record', 'Survey report'],
    review: 'Requires Review',
    occupantInfo: 'Multiple claimants',
    gps: 'Weak',
    boundary: 'Discrepancy',
    structures: 4,
    trees: 31,
    wells: 2,
    crops: 'Vegetables',
    relatedFamilyRecords: ['RR-2061', 'RR-2062'],
    acquisition: {
      notification: 'Completed',
      objection: 'Hearing due',
      survey: 'Completed',
      declaration: 'Blocked',
      award: 'Pending',
      possession: 'Blocked',
    },
  },
  {
    id: 'ULPIN-UP-7402-012',
    ulpin: 'ULPIN-UP-7402-012',
    projectId: 'RRT-2026-119',
    surveyNo: '7/4A',
    village: 'Bharwara',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    area: '1.12 ha',
    landType: 'Residential',
    currentStage: 'Notification',
    status: 'On Track',
    paymentStatus: 'Pending',
    rrStatus: 'Eligible',
    compensation: { assessed: 7600000, awarded: 7600000, paid: 1600000, pending: 6000000 },
    affectedFamily: 2,
    displacedFamily: 1,
    blocker: 'Awaiting district clearance',
    daysBlocked: 5,
    lastUpdated: '2026-09-08',
    mapLocation: { lat: 26.845, lng: 80.947 },
    timeline: [
      { date: '2026-08-10', title: 'Proposal created' },
      { date: '2026-08-18', title: 'Scrutiny completed' },
      { date: '2026-08-29', title: 'Notification issued' },
    ],
    documentTypes: ['Notification', 'Survey report'],
    review: 'Verified',
    occupantInfo: 'Residential plots with one shop',
    gps: 'Stable',
    boundary: 'Verified',
    structures: 3,
    trees: 9,
    wells: 0,
    crops: 'None',
    relatedFamilyRecords: ['RR-3018'],
    acquisition: {
      notification: 'Current',
      objection: 'Awaiting window',
      survey: 'Completed',
      declaration: 'Pending',
      award: 'Pending',
      possession: 'Pending',
    },
  },
  {
    id: 'ULPIN-UP-4821-220',
    ulpin: 'ULPIN-UP-4821-220',
    projectId: 'MSR-2026-833',
    surveyNo: '52/1',
    village: 'Katra',
    district: 'Mirzapur',
    state: 'Uttar Pradesh',
    area: '1.96 ha',
    landType: 'Agricultural',
    currentStage: 'Survey',
    status: 'Delayed',
    paymentStatus: 'Pending',
    rrStatus: 'Pending',
    compensation: { assessed: 11000000, awarded: 9900000, paid: 0, pending: 9900000 },
    affectedFamily: 5,
    displacedFamily: 2,
    blocker: 'Survey verification incomplete',
    daysBlocked: 21,
    lastUpdated: '2026-09-05',
    mapLocation: { lat: 25.1371, lng: 82.5655 },
    timeline: [
      { date: '2026-07-30', title: 'Proposal created' },
      { date: '2026-08-10', title: 'Notification issued' },
      { date: '2026-08-26', title: 'Survey in progress' },
    ],
    documentTypes: ['Notification', 'Survey report'],
    review: 'Discrepancy Found',
    occupantInfo: 'Two plot owners and family structures',
    gps: 'Stable',
    boundary: 'Pending',
    structures: 2,
    trees: 14,
    wells: 1,
    crops: 'Barley',
    relatedFamilyRecords: ['RR-4101'],
    acquisition: {
      notification: 'Completed',
      objection: 'Pending',
      survey: 'In progress',
      declaration: 'Pending',
      award: 'Pending',
      possession: 'Pending',
    },
  },
  {
    id: 'ULPIN-UP-4908-118',
    ulpin: 'ULPIN-UP-4908-118',
    projectId: 'SIP-2026-440',
    surveyNo: '18/6',
    village: 'Dantupur',
    district: 'Sultanpur',
    state: 'Uttar Pradesh',
    area: '0.88 ha',
    landType: 'Commercial',
    currentStage: 'Compensation',
    status: 'On Track',
    paymentStatus: 'Paid',
    rrStatus: 'Delivered',
    compensation: { assessed: 6800000, awarded: 6800000, paid: 6800000, pending: 0 },
    affectedFamily: 2,
    displacedFamily: 1,
    blocker: 'No blocker',
    daysBlocked: 0,
    lastUpdated: '2026-09-20',
    mapLocation: { lat: 26.264, lng: 82.075 },
    timeline: [
      { date: '2026-08-08', title: 'Proposal created' },
      { date: '2026-08-18', title: 'Notification issued' },
      { date: '2026-08-26', title: 'Survey completed' },
      { date: '2026-09-02', title: 'Award passed' },
      { date: '2026-09-20', title: 'Compensation paid' },
    ],
    documentTypes: ['Award document', 'Payment proof'],
    review: 'Verified',
    occupantInfo: 'Commercial owner',
    gps: 'Stable',
    boundary: 'Verified',
    structures: 1,
    trees: 6,
    wells: 0,
    crops: 'None',
    relatedFamilyRecords: ['RR-5102'],
    acquisition: {
      notification: 'Completed',
      objection: 'Resolved',
      survey: 'Completed',
      declaration: 'Approved',
      award: 'Completed',
      possession: 'Pending',
    },
  },
]

export const alerts = [
  { id: 'ALT-201', severity: 'Critical', title: 'Statutory deadline approaching', project: 'BHU National Highway Corridor', parcel: 'ULPIN-UP-7812-004', officer: 'District CALA Officer', deadline: '2026-09-30', status: 'Critical', role: 'nationalOfficer' },
  { id: 'ALT-202', severity: 'Critical', title: 'Payment failed for award disbursement', project: 'BHU National Highway Corridor', parcel: 'ULPIN-UP-7812-011', officer: 'Treasury & Finance', deadline: '2026-09-25', status: 'Critical', role: 'financeOfficer' },
  { id: 'ALT-203', severity: 'Warning', title: 'R&R delivery delayed', project: 'Mirzapur Smart Rail Spur', parcel: 'ULPIN-UP-4821-220', officer: 'R&R Cell', deadline: '2026-10-03', status: 'Warning', role: 'rrAdministrator' },
  { id: 'ALT-204', severity: 'Warning', title: 'Objection hearing pending', project: 'BHU National Highway Corridor', parcel: 'ULPIN-UP-7812-011', officer: 'CALA Officer', deadline: '2026-09-26', status: 'Warning', role: 'districtOfficer' },
  { id: 'ALT-205', severity: 'Warning', title: 'Survey verification incomplete', project: 'Mirzapur Smart Rail Spur', parcel: 'ULPIN-UP-4821-220', officer: 'Gram Panchayat Officer', deadline: '2026-09-27', status: 'Warning', role: 'gramPanchayatOfficer' },
]

export const documents = [
  { id: 'DOC-101', name: 'Notification Order - Sahupur', type: 'Notification', parcel: 'ULPIN-UP-7812-004', uploadedBy: 'District Office', date: '2026-08-15', version: 'V3', status: 'Verified' },
  { id: 'DOC-102', name: 'Survey Field Report - Rasalpur', type: 'Survey Report', parcel: 'ULPIN-UP-7812-011', uploadedBy: 'Field Team', date: '2026-09-02', version: 'V2', status: 'Pending Review' },
  { id: 'DOC-103', name: 'Award Order - Bhadiya', type: 'Award Order', parcel: 'ULPIN-UP-7812-008', uploadedBy: 'CALA Office', date: '2026-09-02', version: 'V1', status: 'Approved' },
  { id: 'DOC-104', name: 'Payment Proof - Dantupur', type: 'Payment Document', parcel: 'ULPIN-UP-4908-118', uploadedBy: 'Finance Cell', date: '2026-09-20', version: 'V1', status: 'Verified' },
  { id: 'DOC-105', name: 'R&R Assistance Register', type: 'R&R Document', parcel: 'ULPIN-UP-7812-004', uploadedBy: 'R&R Cell', date: '2026-09-12', version: 'V4', status: 'Draft' },
]

export const familyRecords = [
  { id: 'RR-2041', family: 'Family A', parcel: 'ULPIN-UP-7812-004', village: 'Sahupur', type: 'Affected', entitlement: 'Housing assistance', delivered: '₹8.4L', pending: '₹0', status: 'Delivered' },
  { id: 'RR-2042', family: 'Family B', parcel: 'ULPIN-UP-7812-004', village: 'Sahupur', type: 'Displaced', entitlement: 'Resettlement plot', delivered: '₹0', pending: '₹14.2L', status: 'Pending' },
  { id: 'RR-2056', family: 'Family C', parcel: 'ULPIN-UP-7812-008', village: 'Bhadiya', type: 'Affected', entitlement: 'Livelihood support', delivered: '₹6.8L', pending: '₹0', status: 'Delivered' },
  { id: 'RR-2061', family: 'Family D', parcel: 'ULPIN-UP-7812-011', village: 'Rasalpur', type: 'Displaced', entitlement: 'House construction aid', delivered: '₹0', pending: '₹18.5L', status: 'Pending' },
  { id: 'RR-3018', family: 'Family E', parcel: 'ULPIN-UP-7402-012', village: 'Bharwara', type: 'Affected', entitlement: 'Transition support', delivered: '₹3.1L', pending: '₹1.3L', status: 'In Progress' },
]

export const activityFeed = [
  'Parcel ULPIN-UP-7812-004 moved to Award stage',
  'Payment status updated for parcel ULPIN-UP-7812-011',
  'Field verification submitted for Sahupur village',
  'Objection hearing scheduled for Rasalpur parcel cluster',
  'Project BHU National Highway Corridor flagged for SLA review',
]

export const paymentDistribution = [
  { name: 'Paid', value: 52 },
  { name: 'Pending', value: 31 },
  { name: 'Failed', value: 11 },
  { name: 'Returned', value: 6 },
]

export const dashboardStats = {
  totalProjects: 24,
  totalParcels: 12480,
  acquisitionCompleted: 8920,
  compensationPending: 1240,
  rrPending: 680,
  blockedParcels: 315,
}

export const stateComparison = [
  { state: 'Uttar Pradesh', projects: 8, progress: 72 },
  { state: 'Madhya Pradesh', projects: 6, progress: 64 },
  { state: 'Maharashtra', projects: 5, progress: 60 },
  { state: 'Odisha', projects: 4, progress: 58 },
  { state: 'Rajasthan', projects: 4, progress: 49 },
]

export const stageDuration = [
  { name: 'Scrutiny', days: 14 },
  { name: 'Notification', days: 23 },
  { name: 'Objection', days: 31 },
  { name: 'Survey', days: 22 },
  { name: 'Award', days: 17 },
  { name: 'Payment', days: 27 },
  { name: 'R&R', days: 35 },
]

export const corridorPolygons = [
  { id: 'ULPIN-UP-7812-004', key: 'ULPIN-UP-7812-004', status: 'Blocked', label: 'Sahupur', lat: 25.3174, lng: 82.9738 },
  { id: 'ULPIN-UP-7812-008', key: 'ULPIN-UP-7812-008', status: 'Completed', label: 'Bhadiya', lat: 25.3261, lng: 82.9612 },
  { id: 'ULPIN-UP-7812-011', key: 'ULPIN-UP-7812-011', status: 'Objection', label: 'Rasalpur', lat: 25.3309, lng: 82.9891 },
  { id: 'ULPIN-UP-7402-012', key: 'ULPIN-UP-7402-012', status: 'Awarded', label: 'Bharwara', lat: 26.845, lng: 80.947 },
  { id: 'ULPIN-UP-4821-220', key: 'ULPIN-UP-4821-220', status: 'Pending', label: 'Katra', lat: 25.1371, lng: 82.5655 },
  { id: 'ULPIN-UP-4908-118', key: 'ULPIN-UP-4908-118', status: 'Paid', label: 'Dantupur', lat: 26.264, lng: 82.075 },
]

export const defaultCitizenParcelId = 'ULPIN-UP-7812-004'

export const citizenPortalData = {
  objections: [
    { id: 'OBJ-2026-0041', project: 'BHU National Highway Corridor', submittedDate: '2026-08-27', status: 'Under review', response: 'Hearing scheduled' },
  ],
  grievances: [
    { id: 'GRV-2026-0019', subject: 'Correction requested in award record', submittedDate: '2026-09-12', status: 'In progress', lastUpdate: '2026-09-18' },
  ],
  documents: [
    { id: 'CIT-DOC-001', name: 'Acquisition Notice - Sahupur', type: 'Acquisition Notice', date: '2026-08-15', status: 'Available' },
    { id: 'CIT-DOC-002', name: 'Survey Report - Sahupur', type: 'Survey Report', date: '2026-09-04', status: 'Available' },
    { id: 'CIT-DOC-003', name: 'Award Document - Sahupur', type: 'Award Document', date: '2026-09-12', status: 'Available' },
    { id: 'CIT-DOC-004', name: 'Compensation Assessment', type: 'Compensation Document', date: '2026-09-15', status: 'Available' },
    { id: 'CIT-DOC-005', name: 'R&R Entitlement Record', type: 'R&R Document', date: '2026-09-18', status: 'Available' },
  ],
  notifications: [
    'Acquisition notice issued for your parcel',
    'Compensation assessment updated',
    'Objection response deadline: 24 Nov 2026',
  ],
}

export function getVisibleProjects(role, profile, projectRecords = projects) {
  if (role === 'citizen') return projectRecords.filter((project) => project.keyParcel === profile?.parcelIds?.[0] || project.keyParcel === defaultCitizenParcelId || project.projectCreatedBy?.role === role)
  if (role === 'fieldOfficer') return projectRecords.filter((project) => profile?.assignedParcelIds?.some((id) => project.keyParcel === id))
  if (role === 'districtOfficer') return projectRecords.filter((project) => project.state === profile?.state && project.district === profile?.district)
  if (role === 'stateOfficer') return projectRecords.filter((project) => project.state === profile?.state)
  if (role === 'lrb') return projectRecords.filter((project) => project.createdByUserId === profile?.id || (profile?.organization && project.lrbOrganization === profile.organization))
  return projectRecords
}

export function getVisibleFieldReports(role, profile, fieldReports = []) {
  if (role === 'fieldOfficer') return fieldReports.filter((report) => report.fieldOfficerId === profile?.id && profile?.assignedParcelIds?.includes(report.parcelId))
  if (role === 'districtOfficer') return fieldReports.filter((report) => report.status !== 'DRAFT' && report.state === profile?.state && report.district === profile?.district)
  if (role === 'stateOfficer') return fieldReports.filter((report) => report.status !== 'DRAFT' && report.state === profile?.state)
  if (role === 'nationalOfficer' || role === 'admin') return fieldReports.filter((report) => report.status !== 'DRAFT')
  return []
}

export function getVisibleParcels(role, profile, projectRecords = projects) {
  if (role === 'citizen') return parcels.filter((parcel) => profile?.parcelIds?.includes(parcel.id))
  if (role === 'fieldOfficer') return parcels.filter((parcel) => profile?.assignedParcelIds?.includes(parcel.id))
  if (role === 'districtOfficer') return parcels.filter((parcel) => parcel.state === profile?.state && parcel.district === profile?.district)
  if (role === 'stateOfficer') return parcels.filter((parcel) => parcel.state === profile?.state)
  if (role === 'lrb') {
    const ownedProjects = getVisibleProjects(role, profile, projectRecords)
    const ownedProjectIds = new Set(ownedProjects.map((project) => project.id))
    const ownedParcelIds = new Set(ownedProjects.map((project) => project.keyParcel).filter(Boolean))
    return parcels.filter((parcel) => ownedProjectIds.has(parcel.projectId) || ownedParcelIds.has(parcel.id))
  }
  return parcels
}

export function getVisibleAlerts(role, profile, projectRecords = []) {
  if (role === 'citizen') return [{ id: 'CIT-001', title: 'Your compensation payment is under processing.', severity: 'Info', project: 'Your parcel', parcel: profile?.parcelIds?.[0], officer: 'BHU-SETU', deadline: 'Current', status: 'Open' }]
  if (role === 'lrb') {
    const projectEvents = getVisibleProjects(role, profile, projectRecords).flatMap((project) => (project.timeline || []).map((event) => ({ id: `${project.id}-${event.at}`, title: `${project.name}: ${event.description}`, severity: 'Info', project: project.name, parcel: project.id, officer: event.actor, deadline: new Date(event.at).toLocaleDateString('en-IN'), status: event.status, role: 'lrb' }))).slice(-5).reverse()
    const staticAlerts = [
    { id: 'LRB-001', title: 'Project proposal submitted for government review.', severity: 'Info', project: 'Varanasi Ring Road expansion', parcel: 'Draft proposal', officer: 'Government Review Cell', deadline: 'Current', status: 'Open', role: 'lrb' },
    { id: 'LRB-002', title: 'Query raised on project alignment details.', severity: 'Warning', project: 'Varanasi Canal Link Project', parcel: 'Query response pending', officer: 'District Officer', deadline: 'Within 7 days', status: 'Pending', role: 'lrb' },
    { id: 'LRB-003', title: 'Project approval confirmed by government authority.', severity: 'Success', project: 'BHU Procurement Corridor', parcel: 'Acquisition starts', officer: 'State Authority', deadline: 'Current', status: 'Resolved', role: 'lrb' },
    ]
    return [...projectEvents, ...staticAlerts].slice(0, 5)
  }
  const accessibleProjectNames = new Set(getVisibleProjects(role, profile, projectRecords.length ? projectRecords : projects).map((project) => project.name))
  const scopedAlerts = alerts.filter((alert) => accessibleProjectNames.has(alert.project) && (!alert.parcel || getVisibleParcels(role, profile, projectRecords.length ? projectRecords : projects).some((parcel) => parcel.id === alert.parcel)))
  if (role === 'nationalOfficer') return scopedAlerts
  if (role === 'stateOfficer') return scopedAlerts.filter((alert) => alert.role !== 'nationalOfficer')
  if (role === 'fieldOfficer') return scopedAlerts.filter((alert) => alert.role === 'gramPanchayatOfficer' || alert.role === 'fieldOfficer')
  if (role === 'admin') return alerts
  return scopedAlerts.filter((alert) => alert.role === role || (role === 'districtOfficer' && alert.role === 'fieldOfficer'))
}

export function getVisibleDocuments(role, profile, projectRecords = projects) {
  if (role === 'citizen') return documents.filter((document) => profile?.parcelIds?.includes(document.parcel))
  if (role === 'fieldOfficer') return documents.filter((document) => profile?.assignedParcelIds?.includes(document.parcel))
  if (role === 'admin') return documents
  if (role === 'lrb') return getVisibleProjects(role, profile, projectRecords).flatMap((project) => (project.documents || []).map((document, index) => ({ ...document, id: `${project.id}-DOC-${index}`, project: project.name, parcel: project.id, type: 'Project proposal', status: 'Available', version: document.version || 1, date: document.uploadedAt || project.createdAt })))
  const accessibleParcels = new Set(getVisibleParcels(role, profile, projectRecords).map((parcel) => parcel.id))
  return documents.filter((document) => accessibleParcels.has(document.parcel))
}
