# SUREKH AI — construction intelligence workspace

**One Platform. All Solutions. Smarter Construction.**

SUREKH AI is a full-stack TypeScript starter for a construction project workspace, civil-engineering assistance and reliability-aware site-safety workflows. It follows the supplied SUREKH AI product brief and keeps synthetic demo information, rules-based risk estimates and unconfigured AI/CV integrations clearly labelled.

> **Implementation status:** this is a substantial runnable MVP/foundation, not a claim that every item in the 1,588-line master specification is production-complete. The interactive foundation includes authentication, role- and project-scoped APIs, projects and membership, dashboard, safety-event review and human feedback, documents, estimates/BOQ, invoices, daily reports, notifications, interventions, team/admin controls, audit records, research/model registries, global search and an optional OpenAI-compatible assistant provider. Some screens intentionally remain workflow scaffolds until a real provider/model, storage scanning, camera gateway or validated dataset is connected. Details below are explicit to avoid presenting mock outputs as real detections or research results.

## Stack

- **Frontend:** React 18, TypeScript, Vite, React Router, Lucide icons, responsive custom CSS.
- **API:** Node.js, Express, TypeScript, Zod validation, secure HTTP-only JWT cookie sessions, role checks, request rate limiting, Helmet security headers.
- **Data:** SQLite through `better-sqlite3`, schema creation and synthetic demo seeding.
- **Files:** private local upload directory with random filenames, extension and size limits, per-project authorization on download.
- **AI:** provider adapter for an OpenAI-compatible Chat Completions endpoint; demo response mode when not configured. Image/video/house-plan job requests are tracked as blocked until a real worker is installed.
- **Risk baseline:** transparent weighted rules function with uncertainty and explanation reasons. It is illustrative and not empirically validated.

## Run locally

Requires Node.js 20+ (Node 22 LTS recommended) and npm. Internet access is needed for the first dependency install.

```bash
# 1. Unzip this project and open its root directory
cd surekh-ai

# 2. Install dependencies
npm install

# 3. Set local environment values
# Windows PowerShell:
Copy-Item .env.example .env
# macOS/Linux:
# cp .env.example .env

# 4. Start API + Vite together
npm run dev
```

Open **http://localhost:5173**. The API listens on **http://localhost:4000**. The database is created at `server/data/surekh.db`; upload files are stored under `server/storage/uploads/`.

### Demo access

All demo accounts use the development-only password **`Demo@12345`**:

| Role | Email |
|---|---|
| Admin | `admin@surekh.demo` |
| Engineer | `engineer@surekh.demo` |
| Site Supervisor | `supervisor@surekh.demo` |
| Client | `client@surekh.demo` |

All project, event, invoice, camera and report examples seeded into this environment are synthetic. Do not publish the seeded demo credentials or demo database.

### Helpful commands

```bash
npm run dev        # Vite + API hot reload
npm run dev:web    # frontend only
npm run dev:api    # API only
npm run typecheck  # frontend + server TypeScript type checking
npm run build      # typecheck, compile the API, and build the frontend
npm start          # run the compiled production server after npm run build
npm test           # automated risk-baseline unit tests
npm run seed       # seed an empty non-production database with demo records
```

`npm run seed` is intended for a development database. Seed code does not overwrite a populated users table. Back up and treat any database containing real project data as sensitive.


## Docker deployment scaffold

After copying `.env.example` to `.env`, replace `JWT_SECRET`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD` with deployment-specific values. In particular, remove the placeholder values; production startup rejects the bundled password and JWT-secret placeholders and requires a real bootstrap email. Production mode starts with an empty workspace and does **not** insert synthetic demo projects.

```bash
docker compose up --build
```

Then open **http://localhost:4000**. The compose file persists the SQLite database and uploaded files in a named volume. This is a deployment scaffold, not a substitute for TLS termination, secure backups, managed secrets, malware scanning, monitoring, and external security review.

## Main workflows

- **Workspace:** dashboard, search, projects, project workspace and project-member management.
- **Design / files:** Design Hub, plan/document library, file upload/download, approval and visibility metadata.
- **Civil AI:** project-aware prompt UI; uses demo guidance until an optional provider is configured; includes an engineering review disclaimer.
- **Site safety:** synthetic safety event register, event acknowledgement, human feedback, camera inventory/health placeholders, intervention review/outcome and safety/risk module screens.
- **Project controls:** estimate/BOQ items, server-calculated line/tax totals, CSV export, invoices, daily reports and notifications.
- **Organization:** role-aware team/admin surfaces, organization audit records, research experiment and model-version registries, client summary portal.

## What is deliberately not represented as live/validated

| Capability | Current state in this starter | Needed for a real deployment |
|---|---|---|
| CCTV / RTSP / ONVIF | Camera inventory/demo telemetry only | Network-restricted gateway, unique camera credentials, stream health and secure secret store |
| PPE / fall / restricted-zone detection | Workflow and API boundary; no production inference | Licensed/selected detector, reviewed dataset, tracking/zone logic, edge deployment and evaluation |
| Risk prediction / near misses | Transparent baseline and workflow placeholders | Versioned site/time-separated dataset, trained model, baselines, metrics, uncertainty tests and failure review |
| Image / video / floor-plan generation | Jobs explicitly return `BLOCKED_NOT_CONFIGURED` | Provider/worker, storage, moderation/safety review and approval lifecycle |
| AI assistant grounding | Optional compatible Chat Completions endpoint; project metadata only | Retrieval pipeline with per-document/project ACL filters, prompt-injection testing, citations and evaluation |
| Password recovery | Privacy-preserving generic response only | Email provider, signed expiring token flow, revocation and abuse tests |
| Upload malware scan | Extension/size restrictions and private random filenames | Antivirus/sandbox scanning and quarantined upload workflow |
| Excel workbook parsing | XLSX upload as a file and BOQ CSV export | Sandboxed parser, sheet preview/validation and formula handling |
| Client portal | Server-filtered approved documents/reports and assigned project summaries | Full acceptance tests against the real tenant/project permission matrix |
| Production deployment | Docker recipe / baseline hardening guidance | TLS, managed secrets, database backups/restoration drills, durable object storage, monitoring, dependency scans, independent security review |

## Production deployment notes

1. Never deploy demo accounts or development mode. Use the bootstrap administrator environment variables on a clean production database.
2. Configure a long random `JWT_SECRET`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD` (at least 16 characters). Store secrets in the host's secret manager, not in source control.
3. Use HTTPS and a strict `FRONTEND_URL`; cookie `secure` is enabled when `NODE_ENV=production`.
4. Protect the server's database and upload directories with persistent storage and least-privilege filesystem/network access. Back up and test restoration.
5. Configure outbound access controls, file scanning, log retention, monitoring and alerting; the current baseline does not replace an application security review.
6. Never attach production CCTV, personal data or engineering documents without appropriate authorization, retention, consent and security controls.
7. Do not use illustrative risk outputs for real-life safety decisions. A failed camera means **degraded observability**, not that a site is safe.

The original product brief is preserved at [`docs/SUREKH_AI_ULTRA_MASTER_PROMPT.md`](docs/SUREKH_AI_ULTRA_MASTER_PROMPT.md). See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/SECURITY.md`](docs/SECURITY.md), and [`docs/QA.md`](docs/QA.md).
