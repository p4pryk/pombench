# Security and private configuration

PomBench serves a static gallery. It does not call model APIs from the browser,
and visitors do not need API keys. Candidate HTML is published as plain text;
the website plays recordings instead of executing model submissions.

Do not commit credentials, inference endpoints, account identifiers, raw provider
responses, private reasoning traces, or private generation archives. An optional
local `.env` is ignored by Git. `.env.example` contains empty variable names only.
Never use `VITE_` for a secret: Vite exposes those variables to the browser bundle.

`npm run check:secrets` checks tracked files for common credential formats,
private inference hosts, Azure resource identifiers, and forbidden private paths.
This is a guardrail, not a guarantee; review changes before publishing them.

Do not post suspected credentials or private payloads in public issues. If you
find a secret in a fork, revoke it before discussing or sharing a reproduction.
Use GitHub's private vulnerability reporting if it is enabled for the repository.
