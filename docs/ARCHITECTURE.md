# SUREKH AI — Architecture Overview

## Product boundary
SUREKH AI is an integrated construction workspace for project delivery, civil-engineering support and human-led safety workflows. This repository is an MVP/foundation, not a claim that all functions in the master specification are production-complete.

## Runtime

```text
Browser (React + TypeScript + Vite)
  └── /api/* (same-origin proxy in development)
        └── Express + Zod API
              ├── Authentication / RBAC / project scope
              ├── SQLite operational database
              ├── Private local uploads (random storage keys)
              ├── Transparent rules-based risk baseline
              └── Optional OpenAI-compatible assistant adapter
```

- Development frontend: `http://localhost:5173`
- Development API: `http://localhost:4000`
- Database default: `server/data/surekh.db`
- Upload root default: `server/storage/uploads/`
- Production build outputs the frontend to `dist/` and compiled API modules to `dist-server/`; the API serves the built frontend when `NODE_ENV=production`.

## Core entities
The SQLite schema covers organizations, users, sessions, projects, project membership, safety events, human feedback, documents, estimates and estimate line items, invoices, daily reports, notifications, interventions, camera inventory, AI requests, experiments, model-version metadata and audit records.

Research datasets and model artifacts are not yet stored or trained in this MVP. Production and research datasets must remain logically separated when those pipelines are implemented.

## Authorization model
For user-facing project resources, authorization follows:

`Identity → Organization → Project membership → Resource → Action`

The cookie session is HTTP-only and signed; the database session row allows logout revocation. Role and organization membership are rechecked on authenticated API requests. Clients receive approved document/report and invoice data only; raw safety events, camera inventory, audit logs and research/AI internals are not exposed through client-facing endpoints.

## AI boundaries
The rules-based risk function is intentionally transparent and illustrative. It is not trained, calibrated or empirically validated. The optional assistant provider has no document retrieval in this build. Image/video/house-plan requests are stored with an explicit `BLOCKED_NOT_CONFIGURED` status until a worker/provider exists. No live RTSP/ONVIF or production detector is included.

## Main user journeys

1. Sign in with an account provisioned by an administrator (development has seeded accounts only).
2. Create/assign projects and review project-scoped workspace records.
3. Upload a document into a private local folder; it starts as a draft and should not be trusted until a malware-scanning integration is installed.
4. Create estimates whose line items, subtotal, tax and total are calculated server-side; export as CSV.
5. Record daily site reports and invoice status.
6. Review safety-event examples and store human feedback. Feedback does not silently retrain any model.
7. Create intervention recommendations and track manually recorded outcomes.
8. Register experiment and model lifecycle metadata without claiming that experiments ran or artifacts were evaluated.

## Production evolution path
- Replace local SQLite and local file storage with a backup-tested managed database and private object storage.
- Add malware scanning/quarantine, MIME/content verification and download policy.
- Add password-reset email delivery, verified invitations, MFA for privileged roles and additional session-management UX.
- Add a secure RTSP/ONVIF gateway, worker queue, frame freshness state, replaceable detector interfaces and robust observation reliability.
- Add ACL-filtered document parsing and retrieval, prompt-injection testing and evidence citations for the assistant.
- Add versioned datasets, annotation flow, temporal risk models, calibrated uncertainty, baselines, ablations and reproducible evaluation.
- Complete threat modeling, dependency scanning, privacy review, backup restoration drills, observability and independent security review before production data is used.
