# Changelog

Notable changes to Agentic Principles are recorded here.

## [Unreleased]

### Changed

- Mark the Atlas-derived historical seed as privately sourced, preserve its exact source locators
  without broken public links, withhold it from unified publication pending public evidence, and
  remove analytics parameters from the standards seed's source links. Point the workflow-fit note's
  historical source links at the public AEP repository while retaining their exact commit.
- Point planning at the canonical AEP repository and command, and move adopter-owned JSON Schema
  validation and TypeScript projection to the extracted ESS 0.2.1 tooling.

### Added

- A principle transfer-package contract at `.engineering/schemas/principle-transfer-package.schema.json`
  and its first instance, `docs/transfer-packages/AP-011.json`, carrying the claim as a verbatim
  quotation of its study, two graded confidence axes, ten evidence and seven counterevidence
  citations, caveats, falsifier, behavior, evaluation, effects, rollout, and return path. Maturity is
  not restated there: it stays sourced from `docs/principles.json`, which is unchanged.
- A projector, `tools/project_harness_context.py`, that renders a gated principle into one context
  document an operator passes with `harness --context <file>`. A principle reaches a run only at
  maturity `candidate` or above and only while carrying a valid transfer package; the bar is a module
  constant with no command-line override, so a seed has no code path to a document. Its `--verify`
  suite proves each refusal fires against planted fixtures, and the Pages workflow runs it on every
  pull request alongside schema validation of the new sidecars.
- Documentation of where a transfer package lives, which principles may reach a run, the per-turn cost
  of the projected context layer, and the sha256 correlation key that ties a product result back to
  the research run that produced it — answering the `harness`/`metaharness` open question in
  `specification:research-workflow`.
- A Field notes blog at `/blog`, for short evidence-first write-ups that are narrower than a full
  research note.
- First field note: a transcript study of 1,567 human turns across 100 coding-agent sessions,
  measuring how much of the human's contribution carries information and how much carries only
  permission.

## [v0.1.1] - 2026-08-25

### Changed

- Added a reader-first research landing page that explains the project, current evidence posture,
  maturity labels, and paths from claims to their supporting work.
- Replaced timestamp-derived navigation labels with curated study and evidence titles.
- Reworked the home page and principle catalog in plain language, surfaced the strongest current
  result first, and made each card’s research source explicit.
- Improved responsive readability, focus visibility, and the catalog’s lifecycle explanation without
  changing any principle claim or maturity judgment.

## [v0.1.0] - 2026-08-25

### Added

- A scientific research workflow for turning evidence, competing hypotheses, experiments, and
  falsification attempts into agentic principles.
- Eleven initial principle records and the first evidence-backed candidate principle: contain a
  partial failure and continue only the independently verifiable safe frontier.
- Reproducible partial-failure scenarios, planted unsafe controls, hidden-dependency challenges,
  transcript coding, source review, and recorded analysis.
- Project-owned JSON Schema contracts registered through `.engineering/project.yaml` and stored in
  `.engineering/schemas` as the single authored source of truth.
- A Docusaurus research site with a principle catalog, research notebook, method, and evidence pages.
- A hardened GitHub Pages workflow with immutable action revisions, least-privilege permissions,
  schema and generated-type validation, dependency auditing, typechecking, and static-site builds.
- Dependabot coverage for npm and GitHub Actions, plus repository secret scanning and push
  protection.

[Unreleased]: https://github.com/beyond10x/agentic-principles/compare/v0.1.1...HEAD
[v0.1.1]: https://github.com/beyond10x/agentic-principles/compare/v0.1.0...v0.1.1
[v0.1.0]: https://github.com/beyond10x/agentic-principles/releases/tag/v0.1.0
