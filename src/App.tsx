import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowUpRight, Bell, BookOpen, Boxes, BriefcaseBusiness, Building2, CalendarDays,
  Camera, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Command, Compass, CreditCard,
  FileSpreadsheet, FileText, FlaskConical, FolderKanban, Gauge, HardHat, HelpCircle, Home, Image, LayoutDashboard,
  LogOut, Menu, MessageSquareText, PackageCheck, PanelLeftClose, Plus, Search, Settings2, ShieldCheck, Sparkles,
  Users, Video, X,
} from 'lucide-react';
import { api, ApiError } from './api';
import type { User } from './types';
import { initials, LoadingState, InlineNotice, Button } from './components/ui';
import {
  DashboardPage, ProjectsPage, ProjectWorkspacePage, DocumentsPage, EstimatesPage, BillingPage, ReportsPage,
  AssistantPage, StudioPage, SafetyPage, EventsPage, RiskPage, NearMissesPage, InterventionsPage, CamerasPage,
  ClientPortalPage, NotificationsPage, TeamPage, ResearchPage, AuditPage, SettingsPage, DesignHubPage,
} from './pages/WorkspacePages';

type NavItem = { label: string; path: string; icon: typeof Home; roles?: User['role'][]; badge?: string };
type NavGroup = { label: string; items: NavItem[] };
const navGroups: NavGroup[] = [
  { label: 'Workspace', items: [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Design hub', path: '/design', icon: Compass, roles: ['ADMIN', 'ENGINEER', 'SITE_SUPERVISOR'] },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Estimation & BOQ', path: '/estimates', icon: FileSpreadsheet, roles: ['ADMIN', 'ENGINEER'] },
    { label: 'Billing', path: '/billing', icon: CreditCard },
    { label: 'Daily reports', path: '/reports', icon: CalendarDays },
  ] },
  { label: 'AI intelligence', items: [
    { label: 'Civil AI assistant', path: '/assistant', icon: MessageSquareText, roles: ['ADMIN', 'ENGINEER', 'SITE_SUPERVISOR'] },
    { label: 'Image & video studio', path: '/studio', icon: Image, roles: ['ADMIN', 'ENGINEER'] },
    { label: 'Safety vision', path: '/safety', icon: ShieldCheck, roles: ['ADMIN', 'ENGINEER', 'SITE_SUPERVISOR'] },
    { label: 'Safety events', path: '/events', icon: AlertTriangle, roles: ['ADMIN', 'ENGINEER', 'SITE_SUPERVISOR'] },
    { label: 'Risk & forecast', path: '/risk', icon: Activity, roles: ['ADMIN', 'ENGINEER', 'SITE_SUPERVISOR'] },
    { label: 'Near misses', path: '/near-misses', icon: HardHat, roles: ['ADMIN', 'ENGINEER', 'SITE_SUPERVISOR'] },
    { label: 'Interventions', path: '/interventions', icon: ClipboardCheck, roles: ['ADMIN', 'ENGINEER', 'SITE_SUPERVISOR'] },
    { label: 'Camera health', path: '/cameras', icon: Camera, roles: ['ADMIN', 'ENGINEER', 'SITE_SUPERVISOR'] },
  ] },
  { label: 'Organization', items: [
    { label: 'Client portal', path: '/client', icon: Building2, roles: ['CLIENT'] },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Team & access', path: '/team', icon: Users, roles: ['ADMIN', 'ENGINEER'] },
    { label: 'Research console', path: '/research', icon: FlaskConical, roles: ['ADMIN', 'ENGINEER'] },
    { label: 'Security & audit', path: '/audit', icon: ShieldCheck, roles: ['ADMIN'] },
    { label: 'Settings', path: '/settings', icon: Settings2 },
  ] },
];

