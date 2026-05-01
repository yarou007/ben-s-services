export type Trend = 'up' | 'down' | 'steady';

export interface StatCard {
  label: string;
  value: string;
  trend: Trend;
  change: string;
}

export interface RequestItem {
  id: string;
  title: string;
  category: string;
  status: 'Open' | 'In Review' | 'Assigned' | 'Resolved';
  sla: string;
  owner: string;
  location?: string;
  customer?: string;
  accountType?: 'Commercial' | 'Residential';
  priority?: 'Low' | 'Medium' | 'High' | 'Emergency';
  createdAt?: string;
}

export interface Employee {
  name: string;
  role: string;
  department: string;
  status: string;
  shift: string;
}

export interface Provider {
  name: string;
  rating: string;
  specialty: string;
  coverage: string;
  status: string;
  responseTime: string;
  jobsCompleted: string;
}

export interface Invoice {
  code: string;
  client: string;
  amount: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  due: string;
  method?: string;
  sentTo?: string;
}

export interface TimelineItem {
  time: string;
  title: string;
  note: string;
}

export interface CustomerBadge {
  label: string;
  detail: string;
}

export interface FeaturedService {
  title: string;
  description: string;
  items: string[];
}

export interface PromotionCard {
  title: string;
  detail: string;
  cta: string;
}

export interface ProviderStat {
  label: string;
  value: string;
  detail: string;
}

export interface ProviderJob {
  id: string;
  title: string;
  status: 'Pending' | 'Accepted' | 'Completed';
  location: string;
  distance: string;
  eta: string;
  customer: string;
}

export interface ProviderNotification {
  time: string;
  message: string;
}

export interface ProviderHistory {
  id: string;
  service: string;
  date: string;
  rating: string;
  payout: string;
}

export interface AdminHighlight {
  title: string;
  detail: string;
}

export interface RegionStat {
  region: string;
  volume: string;
  sla: string;
}

export interface ServiceCatalogItem {
  name: string;
  type: string;
  responseTarget: string;
  compliance: string;
}

export interface ReportTemplate {
  name: string;
  cadence: string;
  format: string;
}

export interface DispatchStep {
  label: string;
  status: 'done' | 'active' | 'pending';
  timestamp: string;
}

export interface ProviderOption {
  name: string;
  specialty: string;
  eta: string;
  rating: string;
  coverage: string;
}

export interface RequestActivity {
  time: string;
  title: string;
  note: string;
}

export interface CustomerAccount {
  name: string;
  segment: string;
  email: string;
  lastRequest: string;
  status: string;
  lifetimeValue: string;
}

export interface CrmContract {
  name: string;
  status: string;
  renewal: string;
  value: string;
}

export interface CrmSite {
  name: string;
  address: string;
  manager: string;
  sla: string;
}

export interface CrmContactLog {
  date: string;
  channel: string;
  note: string;
}

