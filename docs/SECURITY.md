# Security Notes and Threat Model

## Security posture
This code implements a baseline security layer; it is not a security certification and cannot be described as unhackable or production-ready.

## In-scope controls implemented
- Password hashes using bcrypt.
- HTTP-only signed session cookies, eight-hour expiry, same-site cookie policy and database-backed logout revocation.
- Organization and role validation on each authenticated API request.
- Project membership checks for project resources and client-facing filtering for approved resources.
- Least-privilege role gates on safety, research, team, administration and AI-generation endpoints.
- Zod validation for important write payloads.
- Helmet headers, exact-origin credentialed CORS, API rate limits and a stricter login limiter.
- Upload size/extension restrictions, random storage filenames and private storage outside the static web root.
- Financial estimate totals calculated on the server instead of trusting browser totals.
- Audit entries for sign-in and important project/document/safety/finance/research actions.
- Generic password recovery response to prevent account enumeration; email delivery/token reset are not configured.
- Client portal returns approved documents/reports and non-draft invoices only; raw CCTV and audit details are excluded.

## Not yet implemented / required before production
- Independent penetration test and complete route-by-route tenant-isolation tests.
- Email verification, password reset token delivery/rotation and MFA.
- CSRF token strategy if cookie deployment topology or browser assumptions change; test cross-site behavior in the actual environment.
- Malware scanning, sandbox quarantine and content-based file validation.
- SSRF-safe external content fetch, retrieval poisoning defenses and full prompt-injection/RAG tests for a future retrieval system.
- Camera credential vault, network-restricted camera gateway and RTSP/ONVIF protocol hardening.
- Durable object storage, database encryption/backup configuration, restore drills and defined retention policy.
- Structured security telemetry, alerting, secret/dependency scanning and secure release pipeline.
- Full privacy/data-protection assessment for video, worker identifiers and site data.

## Main abuse cases to test
1. User in organization A requests a project, document, invoice, event or camera from organization B.
2. Client requests a draft/internal document, project budget, raw camera inventory, unapproved safety events, audit logs or research records.
3. Non-admin escalates role or suspends the last administrator.
4. Request changes the ID in a nested route or links an event from a different project into an intervention.
5. Upload sends an unsupported extension, oversized file, path-traversal filename or unauthorized project ID.
6. Reused/revoked/expired session token is replayed after logout or account suspension.
7. Financial browser payload submits manipulated amount totals instead of quantities/rates.
8. Prompt includes instructions to exfiltrate project data or to run physical actions autonomously.
9. File names, search queries or audit details attempt SQL injection/XSS.
10. A camera stops sending frames; UI must show degraded observability, never a normal green safety state.

## Safety principle
Safety recommendations are advisory. High-impact physical actions must not be autonomously executed by an unvalidated model. A camera outage is a visibility limitation, not evidence that a site is safe.
