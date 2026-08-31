# Shared Renovate policy

This public repository contains no secrets. It centralizes dependency-update behavior for Dan Cumberland's private Astro and Strapi repositories while they remain on GitHub Free.

## Presets

- `default.json` — conservative scheduling, release-age checks, immediate security PRs, and human review by default.
- `astro.json` — adds CI-gated patch automerge for Dan-owned Astro sites. Renovate performs the merge itself because private GitHub Free repositories do not have native auto-merge or protected status checks.
- `strapi.json` — groups the Strapi framework and plugins and always requires a human merge.

Client-owned repositories use `default.json`; they never inherit patch automerge.

## Safety model

Renovate waits for repository checks and its stability check to pass. `platformAutomerge` remains disabled so GitHub cannot merge before CI registers. Security fixes skip the ordinary release delay but still require human review.

Run both validators before changing policy:

```bash
node scripts/validate-policy.mjs
npx --yes --package renovate@44.52.1 renovate-config-validator default.json astro.json strapi.json
```

The Renovate validator requires Node.js 24.11 or newer.