function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('engineer@surekh.demo');
  const [password, setPassword] = useState('Demo@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    try { const user = await api.post<User>('/auth/login', { email, password }); onLogin(user); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Could not sign in.'); }
    finally { setLoading(false); }
  }
  const demoAccounts = [
    { label: 'Admin', email: 'admin@surekh.demo' }, { label: 'Engineer', email: 'engineer@surekh.demo' },
    { label: 'Supervisor', email: 'supervisor@surekh.demo' }, { label: 'Client', email: 'client@surekh.demo' },
  ];
  return <main className="login-screen"><div className="login-art"><div className="login-brand"><div className="brand-mark"><HardHat size={25} strokeWidth={2.2} /></div><span>SUREKH<span className="brand-ai"> AI</span></span></div><div className="login-art-content"><span className="kicker">CONSTRUCTION INTELLIGENCE</span><h1>Build with<br /><em>confidence.</em></h1><p>One digital workspace for project delivery, civil engineering intelligence and reliability-aware site safety.</p><div className="login-art-stats"><div><strong>01</strong><span>Unified workspace</span></div><div><strong>02</strong><span>Human-led safety</span></div><div><strong>03</strong><span>Evidence-first AI</span></div></div></div><div className="login-art-foot">One Platform. All Solutions. Smarter Construction.</div><div className="blueprint blueprint-one" /><div className="blueprint blueprint-two" /></div><div className="login-panel"><div className="login-panel-inner"><div className="eyebrow">WELCOME BACK</div><h2>Sign in to SUREKH</h2><p className="login-sub">Enter your workspace credentials to continue.</p>{error && <InlineNotice tone="error">{error}</InlineNotice>}<form onSubmit={submit} className="login-form"><label className="form-field"><span>Work email</span><input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" /></label><label className="form-field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" /></label><div className="login-hint"><span><ShieldCheck size={14} /> Secure workspace session</span><span>8-hour session</span></div><Button type="submit" size="lg" className="login-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}<ChevronRight size={17} /></Button></form><div className="demo-box"><div className="demo-title"><span>DEVELOPMENT DEMO</span><span className="demo-indicator" /> Demo data only</div><p>Use a role below. All demo accounts share the password <code>Demo@12345</code>.</p><div className="demo-account-grid">{demoAccounts.map(account => <button key={account.email} onClick={() => { setEmail(account.email); setPassword('Demo@12345'); }} className={email === account.email ? 'demo-account selected' : 'demo-account'}>{account.label}<ArrowUpRight size={13} /></button>)}</div></div><p className="login-legal">Engineering outputs require professional review. Demo events and risk scores are synthetic.</p></div></div></main>;
}

