# QA Plan and Current Validation

## Commands
Run in an environment with npm registry access:

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Risk baseline tests
`tests/risk.test.ts` covers score bounds, expected deterministic output, reliability calculation and explanation behavior. These tests validate only the transparent heuristic implementation; they do not validate construction safety or predictive performance.

## Required acceptance matrix before production

| Area | Positive path | Adversarial / failure path |
|---|---|---|
| Auth | login, current session, logout | invalid credentials, expired/revoked token, suspended user, login rate limit |
| Tenant & projects | assigned project read/write | cross-organization IDs, unassigned project, unknown resource IDs |
| Roles | permitted action by correct role | client/internal resource access, role escalation, last-admin suspension |
| Documents | authorized upload/review/download | wrong project ID, oversize, unsupported type, malware, path traversal |
| Estimation | server calculates line/tax/total | tampered browser total, negative/huge numbers, malformed rows |
| Safety | acknowledge/review/feedback | client request, wrong event ID, wrong project, invalid status/severity |
| Interventions | approve/action/outcome tracking | cross-project event linkage, unauthorized physical side effects |
| AI | demo/provider success or handled provider failure | prompt injection, retrieved-data instruction override, data exfiltration, tool abuse |
| Client portal | approved documents/reports/non-draft invoices | internal docs, draft invoices, raw CCTV/events/audit logs |
| Research | register hypotheses/model metadata | falsely claim a result without dataset, run artifacts and metrics |
| Operations | health, logs, backup/restore | stream loss, stale frames, missing provider, storage unavailable |

## Environment validation note
The build authoring environment currently has no npm registry DNS access, so package installation and a real Vite/server dependency-backed build could not be run here. TypeScript source was syntax-transpiled with the globally available TypeScript compiler, but that is not a substitute for dependency-backed type checking, unit tests or an end-to-end run. Do not mark release gates as passed until those commands run successfully in a network-enabled development environment.
