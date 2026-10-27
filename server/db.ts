import 'dotenv/config';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const configuredPath = process.env.DATABASE_PATH || './server/data/surekh.db';
const databasePath = configuredPath === ':memory:' ? configuredPath : resolve(process.cwd(), configuredPath);
if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

const schema = `
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, organization_id TEXT NOT NULL REFERENCES organizations(id),
  created_at TEXT NOT NULL, expires_at TEXT NOT NULL, revoked_at TEXT
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('ADMIN','ENGINEER','SITE_SUPERVISOR','CLIENT')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INVITED','SUSPENDED')),
  created_at TEXT NOT NULL, last_login_at TEXT
);
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL, client_name TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PLANNING', progress INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
  budget REAL NOT NULL DEFAULT 0 CHECK(budget >= 0), start_date TEXT, end_date TEXT,
  description TEXT NOT NULL DEFAULT '', created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS project_members (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'MEMBER', created_at TEXT NOT NULL, PRIMARY KEY(project_id,user_id)
);
CREATE TABLE IF NOT EXISTS safety_events (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), project_id TEXT NOT NULL REFERENCES projects(id),
  event_type TEXT NOT NULL, title TEXT NOT NULL, location TEXT NOT NULL DEFAULT '', severity TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'OPEN', occurred_at TEXT NOT NULL, reliability INTEGER NOT NULL DEFAULT 0,
  risk_score INTEGER NOT NULL DEFAULT 0, evidence_note TEXT NOT NULL DEFAULT '', acknowledged_by TEXT, acknowledged_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS human_feedback (
  id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES safety_events(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES users(id), label TEXT NOT NULL, comments TEXT NOT NULL DEFAULT '', original_output TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), project_id TEXT NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'DOCUMENT', version INTEGER NOT NULL DEFAULT 1,
  visibility TEXT NOT NULL DEFAULT 'INTERNAL', status TEXT NOT NULL DEFAULT 'DRAFT', storage_name TEXT,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream', size_bytes INTEGER NOT NULL DEFAULT 0,
  uploaded_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS estimates (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'DRAFT', tax_rate REAL NOT NULL DEFAULT 0.18,
  subtotal REAL NOT NULL DEFAULT 0, tax_amount REAL NOT NULL DEFAULT 0, total REAL NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS estimate_items (
  id TEXT PRIMARY KEY, estimate_id TEXT NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  description TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'MATERIAL', unit TEXT NOT NULL DEFAULT 'unit', quantity REAL NOT NULL CHECK(quantity>=0), rate REAL NOT NULL CHECK(rate>=0), amount REAL NOT NULL CHECK(amount>=0)
);
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), project_id TEXT NOT NULL REFERENCES projects(id),
  invoice_number TEXT NOT NULL, client_name TEXT NOT NULL, amount REAL NOT NULL CHECK(amount>=0), status TEXT NOT NULL DEFAULT 'DRAFT',
  due_date TEXT, description TEXT NOT NULL DEFAULT '', created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS daily_reports (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL, report_date TEXT NOT NULL, weather TEXT NOT NULL DEFAULT 'Not recorded', workers INTEGER NOT NULL DEFAULT 0,
  completed_work TEXT NOT NULL DEFAULT '', blockers TEXT NOT NULL DEFAULT '', safety_notes TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'DRAFT',
  created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), user_id TEXT REFERENCES users(id),
  project_id TEXT REFERENCES projects(id), title TEXT NOT NULL, message TEXT NOT NULL, severity TEXT NOT NULL DEFAULT 'INFO',
  read_at TEXT, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS interventions (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), project_id TEXT NOT NULL REFERENCES projects(id),
  event_id TEXT REFERENCES safety_events(id), title TEXT NOT NULL, recommendation TEXT NOT NULL, priority TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'PROPOSED', owner_id TEXT REFERENCES users(id), risk_before INTEGER, risk_after INTEGER,
  outcome_note TEXT NOT NULL DEFAULT '', created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cameras (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), project_id TEXT NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL, zone TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'UNKNOWN', reliability INTEGER NOT NULL DEFAULT 0,
  last_frame_at TEXT, health_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ai_requests (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), project_id TEXT REFERENCES projects(id),
  requested_by TEXT NOT NULL REFERENCES users(id), request_type TEXT NOT NULL, status TEXT NOT NULL,
  input_summary TEXT NOT NULL, output_summary TEXT NOT NULL DEFAULT '', provider TEXT NOT NULL DEFAULT 'demo', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), name TEXT NOT NULL, hypothesis TEXT NOT NULL DEFAULT '',
  dataset_version TEXT NOT NULL DEFAULT 'not-set', baseline TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'PLANNED',
  metrics_json TEXT NOT NULL DEFAULT '{}', created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS model_versions (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), name TEXT NOT NULL, version TEXT NOT NULL,
  lifecycle TEXT NOT NULL DEFAULT 'EXPERIMENTAL', metrics_json TEXT NOT NULL DEFAULT '{}', notes TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), actor_id TEXT REFERENCES users(id),
  action TEXT NOT NULL, resource_type TEXT NOT NULL, resource_id TEXT NOT NULL DEFAULT '', details_json TEXT NOT NULL DEFAULT '{}',
  ip_address TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_project_date ON safety_events(project_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_docs_project ON documents(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_org_date ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_user ON project_members(user_id);
`;
db.exec(schema);

