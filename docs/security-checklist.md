# Security Checklist

## Implemented

- [x] API keys are hashed before storage
- [x] API key prefix lookup narrows the search space
- [x] Constant-time comparison is used for API key verification
- [x] Transactions are validated against the authenticated agent public key
- [x] Memo length is capped at 28 bytes
- [x] Fee calculation uses stroops and integer math
- [x] Sponsor secret stays server-side
- [x] Database-backed operations are kept on the server
- [x] Dashboard pages that query Prisma are server-rendered dynamically

## Operational checks

- [ ] Rotate `SPONSOR_SECRET_KEY` and `API_KEY_PEPPER` on a schedule
- [ ] Store production secrets in a managed secret store
- [ ] Add rate limiting to public registration and onboarding endpoints
- [ ] Add alerts for repeated failed submissions
- [ ] Review logs for secret leakage before every release
