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
- `published` contains self-contained generated publication layouts. In v2, only `site/` is served;
  `inputs/` retains the exact source set, bundles, and bootstrap data. Never hand-edit it.
- A root deployment accepts only an immutable artifact commit produced from `website/main` and
  published by the b10x bot.
- `.github/workflows/pages.yml` is an Atlas-generated minimal caller pinned to an immutable Website
  reusable workflow. It contains no executable deployment steps; Website owns the verifier runtime.
- Do not add application source, documentation prose, package dependencies, bot credentials, or
  token-minting logic here.

## Gate

Run `bash scripts/gate.sh` for every deployment-control change. Before dispatching deployment, the
pinned Website runtime must verify that the requested immutable commit is the current `published` branch head,
that the supplied control SHA is the exact `main` commit executing the workflow and both the
original and rerun-triggering actor are `b10x-bot[bot]`,
that GitHub and Git metadata attribute authorship to `b10x-bot[bot]` and attribute the committer
either to the bot directly or to a verified two-parent `web-flow` merge authored by the bot, and
that the declared Website commit exists in the ancestry of `beyond10x/website` `main`. The merge
case is admitted only behind the Atlas-verified App-only branch authority; never add an empty
attestation commit to replace it.

The selected publication must resolve as either a retained flat v1 rollback or the exact
`b10x-publication-layout/v2` top-level shape. Its site contains byte-identical canonical
`PROVENANCE.json` and `.well-known/b10x-docs.json` plus exact `._b10x/deployment.json` metadata.
Independently recompute the payload inventory, route inventory, and their digests; require nonempty
rooted routes and agreement for the Website commit, route digest, artifact digest, and all declared
counts. For v2, revalidate the exact sorted catalog source set and every normalized bundle under
`inputs/`; the source-set, Atlas control, bundle, collection, content, and compatibility lock
digests must all agree with provenance. Bootstrap artifacts are not publishable. Artifact file and
route inventories use UTF-8 byte-lexical order, collapse only the exact `index.html` and
`/index.html` route forms, and reject nonportable paths or Git control files.

After deployment, verify `https://beyond10x.github.io/.well-known/b10x-docs.json` and the complete
declared route set through Atlas.

## Delivery

Commits, branch updates, workflow dispatches, Pages settings, and repository mutations are made
with Atlas-owned b10x bot tooling. Never use cached personal GitHub credentials for delivery.