const now = () => new Date().toISOString();
const id = () => randomUUID();
const isProduction = process.env.NODE_ENV === 'production';

function seedIfEmpty() {
  const userCount = (db.prepare('SELECT COUNT(*) as n FROM users').get() as { n: number }).n;
  if (userCount > 0) return;

  // Validate production bootstrap settings BEFORE writing any rows, so a bad
  // deployment does not leave an orphan organization that complicates retry.
  const configuredAdminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@surekh.local').trim().toLowerCase();
  const configuredAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (isProduction) {
    if (!configuredAdminPassword || configuredAdminPassword.length < 16 || configuredAdminPassword === 'ChangeThis-Admin-Password-2026!') {
      throw new Error('Set a unique INITIAL_ADMIN_PASSWORD (16+ chars) before starting against an empty production database.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredAdminEmail) || configuredAdminEmail.endsWith('.local')) {
      throw new Error('Set a real INITIAL_ADMIN_EMAIL before starting against an empty production database.');
    }
  }

  const organizationId = id();
  db.prepare('INSERT INTO organizations(id,name,created_at) VALUES(?,?,?)').run(organizationId, isProduction ? 'SUREKH AI Organization' : 'Surekh Demo Organization', now());
  const accounts = isProduction
    ? [{ name: 'Organization Administrator', email: configuredAdminEmail, role: 'ADMIN' as const, password: configuredAdminPassword! }]
    : [
        { name: 'Aarav Deshmukh', email: 'admin@surekh.demo', role: 'ADMIN' as const, password: 'Demo@12345' },
        { name: 'Isha Kulkarni', email: 'engineer@surekh.demo', role: 'ENGINEER' as const, password: 'Demo@12345' },
        { name: 'Rohan Patil', email: 'supervisor@surekh.demo', role: 'SITE_SUPERVISOR' as const, password: 'Demo@12345' },
        { name: 'Ananya Shah', email: 'client@surekh.demo', role: 'CLIENT' as const, password: 'Demo@12345' },
      ];
  const userIds: Record<string, string> = {};
  const insertUser = db.prepare('INSERT INTO users(id,organization_id,name,email,password_hash,role,status,created_at) VALUES(?,?,?,?,?,?,?,?)');
  for (const account of accounts) {
    const userId = id(); userIds[account.role] = userId;
    insertUser.run(userId, organizationId, account.name, account.email.toLowerCase(), bcrypt.hashSync(account.password, 12), account.role, 'ACTIVE', now());
  }

  // Production starts with only its administrator and an empty workspace.
  // Synthetic projects and demo safety/finance records are strictly dev-only.
  if (isProduction) {
    db.prepare('INSERT INTO audit_logs(id,organization_id,actor_id,action,resource_type,resource_id,details_json,ip_address,created_at) VALUES(?,?,?,?,?,?,?,?,?)')
      .run(id(), organizationId, userIds.ADMIN, 'PRODUCTION_BOOTSTRAP', 'organization', organizationId, JSON.stringify({ synthetic: false }), '', now());
    return;
  }

  const engineerId = userIds.ENGINEER || userIds.ADMIN;
  const supervisorId = userIds.SITE_SUPERVISOR || userIds.ADMIN;
  const clientId = userIds.CLIENT || userIds.ADMIN;

  const projects = [
    { id: id(), name: 'Modern Residential Building', client: 'Mehta Family', location: 'Baner, Pune', status: 'IN_PROGRESS', progress: 68, budget: 3500000, start: '2026-04-01', end: '2027-02-15', description: '30 × 40 ft plot, G+1 residential build. Demo record only.' },
    { id: id(), name: 'Commercial Office Fit-out', client: 'Northstar Works', location: 'Hinjawadi, Pune', status: 'IN_PROGRESS', progress: 42, budget: 7200000, start: '2026-06-15', end: '2027-04-30', description: 'Interior and services coordination. Demo record only.' },
    { id: id(), name: 'Community Clinic Extension', client: 'Sahyadri Trust', location: 'Kolhapur, Maharashtra', status: 'PLANNING', progress: 12, budget: 4850000, start: '2026-11-10', end: '2027-08-01', description: 'Concept planning and estimation. Demo record only.' },
  ];
  const insertProject = db.prepare('INSERT INTO projects(id,organization_id,name,client_name,location,status,progress,budget,start_date,end_date,description,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  for (const project of projects) {
    insertProject.run(project.id, organizationId, project.name, project.client, project.location, project.status, project.progress, project.budget, project.start, project.end, project.description, userIds.ADMIN, now(), now());
    for (const userId of [...new Set([userIds.ADMIN, engineerId, supervisorId, clientId])]) {
      db.prepare('INSERT OR IGNORE INTO project_members(project_id,user_id,access_level,created_at) VALUES(?,?,?,?)').run(project.id, userId, userId === clientId ? 'CLIENT_VIEW' : 'MEMBER', now());
    }
  }
  const [p1, p2] = projects;
  const events = [
    { project: p1.id, type: 'PPE', title: 'Helmet compliance needs review', location: 'Level 1 · North access', severity: 'HIGH', status: 'OPEN', reliability: 82, risk: 67, note: 'Synthetic example; no real image evidence attached.', occurred: '2026-10-27T08:42:00.000Z' },
    { project: p1.id, type: 'RESTRICTED_ZONE', title: 'Restricted-zone exposure reported', location: 'Lift shaft · Grid B4', severity: 'CRITICAL', status: 'ACKNOWLEDGED', reliability: 74, risk: 84, note: 'Synthetic example; validate with on-site supervisor.', occurred: '2026-10-27T07:56:00.000Z' },
    { project: p2.id, type: 'PROXIMITY', title: 'Worker–equipment proximity review', location: 'Loading bay', severity: 'MEDIUM', status: 'OPEN', reliability: 69, risk: 49, note: 'Synthetic example; camera observability may be degraded.', occurred: '2026-10-26T16:22:00.000Z' },
    { project: p2.id, type: 'NEAR_MISS', title: 'Near-miss record awaiting triage', location: 'Material storage aisle', severity: 'HIGH', status: 'OPEN', reliability: 77, risk: 71, note: 'Synthetic record; not a validated live detection.', occurred: '2026-10-26T13:05:00.000Z' },
  ];
  const insertEvent = db.prepare('INSERT INTO safety_events(id,organization_id,project_id,event_type,title,location,severity,status,occurred_at,reliability,risk_score,evidence_note,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)');
  events.forEach(e => insertEvent.run(id(), organizationId, e.project, e.type, e.title, e.location, e.severity, e.status, e.occurred, e.reliability, e.risk, e.note, now()));

  const insertCamera = db.prepare('INSERT INTO cameras(id,organization_id,project_id,name,zone,status,reliability,last_frame_at,health_note,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)');
  [
    { project: p1.id, name: 'Camera 01 · Main gate', zone: 'Entry / Exit', status: 'DEGRADED', reliability: 61, note: 'Demo telemetry only. Stream gateway not configured.' },
    { project: p1.id, name: 'Camera 02 · Ground floor', zone: 'Work area A', status: 'OFFLINE', reliability: 0, note: 'Camera offline in demo data; observability is degraded, not safe.' },
    { project: p2.id, name: 'Camera 03 · Loading bay', zone: 'Equipment zone', status: 'UNKNOWN', reliability: 0, note: 'No live stream configured.' },
  ].forEach(c => insertCamera.run(id(), organizationId, c.project, c.name, c.zone, c.status, c.reliability, null, c.note, now()));

  const insertDocument = db.prepare('INSERT INTO documents(id,organization_id,project_id,name,category,version,visibility,status,storage_name,mime_type,size_bytes,uploaded_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  [
    { project: p1.id, name: 'Architectural concept plan.pdf', category: 'PLAN', visibility: 'CLIENT_APPROVED', status: 'APPROVED', user: engineerId },
    { project: p1.id, name: 'Structural review checklist.docx', category: 'CHECKLIST', visibility: 'INTERNAL', status: 'IN_REVIEW', user: userIds.ADMIN },
    { project: p2.id, name: 'Office fit-out BOQ.xlsx', category: 'BOQ', visibility: 'INTERNAL', status: 'DRAFT', user: engineerId },
  ].forEach(d => insertDocument.run(id(), organizationId, d.project, d.name, d.category, 1, d.visibility, d.status, null, 'application/octet-stream', 0, d.user, now(), now()));

  const insertInvoice = db.prepare('INSERT INTO invoices(id,organization_id,project_id,invoice_number,client_name,amount,status,due_date,description,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  [
    { project: p1.id, number: 'SRK-2026-001', client: 'Mehta Family', amount: 485000, status: 'SENT', due: '2026-11-05', description: 'Milestone 4 · Slab and masonry' },
    { project: p2.id, number: 'SRK-2026-002', client: 'Northstar Works', amount: 820000, status: 'PARTIALLY_PAID', due: '2026-10-30', description: 'Services coordination milestone' },
  ].forEach(i => insertInvoice.run(id(), organizationId, i.project, i.number, i.client, i.amount, i.status, i.due, i.description, engineerId, now()));

  const insertReport = db.prepare('INSERT INTO daily_reports(id,organization_id,project_id,title,report_date,weather,workers,completed_work,blockers,safety_notes,status,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  insertReport.run(id(), organizationId, p1.id, 'Daily site update · Residential', '2026-10-27', 'Clear, 29°C (demo)', 18, 'First-floor masonry and conduit routing progressed.', 'Material delivery confirmation pending.', 'Supervisor toolbox talk recorded; PPE review remains open.', 'SUBMITTED', supervisorId, now(), now());

  const insertNotification = db.prepare('INSERT INTO notifications(id,organization_id,user_id,project_id,title,message,severity,created_at) VALUES(?,?,?,?,?,?,?,?)');
  insertNotification.run(id(), organizationId, null, p1.id, 'Safety event needs acknowledgement', 'A high-priority synthetic event is awaiting review.', 'HIGH', now());
  insertNotification.run(id(), organizationId, engineerId, p1.id, 'Document review requested', 'Structural review checklist is waiting for approval.', 'INFO', now());

  
const insertIntervention = db.prepare('INSERT INTO interventions(id,organization_id,project_id,event_id,title,recommendation,priority,status,owner_id,risk_before,risk_after,outcome_note,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

  
const eCritical = db.prepare("SELECT id FROM safety_events WHERE project_id=? AND severity='CRITICAL' LIMIT 1").get(p1.id) as { id:string } | undefined;

  insertIntervention.run(id(), organizationId, p1.id, eCritical?.id || null, 'Verify lift-shaft exclusion controls', 'Ask the supervisor to verify barriers, signage and access control; document evidence before closing the event.', 'URGENT', 'PROPOSED', supervisorId, 84, null, '', userIds.ADMIN, now(), now());

  const insertExperiment = db.prepare('INSERT INTO experiments(id,organization_id,name,hypothesis,dataset_version,baseline,status,metrics_json,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  insertExperiment.run(id(), organizationId, 'Reliability signal ablation (template)', 'Assess whether image-quality and camera-health signals improve risk calibration.', 'not-measured', 'B4 Multi-Signal Risk', 'PLANNED', '{}', userIds.ADMIN, now(), now());

  db.prepare('INSERT INTO audit_logs(id,organization_id,actor_id,action,resource_type,resource_id,details_json,ip_address,created_at) VALUES(?,?,?,?,?,?,?,?,?)')
    .run(id(), organizationId, userIds.ADMIN, 'DEMO_SEED_CREATED', 'organization', organizationId, JSON.stringify({ synthetic: true }), '127.0.0.1', now());
}

seedIfEmpty();

export type Role = 'ADMIN' | 'ENGINEER' | 'SITE_SUPERVISOR' | 'CLIENT';
export type SessionUser = { id: string; organizationId: string; name: string; email: string; role: Role };
export const getUserById = (userId: string) => db.prepare('SELECT id, organization_id as organizationId, name, email, role, status FROM users WHERE id=?').get(userId) as (SessionUser & { status: string }) | undefined;
export const getUserAccess = (userId: string, projectId: string) => db.prepare('SELECT p.id, p.organization_id FROM projects p JOIN project_members pm ON pm.project_id=p.id WHERE p.id=? AND pm.user_id=?').get(projectId, userId) as { id: string; organization_id: string } | undefined;
export const createId = id;
export const timestamp = now;
