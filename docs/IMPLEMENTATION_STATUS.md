# SUREKH AI implementation status

This repository is an MVP foundation intended for local development, demonstrations and staged engineering. It is not certified or production-ready.

## Implemented in the current source

- React/TypeScript responsive workspace, responsive navigation and role-specific screens.
- Express/TypeScript API; SQLite schema and synthetic demo data.
- Password hashing, HTTP-only signed session cookies, persisted session expiry/revocation, login/logout and role middleware.
- Organization scoping and project-membership checks on major record APIs.
- Project/workspace management, project membership, document metadata/upload/download/approval, estimates/BOQ totals and CSV export, invoices, daily reports, notifications and intervention outcomes.
- Safety event review and human feedback capture; baseline risk calculation with reasons and uncertainty display.
- Client view filtered to assigned project, approved documents and reports, and client-visible invoice states; client endpoints do not return raw CCTV/event data or audit logs.
- Team administration, minimum-active-admin guard, research experiment/model metadata, global search and audit trail.
- Explicit placeholders for unavailable AI/CV capabilities instead of fabricated live inference or research measurements.
- Docker recipe, environment template and security/QA/architecture notes.

## Not implemented as real integrations

- Production RTSP/ONVIF gateway, PPE/fall/restricted-zone detector, tracking, camera-health service, or live alerts.
- Trained/validated predictive-risk and near-miss models; current risk calculation is a transparent illustrative baseline only.
- Asynchronous image/video/floor-plan generation workers and storage lifecycle.
- RAG ingestion, document chunking, embedding/vector storage, ACL-aware retrieval, source citations and prompt-injection evaluation.
- Email delivery and real password reset token flow; MFA; security monitoring/alerting; malware scanner/quarantine; sandboxed XLSX parser.
- Production deployment controls such as managed secrets, HTTPS termination, database backups/restoration verification, durable object storage and independent penetration testing.

## Validation record for this bundle

- TypeScript files passed a compiler transpilation/syntax pass (13 source files).
- SQLite schema smoke test created all 19 tables in an in-memory database; 22 static SELECT statements passed a query-preparation smoke test.
- The four risk-baseline test cases passed when the actual risk source and tests were transpiled to an isolated ESM harness and run with Node’s test runner.
- Dependency installation, full project type checking, Vite production build and the package-script `npm test` could not be executed in the authoring environment because the npm registry was unreachable (`EAI_AGAIN registry.npmjs.org`).
- This is a disclosed environment limitation, not evidence that the complete build or all tests pass. After installing dependencies in a network-enabled environment, run `npm run typecheck`, `npm test`, and `npm run build`; fix any issues before deployment.
