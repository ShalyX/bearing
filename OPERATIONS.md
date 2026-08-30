# Operations Plan

## Local

- Keep `.env` untracked.
- Run install, lint, typecheck, tests, and production build.
- Run database migrations explicitly.
- Verify database readback after writes.

## Public deployment

- Deploy from GitHub source of truth.
- Store secrets only in the host dashboard.
- Configure health/readiness endpoint.
- Verify deployment status and public routes.
- Run clean-browser smoke test.

## Incident boundaries

- Pause an agent listing when its live endpoint or evidence becomes invalid.
- Do not replace a blocked live integration with public mock execution.
- Preserve execution logs and transaction evidence.
- Record unresolved blockers in `HANDOFF.md`.

## Release gate

No release is complete until the live URL, database state, agent evidence, test output, and documentation agree.