function AppShell({ user, onLogout, children }: { user: User; onLogout: () => void; children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title?: string; name?: string; type: string; subtitle?: string; location?: string }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const roleItems = useMemo(() => navGroups.map(group => ({ ...group, items: group.items.filter(item => !item.roles || item.roles.includes(user.role)) })).filter(group => group.items.length), [user.role]);
  const current = roleItems.flatMap(g => g.items).find(item => item.path === location.pathname) || (location.pathname.startsWith('/projects/') ? { label: 'Project workspace', path: '/projects', icon: FolderKanban } : roleItems[0].items[0]);
  const pageTitle = current.label;
  useEffect(() => { setSidebarOpen(false); setSearchOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (searchText.trim().length < 2) { setSearchResults([]); return; }
    let active = true; setSearchLoading(true);
    const timer = window.setTimeout(() => api.get<typeof searchResults>(`/search?q=${encodeURIComponent(searchText.trim())}`).then(r => { if (active) setSearchResults(r); }).catch(() => { if (active) setSearchResults([]); }).finally(() => { if (active) setSearchLoading(false); }), 240);
    return () => { active = false; window.clearTimeout(timer); };
  }, [searchText]);
  function goResult(result: { id: string; type: string }) {
    setSearchOpen(false); setSearchText('');
    if (result.type === 'PROJECT') navigate(`/projects/${result.id}`);
    else if (result.type === 'DOCUMENT') navigate('/documents');
    else navigate('/events');
  }
  return <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    {sidebarOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><div className="brand-mark"><HardHat size={21} strokeWidth={2.2} /></div>{!sidebarCollapsed && <div className="brand-word">SUREKH<span> AI</span><small>CONSTRUCTION INTELLIGENCE</small></div>}<button className="sidebar-collapse" aria-label="Collapse sidebar" onClick={() => setSidebarCollapsed(v => !v)}>{sidebarCollapsed ? <PanelLeftClose size={17} /> : <ChevronLeft size={17} />}</button></div>
      <div className="org-switch"><div className="org-symbol">S</div>{!sidebarCollapsed && <><div className="org-copy"><strong>Surekh Workspace</strong><small>{user.role.replace('_', ' ')}</small></div><ChevronDown size={14} /></>}</div>
      <nav className="sidebar-nav">{roleItems.map(group => <div key={group.label} className="nav-group"><div className="nav-group-title">{!sidebarCollapsed && group.label}</div>{group.items.map(item => { const Icon = item.icon; const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/')); return <NavLink key={item.path} to={item.path} title={sidebarCollapsed ? item.label : undefined} className={({ isActive }) => `nav-link ${active || isActive ? 'nav-active' : ''}`} end={item.path === '/'}><Icon size={18} strokeWidth={active ? 2.2 : 1.8} /><span>{item.label}</span>{item.badge && <small>{item.badge}</small>}</NavLink>; })}</div>)}</nav>
      {!sidebarCollapsed && <div className="sidebar-bottom-card"><div className="sidebar-bottom-icon"><Sparkles size={17} /></div><strong>Safety intelligence</strong><p>AI suggestions support expert judgement, never replace it.</p><button onClick={() => navigate('/safety')}>Explore safety <ArrowUpRight size={13} /></button></div>}
      <div className="sidebar-footer"><button className="nav-link footer-help" onClick={() => navigate('/settings')} title={sidebarCollapsed ? 'Help & settings' : undefined}><HelpCircle size={17} /><span>Help & settings</span></button><button className="user-card" onClick={() => setProfileOpen(v => !v)}><span className="avatar">{initials(user.name)}</span>{!sidebarCollapsed && <><span className="user-card-copy"><strong>{user.name}</strong><small>{user.email}</small></span><ChevronDown size={14} /></>}</button>{profileOpen && <div className="profile-menu"><div className="profile-menu-title">Signed in as <strong>{user.role.replace('_', ' ')}</strong></div><button onClick={() => { setProfileOpen(false); navigate('/settings'); }}><Settings2 size={15} /> Account settings</button><button onClick={onLogout}><LogOut size={15} /> Sign out</button></div>}</div>
    </aside>
    <div className="main-column"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={13} /><strong>{pageTitle}</strong></div></div><div className="topbar-right"><div className="global-search"><Search size={16} /><input value={searchText} onFocus={() => setSearchOpen(true)} onChange={e => { setSearchText(e.target.value); setSearchOpen(true); }} onKeyDown={e => { if (e.key === 'Enter') setSearchOpen(true); if (e.key === 'Escape') setSearchOpen(false); }} placeholder="Search anything…" aria-label="Search workspace" /><kbd>⌘ K</kbd>{searchOpen && searchText.trim().length >= 2 && <div className="search-dropdown"><div className="search-dropdown-label">{searchLoading ? 'SEARCHING…' : `RESULTS FOR “${searchText.trim()}”`}</div>{searchLoading ? <div className="search-empty">Searching workspace…</div> : searchResults.length ? searchResults.map(result => <button key={`${result.type}-${result.id}`} onClick={() => goResult(result)}><span className="search-type">{result.type === 'PROJECT' ? <FolderKanban size={15} /> : result.type === 'DOCUMENT' ? <FileText size={15} /> : <AlertTriangle size={15} />}</span><span className="search-result-copy"><strong>{result.title || result.name}</strong><small>{result.type} · {result.subtitle || result.location || ''}</small></span><ChevronRight size={14} /></button>) : <div className="search-empty">No matching authorized records.</div>}<button className="search-close" onClick={() => setSearchOpen(false)}>Close results <X size={13} /></button></div>}</div><Link to="/notifications" className="topbar-icon" aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></Link><div className="topbar-divider" /><div className="topbar-date"><span>LOCAL WORKSPACE</span><strong>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</strong></div><button className="topbar-avatar" onClick={() => setProfileOpen(v => !v)} aria-label="Open profile">{initials(user.name)}</button></div></header>
      <main className="page-content">{children}<footer className="page-footer"><span>© 2026 SUREKH AI · Construction intelligence workspace</span><span><span className="footer-status-dot" /> API-bound demo · Data may be synthetic</span></footer></main>
    </div>
  </div>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const location = useLocation();
  useEffect(() => {
    let active = true;
    api.get<User>('/auth/me').then(value => { if (active) setUser(value); }).catch((err: unknown) => {
      if (active && err instanceof ApiError && err.status === 0) setAuthError(err.message);
      if (active && err instanceof ApiError && err.status !== 401 && err.status !== 0) setAuthError(err.message);
    }).finally(() => { if (active) setAuthLoading(false); });
    return () => { active = false; };
  }, []);
  async function signOut() { try { await api.logout(); } finally { setUser(null); } }
  if (authLoading) return <div className="auth-loading"><div className="brand-mark"><HardHat size={24} /></div><LoadingState label="Connecting to SUREKH" /></div>;
  if (!user) return <>{authError && <div className="connection-banner"><AlertTriangle size={16} /> {authError} The login form will work once the API is running.</div>}<LoginScreen onLogin={value => { setAuthError(''); setUser(value); }} /></>;
  return <AppShell user={user} onLogout={signOut}><Routes>
    <Route path="/" element={user.role === 'CLIENT' ? <Navigate to="/client" replace /> : <DashboardPage user={user} />} />
    <Route path="/projects" element={<ProjectsPage user={user} />} />
    <Route path="/projects/:id" element={<ProjectWorkspacePage user={user} />} />
    <Route path="/design" element={<DesignHubPage user={user} />} />
    <Route path="/documents" element={<DocumentsPage user={user} />} />
    <Route path="/estimates" element={<EstimatesPage user={user} />} />
    <Route path="/billing" element={<BillingPage user={user} />} />
    <Route path="/reports" element={<ReportsPage user={user} />} />
    <Route path="/assistant" element={user.role === 'CLIENT' ? <Navigate to="/client" replace /> : <AssistantPage user={user} />} />
    <Route path="/studio" element={user.role === 'ADMIN' || user.role === 'ENGINEER' ? <StudioPage user={user} /> : <Navigate to={user.role === 'CLIENT' ? '/client' : '/'} replace />} />
    <Route path="/safety" element={user.role !== 'CLIENT' ? <SafetyPage user={user} /> : <Navigate to="/client" replace />} />
    <Route path="/events" element={user.role !== 'CLIENT' ? <EventsPage user={user} /> : <Navigate to="/client" replace />} />
    <Route path="/risk" element={user.role !== 'CLIENT' ? <RiskPage user={user} /> : <Navigate to="/client" replace />} />
    <Route path="/near-misses" element={user.role !== 'CLIENT' ? <NearMissesPage user={user} /> : <Navigate to="/client" replace />} />
    <Route path="/interventions" element={user.role !== 'CLIENT' ? <InterventionsPage user={user} /> : <Navigate to="/client" replace />} />
    <Route path="/cameras" element={user.role !== 'CLIENT' ? <CamerasPage user={user} /> : <Navigate to="/client" replace />} />
    <Route path="/client" element={user.role === 'CLIENT' ? <ClientPortalPage user={user} /> : <Navigate to="/" replace />} />
    <Route path="/notifications" element={<NotificationsPage user={user} />} />
    <Route path="/team" element={user.role === 'ADMIN' || user.role === 'ENGINEER' ? <TeamPage user={user} /> : <Navigate to="/" replace />} />
    <Route path="/research" element={user.role === 'ADMIN' || user.role === 'ENGINEER' ? <ResearchPage user={user} /> : <Navigate to="/" replace />} />
    <Route path="/audit" element={user.role === 'ADMIN' ? <AuditPage user={user} /> : <Navigate to="/" replace />} />
    <Route path="/settings" element={<SettingsPage user={user} />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AppShell>;
}
