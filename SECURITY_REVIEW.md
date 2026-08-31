# Security & Mobile Review

Review date: 2026-08-31

## Completed checks

- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- No tracked environment files, wallet keystores, private keys, or secret assignments.
- Public smoke suite passed against `https://bearing-fawn.vercel.app` (`/api/health`, `/api/ready`, `/marketplace`, and an agent profile).
- Security headers include frame denial, MIME sniffing protection, strict referrer policy, restrictive permissions, HSTS, and cross-domain policy denial.
- Job creation now accepts only known marketplace agents and redirects use the request origin instead of forwarded host headers.
- Payment settlement is rate-limited, RPC calls time out, and a receipt must come from the job’s recorded wallet, target the fixed recipient, use the fixed testnet amount, and be confirmed on BNB testnet.
- Job state mutations require a 24-hour capability token issued at job creation. Browser form requests must also have a same-origin Origin/Referer; API clients can present the token as `Authorization: Bearer`.
- PostgreSQL migrations add capability columns and shared `rate_limit_buckets`; the production migration has been applied.
- Mobile layout keeps marketplace navigation available, stacks cards and panels below 780px, honors safe-area insets, prevents wallet-input overflow, preserves visible focus rings, and declares the dark theme color.

## Residual risks before any write path or mainnet use

- There is still no user account system, so the short-lived capability remains a bearer credential and must be kept private. A full account/session layer is still required before mainnet custody.
- Rate-limit buckets are stored in PostgreSQL and shared across Vercel instances. If the database is unavailable, the code falls back to a process-local limiter to preserve availability; paid/write traffic should remain closed during that condition.
- Payment is deliberately fixed to BNB Smart Chain Testnet tBNB and does not authorize a wallet write from the server.

## Verdict

The public read-only hackathon build passes the baseline review. Mainnet writes remain blocked.
