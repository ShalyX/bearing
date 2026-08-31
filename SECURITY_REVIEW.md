# Security & Mobile Review

Review date: 2026-08-31

## Completed checks

- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- No tracked environment files, wallet keystores, private keys, or secret assignments.
- Public smoke suite passed against `https://bearing-fawn.vercel.app` (`/api/health`, `/api/ready`, `/marketplace`, and an agent profile).
- Security headers include frame denial, MIME sniffing protection, strict referrer policy, restrictive permissions, HSTS, and cross-domain policy denial.
- Job creation now accepts only known marketplace agents and redirects use the request origin instead of forwarded host headers.
- Payment settlement is rate-limited, RPC calls time out, and a receipt must come from the job’s recorded wallet, target the fixed recipient, use the fixed testnet amount, and be confirmed on BNB testnet.
- Mobile layout keeps marketplace navigation available, stacks cards and panels below 780px, honors safe-area insets, prevents wallet-input overflow, preserves visible focus rings, and declares the dark theme color.

## Residual risks before any write path or mainnet use

- Job IDs currently act as bearer capabilities; state-transition endpoints have no account authentication or CSRF token. Keep the write path disabled until an authenticated session or short-lived capability token is added.
- The rate limiter is process-local and therefore not a global abuse control across Vercel instances. Use a shared limiter before opening paid or write-capable traffic.
- Payment is deliberately fixed to BNB Smart Chain Testnet tBNB and does not authorize a wallet write from the server.

## Verdict

The public read-only hackathon build passes the baseline review. Mainnet writes remain blocked.
