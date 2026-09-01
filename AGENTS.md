# AGENTS.md — beyond10x.github.io

This public repository is the deployment boundary for `https://beyond10x.github.io/`.
Organization-wide policy and publication credentials remain in private Atlas.

## Serves

- **O5 — the generic agent platform.** Deliver the unified public website at the organization root.
- **O2 — decisions as data, with evidence.** Publish a deterministic artifact with source and route provenance.

## Boundary

- Authored website content, source ingestion, components, and presentation live in
  `beyond10x/website`.
- `main` contains only deployment controls and this repository's operating documentation.
- `published` contains generated static artifacts and `PROVENANCE.json`; never hand-edit it.
- A root deployment accepts only an immutable artifact commit produced from `website/main` and
  published by the b10x bot.
- Do not add application source, documentation prose, package dependencies, bot credentials, or
  token-minting logic here.

## Gate

Before dispatching deployment, verify that the selected artifact commit contains valid
`PROVENANCE.json` and `._b10x/deployment.json`, and that their artifact and route-map digests agree.
After deployment, verify `https://beyond10x.github.io/.well-known/b10x-docs.json` and the complete
declared route set through Atlas.

## Delivery

Commits, branch updates, workflow dispatches, Pages settings, and repository mutations are made
with Atlas-owned b10x bot tooling. Never use cached personal GitHub credentials for delivery.