export interface ServiceCategory {
  name: string;
  description: string;
  items: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ServiceArea {
  region: string;
  cities: string;
}

export const adminStats: StatCard[] = [
  { label: 'Active Requests', value: '212', trend: 'up', change: '+9% this week' },
  { label: 'Provider Response', value: '94%', trend: 'up', change: '+3% vs last month' },
  { label: 'Resolution Time', value: '2.4d', trend: 'down', change: '-0.6d improvement' },
  { label: 'Customer Satisfaction', value: '4.8/5', trend: 'steady', change: 'Stable across markets' }
];

export const adminRequests: RequestItem[] = [
  {
    id: 'REQ-3101',
    title: 'Emergency lockout assistance',
    category: 'Locksmith',
    status: 'Assigned',
    sla: '2 hours',
    owner: 'Dispatch East',
    location: 'Brooklyn, NY',
    customer: 'Avery Cole',
    accountType: 'Residential',
    priority: 'Emergency',
    createdAt: '10:12 AM'
  },
  {
    id: 'REQ-3102',
    title: 'Storefront glass repair',
    category: 'Glass Repair',
    status: 'In Review',
    sla: '4 hours',
    owner: 'Quality Desk',
    location: 'Queens, NY',
    customer: 'Nora Patel',
    accountType: 'Commercial',
    priority: 'High',
    createdAt: '09:40 AM'
  },
  {
    id: 'REQ-3103',
    title: 'Office lock replacement',
    category: 'Locksmith',
    status: 'Open',
    sla: '6 hours',
    owner: 'Dispatch Central',
    location: 'Jersey City, NJ',
    customer: 'Blue Harbor Dental',
    accountType: 'Commercial',
    priority: 'Medium',
    createdAt: '08:55 AM'
  },
  {
    id: 'REQ-3104',
    title: 'Glass panel replacement',
    category: 'Glass Repair',
    status: 'Resolved',
    sla: 'Complete',
    owner: 'Dispatch East',
    location: 'Newark, NJ',
    customer: 'Summit Tower',
    accountType: 'Commercial',
    priority: 'Low',
    createdAt: 'Yesterday'
  }
];

export const employees: Employee[] = [
  { name: 'Jordan Miles', role: 'Service Lead', department: 'Dispatch', status: 'On Shift', shift: '8:00 AM - 4:00 PM' },
  { name: 'Priya Singh', role: 'Provider Manager', department: 'CRM', status: 'On Shift', shift: '9:00 AM - 5:00 PM' },
  { name: 'Luis Romero', role: 'Billing Specialist', department: 'Finance', status: 'On Shift', shift: '10:00 AM - 6:00 PM' },
  { name: 'Erin Walsh', role: 'Ops Coordinator', department: 'Operations', status: 'On Call', shift: '12:00 PM - 8:00 PM' }
];

export const providers: Provider[] = [
  {
    name: 'Metro Locksmith Co.',
    rating: '4.9',
    specialty: 'Locksmith',
    coverage: 'NYC · Jersey City',
    status: 'Active',
    responseTime: '18 mins',
    jobsCompleted: '128'
  },
  {
    name: 'Clearview Glass',
    rating: '4.7',
    specialty: 'Glass Repair',
    coverage: 'Queens · Brooklyn',
    status: 'Active',
    responseTime: '25 mins',
    jobsCompleted: '96'
  },
  {
    name: 'Rapid Lock & Key',
    rating: '4.6',
    specialty: 'Locksmith',
    coverage: 'Bronx · Manhattan',
    status: 'Paused',
    responseTime: '35 mins',
    jobsCompleted: '78'
  },
  {
    name: 'GlassWorks Partners',
    rating: '4.8',
    specialty: 'Commercial Glass',
    coverage: 'Newark · Hoboken',
    status: 'Active',
    responseTime: '22 mins',
    jobsCompleted: '142'
  }
];

export const invoices: Invoice[] = [
  { code: 'INV-1840', client: 'Summit Tower', amount: '$1,240', status: 'Pending', due: 'May 12', method: 'ACH', sentTo: 'finance@summittower.com' },
  { code: 'INV-1841', client: 'Blue Harbor Dental', amount: '$640', status: 'Paid', due: 'May 03', method: 'Card', sentTo: 'billing@blueharbor.com' },
  { code: 'INV-1842', client: 'Union Market', amount: '$920', status: 'Overdue', due: 'Apr 29', method: 'ACH', sentTo: 'accounts@unionmarket.com' }
];

export const customerTimeline: TimelineItem[] = [
  { time: '08:12', title: 'Request received', note: 'Assigned to routing desk' },
  { time: '09:04', title: 'Provider matched', note: 'Metro Locksmith confirmed' },
  { time: '10:20', title: 'On-site visit', note: 'Technician en route' }
];

export const customerBadges: CustomerBadge[] = [
  { label: 'Certified Techs', detail: 'Background checked & licensed' },
  { label: '4.8/5 Reviews', detail: '1,800+ customer ratings' },
  { label: 'Response SLA', detail: 'Average dispatch in 22 minutes' }
];

export const featuredServices: FeaturedService[] = [
  {
    title: 'Locksmith Services',
    description: 'Emergency lockout support and security upgrades.',
    items: ['Emergency lockout assistance', 'Lock installation & replacement', 'Key duplication & rekeying', 'Commercial & residential services']
  },
  {
    title: 'Glass Repair Services',
    description: 'Restore storefronts, windows, and custom glass quickly.',
    items: ['Window glass replacement', 'Broken glass emergency repair', 'Storefront glass installation', 'Custom glass cutting']
  }
];

export const customerPromotions: PromotionCard[] = [
  { title: 'Priority Dispatch', detail: 'Get a technician in under 45 minutes.', cta: 'Upgrade to priority' },
  { title: 'Business Bundle', detail: 'Monthly service plans for multi-site coverage.', cta: 'View plans' }
];

export const providerTasks: RequestItem[] = [
  {
    id: 'JOB-443',
    title: 'Generator inspection',
    category: 'Compliance',
    status: 'Assigned',
    sla: 'Today 15:00',
    owner: 'Operations South'
  },
  {
    id: 'JOB-444',
    title: 'HVAC filter replacement',
    category: 'Facilities',
    status: 'In Review',
    sla: 'Tomorrow 11:00',
    owner: 'Operations North'
  }
];

export const providerStats: ProviderStat[] = [
  { label: 'Pending jobs', value: '5', detail: '3 new in last hour' },
  { label: 'Acceptance rate', value: '92%', detail: '+3% this month' },
  { label: 'On-time arrival', value: '95%', detail: 'Top 12% network' },
  { label: 'Customer rating', value: '4.8', detail: '126 reviews' }
];

export const providerJobs: ProviderJob[] = [
  {
    id: 'JOB-981',
    title: 'Emergency lockout',
    status: 'Pending',
    location: 'Carroll St, Brooklyn, NY',
    distance: '1.4 mi',
    eta: '30 mins',
    customer: 'Aiden L.'
  },
  {
    id: 'JOB-982',
    title: 'Storefront glass repair',
    status: 'Accepted',
    location: 'Queens Blvd, Queens, NY',
    distance: '3.2 mi',
    eta: '50 mins',
    customer: 'Nora S.'
  },
  {
    id: 'JOB-983',
    title: 'Lock replacement',
    status: 'Completed',
    location: 'Newark Ave, Jersey City, NJ',
    distance: '7.8 mi',
    eta: 'Done',
    customer: 'Hudson Clinic'
  }
];

export const providerNotifications: ProviderNotification[] = [
  { time: '09:12', message: 'New urgent job available 1.4 mi away.' },
  { time: '08:45', message: 'Customer Nora S. confirmed arrival time.' },
  { time: '07:30', message: 'Weekly payout summary is ready.' }
];

export const providerHistory: ProviderHistory[] = [
  { id: 'JOB-961', service: 'Lockout assistance', date: 'Apr 29', rating: '5.0', payout: '$180' },
  { id: 'JOB-962', service: 'Glass repair', date: 'Apr 28', rating: '4.8', payout: '$320' },
  { id: 'JOB-963', service: 'Lock replacement', date: 'Apr 27', rating: '4.9', payout: '$240' }
];

export const adminHighlights: AdminHighlight[] = [
  { title: 'Dispatch backlog', detail: '12 requests awaiting assignment across NY/NJ.' },
  { title: 'Revenue today', detail: '$4,820 collected · 6 invoices pending.' },
  { title: 'Provider coverage', detail: '92% of zones covered within 30 minutes.' }
];

export const regionStats: RegionStat[] = [
  { region: 'Manhattan', volume: '48', sla: '92% on time' },
  { region: 'Brooklyn', volume: '38', sla: '94% on time' },
  { region: 'Queens', volume: '29', sla: '91% on time' },
  { region: 'Newark', volume: '22', sla: '89% on time' }
];

export const serviceCatalog: ServiceCatalogItem[] = [
  { name: 'Emergency Lockout', type: 'Locksmith', responseTarget: '20-45 min', compliance: 'Licensed & insured' },
  { name: 'Storefront Glass Repair', type: 'Glass Repair', responseTarget: 'Same day', compliance: 'Safety glazing' },
  { name: 'Panic Bar Repair', type: 'Commercial Door', responseTarget: 'Same day', compliance: 'NFPA 80 / ADA' },
  { name: 'Door Closer Replacement', type: 'Commercial Door', responseTarget: '24 hours', compliance: 'Fire-rated' }
];

export const reportTemplates: ReportTemplate[] = [
  { name: 'Daily Dispatch Summary', cadence: 'Daily', format: 'CSV / PDF' },
  { name: 'Weekly Revenue Snapshot', cadence: 'Weekly', format: 'Excel' },
  { name: 'Monthly SLA Compliance', cadence: 'Monthly', format: 'PDF' }
];

export const crmCustomers: CustomerAccount[] = [
  {
    name: 'Summit Tower',
    segment: 'Commercial',
    email: 'ops@summittower.com',
    lastRequest: 'Today 10:12 AM',
    status: 'Active',
    lifetimeValue: '$14,820'
  },
  {
    name: 'Blue Harbor Dental',
    segment: 'Healthcare',
    email: 'admin@blueharbor.com',
    lastRequest: 'Yesterday',
    status: 'Active',
    lifetimeValue: '$7,420'
  },
  {
    name: 'Union Market',
    segment: 'Retail',
    email: 'accounts@unionmarket.com',
    lastRequest: 'Apr 28',
    status: 'At Risk',
    lifetimeValue: '$4,380'
  }
];

export const dispatchSteps: DispatchStep[] = [
  { label: 'Request received', status: 'done', timestamp: '10:12 AM' },
  { label: 'Triage complete', status: 'done', timestamp: '10:18 AM' },
  { label: 'Provider assignment', status: 'active', timestamp: '10:26 AM' },
  { label: 'En route', status: 'pending', timestamp: 'Pending' },
  { label: 'Completed', status: 'pending', timestamp: 'Pending' }
];

export const dispatchProviders: ProviderOption[] = [
  { name: 'Metro Locksmith Co.', specialty: 'Locksmith', eta: '18 mins', rating: '4.9', coverage: 'Brooklyn' },
  { name: 'Rapid Lock & Key', specialty: 'Locksmith', eta: '26 mins', rating: '4.6', coverage: 'Manhattan' },
  { name: 'Clearview Glass', specialty: 'Glass Repair', eta: '32 mins', rating: '4.7', coverage: 'Queens' }
];

export const requestActivity: RequestActivity[] = [
  { time: '10:12 AM', title: 'Request submitted', note: 'Customer uploaded photos and access notes.' },
  { time: '10:18 AM', title: 'Triage completed', note: 'Emergency priority confirmed. SLA 2 hours.' },
  { time: '10:26 AM', title: 'Dispatch pending', note: 'Select provider based on proximity and availability.' }
];

export const crmContracts: CrmContract[] = [
  { name: 'Summit Tower Master Service', status: 'Active', renewal: 'Aug 30, 2026', value: '$48,000' },
  { name: 'Emergency Glass Response', status: 'Active', renewal: 'Dec 12, 2026', value: '$22,500' }
];

export const crmSites: CrmSite[] = [
  { name: 'Summit Tower - Lobby', address: '250 W 54th St, New York, NY', manager: 'Lena Brooks', sla: '45 min' },
  { name: 'Summit Tower - Retail', address: '1 Penn Plaza, New York, NY', manager: 'Ivan Ortiz', sla: '60 min' },
  { name: 'Summit Tower - Garage', address: '140 W 33rd St, New York, NY', manager: 'Noah Reed', sla: '90 min' }
];

export const crmContactLog: CrmContactLog[] = [
  { date: 'Apr 30', channel: 'Email', note: 'Sent monthly performance report and SLA summary.' },
  { date: 'Apr 28', channel: 'Call', note: 'Reviewed emergency dispatch escalation process.' },
  { date: 'Apr 22', channel: 'Email', note: 'Added two new sites to contract coverage.' }
];

export const customerServiceCategories: ServiceCategory[] = [
  {
    name: 'Locksmith Services',
    description: 'Emergency and scheduled locksmith support for residential and commercial clients.',
    items: ['Emergency lockouts', 'Lock replacement & rekey', 'Master key systems', 'Access control upgrades']
  },
  {
    name: 'Glass Repair',
    description: 'Fast glass repair and replacement for storefronts, doors, and windows.',
    items: ['Storefront glass repair', 'Board-up service', 'Glass door replacement', 'Tempered glass compliance']
  },
  {
    name: 'Commercial Door Hardware',
    description: 'Door closers, panic bars, and compliance work for commercial properties.',
    items: ['Panic bar repair', 'Door closer replacement', 'Exit device upgrades', 'Fire door inspections']
  }
];

export const customerFaqs: FaqItem[] = [
  {
    question: 'How fast can you dispatch a technician?',
    answer: 'Emergency requests are dispatched within 20-45 minutes depending on location and traffic.'
  },
  {
    question: 'Do you provide documentation for commercial compliance?',
    answer: 'Yes, we provide written reports for inspections and compliance requirements.'
  },
  {
    question: 'Can we manage multiple sites under one account?',
    answer: 'Yes, commercial customers can add multiple sites with tailored SLAs.'
  }
];

export const customerServiceAreas: ServiceArea[] = [
  { region: 'Washington, DC', cities: 'Capitol Hill, Georgetown, Navy Yard, NoMa' },
  { region: 'Northern Virginia', cities: 'Arlington, Alexandria, Fairfax, Tysons' },
  { region: 'Maryland', cities: 'Bethesda, Silver Spring, Rockville, Baltimore' },
  { region: 'New York City', cities: 'Manhattan, Brooklyn, Queens, Bronx' }
];
