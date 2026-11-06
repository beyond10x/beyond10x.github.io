# Agentic Principles

Research for AI agents that do real work.

This project asks how agents can plan, use tools, and change external state without outrunning their
authority, evidence, or ability to recover. It studies software delivery, automatic SRE, customer
service, and other consequential SaaS operations through source research, live tests, transcript
analysis, and evaluations.

The result is not a list of commandments. It is a reviewable catalog of claims, each labelled by the
strength of its evidence and linked to the work behind it.

**Start with the [reader’s guide](https://beyond10x.github.io/agentic-principles/research), or scan the
[current principle catalog](https://beyond10x.github.io/agentic-principles/principles).**

## Current evidence posture

- **1 candidate principle** has a scoped mechanism, counter-pressure, falsifier, and mixed-method
  study: contain a partial failure and continue only the independently verifiable safe frontier.
- **10 seeds** are early research directions, not recommendations.
- **0 supported principles** have yet met the independent empirical promotion standard.

The [partial-failure study](https://beyond10x.github.io/agentic-principles/research/research/2026-08-25T023000+0200_scoped-progress-under-partial-failure)
is the strongest current result and the best example of the intended method.

## Repository map

| Path | Purpose |
|---|---|
| `docs/index.mdx` | Human-oriented entry point and guide to the evidence labels |
| `docs/VISION.md` | Research mission, scientific method, and intended product feedback loop |
| `docs/research/` | Timestamped questions, methods, evidence, analyses, and limitations |
| `docs/principles.json` | Machine-readable principle registry |
| `docs/transfer-packages/` | One testable transfer package per principle at or above `candidate` |
| `tools/` | The transfer-package projector and its gate proofs |
| `.engineering/schemas/` | Project-owned JSON Schema contracts |
| `.engineering/planning/` | Governed planning artifacts, mutated only through `aep artifact` |
| `website/` | Docusaurus source for the public research site |

Principles move through an explicit lifecycle:

```text
seed → hypothesis → candidate principle → supported principle
                         ↘ challenged → revised or retired
```

The maturity label is a claim about evidence strength, not editorial polish. Read
[`docs/index.mdx`](docs/index.mdx) for orientation, [`docs/VISION.md`](docs/VISION.md) for the full
method, and [`AGENTS.md`](AGENTS.md) for the operating rules.

## Verify the research contracts

The shared schema-contract tooling comes from
[`beyond10x/ess`](https://github.com/beyond10x/ess). From the
repository root:

```bash
ess schema validate \
  docs/principles.json \
  docs/transfer-packages/*.json \
  docs/research/evidence/scoped-progress-partial-failure/*.json \
  --schemas .engineering/schemas

python3 tools/project_harness_context.py --verify

cd website
npm ci --ignore-scripts
npm run schema:check
npm run typecheck
npm run build
```

The authored JSON Schemas are the source of truth. TypeScript types under `website/src/generated/`
are deterministic projections and must pass the drift check. `--verify` proves the projector's
refusals still fire against planted fixtures; a gate that cannot fail is not a gate.

## From a principle to a running agent

A principle reaches an agent run only at maturity `candidate` or above and only while carrying a
transfer package in `docs/transfer-packages/`. The projector renders one context document, which an
operator names on the command line:

```bash
python3 tools/project_harness_context.py AP-011 --out build/harness-context
harness --context build/harness-context/AP-011.md
```

The document's sha256 is the correlation key that ties a product result back to the research run
behind it. Because a context layer is billed on every turn and compaction cannot reclaim it, the bar
is deliberate rather than generous. See
[Transfer packages](https://github.com/beyond10x/agentic-principles/tree/main/docs/transfer-packages).

## Publication

Pushes to `main` that affect the research, schemas, or website run the GitHub Pages pipeline. It
validates schema instances and generated types, audits dependencies, type-checks, builds, and deploys
the static artifact with least-privilege Pages permissions.

`node_modules`, `build`, `dist`, coverage output, and Docusaurus caches are ignored and are never
release inputs. See [`CHANGELOG.md`](CHANGELOG.md) for released milestones.

<!-- b10x-docs:start -->
## Documentation

[Agentic Principles documentation](https://beyond10x.github.io/docs/agentic-principles/) · [Start](https://beyond10x.github.io/) · [Ecosystem](https://beyond10x.github.io/ecosystem/) · [Impact](https://beyond10x.github.io/changes/) · [Releases](https://beyond10x.github.io/releases/)
<!-- b10x-docs:end -->
