# Contributing to PomBench

Start with an issue describing the change. For interface improvements, include
screenshots at desktop and mobile widths and keep the website in English.

Run `npm test`, `npm run build`, `npm run test:browser`, `npm run check:build`,
and `npm run check:secrets` before submitting a pull request. Install Chromium
with `npx playwright install chromium` if needed.

Recorded model submissions are evidence. Do not edit their source, redraw their
frames, invent token usage, or substitute a different response because it looks
better. Prompt and source hashes must remain valid. New results must come from
actual API responses and independently recorded browser frames. Keep generation
infrastructure and private audit records outside this public repository.

Changes to prices and release dates need an official source. Preserve uncertainty
when a provider did not return terminal usage; missing cost is never zero cost.

Use short English Conventional Commit subjects, such as
`fix(player): keep compared animations synchronized`.
