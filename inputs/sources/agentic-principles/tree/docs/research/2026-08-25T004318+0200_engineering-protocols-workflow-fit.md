---
title: Can Engineering Protocols govern research?
description: A workflow-fit analysis separating a structurally valid research specification from runtime enforcement.
sidebar_label: Engineering Protocols workflow fit
sidebar_position: 3
---

# Can Engineering Protocols govern the research workflow?

- Created: 2026-08-25T00:43:18+02:00
- Status: observed integration results plus proposed adoption
- Upstream snapshot: `urn:beyond10x:engineering-protocols` at
  `9ffe3d7892466dd99d104a2c188168508cd73fbf`
- Question: Can Engineering Protocols govern the research workflow in `docs/VISION.md`, even before
  a research driver exists?

## Method

I inspected the normative workflow design, Rust domain model, four shipped workflows, profiles,
planning plugin, store format, and adoption guide. I then installed the Codex skill, installed the CLI
from the pinned checkout, initialized an empty store, tested lifecycle discovery with both a sibling
tree and a local tree, vendored the pinned document set, created real planning artifacts through the
CLI, and validated the resulting document tree and store.

No live model run, product change, or external system was exercised.

## Observations

### The workflow model fits the control problem

Engineering Protocols models a workflow as states plus guarded transitions. A transition combines a
predicate over facts with richer requirements; states carry phases, requirements, capability policy,
reversibility, and failure policy. Principles attach obligations to phases rather than hard-coding
state names. Construction rejects missing states, dead ends, unreachable states, and rollback on an
irreversible state.
([workflow model, lines 1–37 and 81–168](https://github.com/beyond10x/aep/blob/8e3f1d5ad6923f859406742a38c0d08497d0484a/crates/aep-domain/src/workflow.rs))

This directly fits the parts of the VISION loop that need control: do not interpret before framing,
do not collect before operationalizing, do not synthesize before challenge, and do not hand a result
to a product without review. It also supplies terminal outcomes for “declined” and “inconclusive,”
which prevents a scientifically useful negative result from appearing as an abandoned run.

### The VISION loop contains two scales

VISION describes `observe → question → hypothesize → operationalize → test → try to falsify →
synthesize → apply → observe again` ([VISION, lines 70–86](../VISION.md)). As a research program,
that loop should continue indefinitely. As one workflow execution, it needs a terminal boundary.

The proposed split is:

| VISION program step | bounded run | outside the run |
|---|---|---|
| observe, question | `receive`, `frame` | a prior incident, source, or product result triggers it |
| hypothesize, operationalize | `hypothesize`, `operationalize` | — |
| test, falsify | `gather`, `analyze`, `challenge` | — |
| synthesize | `synthesize`, `review` | — |
| apply | `handoff`, then terminal `complete` | implementation remains in `harness` or `metaharness` |
| observe again | — | the measured product result starts a linked new run or revision |

This keeps ownership true and makes “complete” mean a bounded research result, not an unverified claim
that the product improved.

### Planning-store adoption works, with an important default-root trap

The Codex integration's exercised install path is a repository-local skill plus always-on guardrails.
The planning store is suitable now for initiatives, epics, stories, tasks, specifications, and ADRs;
status moves go only through the CLI and remain operator decisions.

Observed defect: `protocol artifact` discovers the store through `.engineering/project.yaml`, but its
document `root` independently defaults to `.` and lifecycle loading reads that root directly
([planning CLI, lines 52–63 and 89–116](https://github.com/beyond10x/aep/blob/8e3f1d5ad6923f859406742a38c0d08497d0484a/crates/protocol-cli/src/planning.rs)).
With only a sibling pointer, `protocol artifact lifecycle story` reported a permissive lifecycle in
which every status could move to every other status. That is unsafe because omission of an optional
flag removes governance without failing.

The adopted mitigation is a repository-local vendored tree. Its identity is not the relative path:
`.engineering/protocol-source.yaml` records the global URN, canonical Git URL, and exact commit. The
default root now loads constrained lifecycles. This also follows the adoption guide's rule that a new
workflow means owning a document tree rather than trying to overlay a workflow through a project
pointer ([adoption guide, lines 111–166](https://github.com/beyond10x/aep/blob/8e3f1d5ad6923f859406742a38c0d08497d0484a/docs/guide/adopting.md)).

### Structural application is possible now; executable adoption is not yet established

`workflows/research/default.yaml` is a real workflow document. It uses the typed state-machine shape,
terminal outcomes, an evidence requirement for collection, independent challenge evidence, and review
dispositions. The complete vendored tree plus this workflow passes `protocol validate`.

That result proves document and graph validity only. It does not yet prove runtime governance:

- The research phases are not declared by `adp/1`, so no profile currently binds principles to them.
- The AEP evidence vocabulary is a closed enum of engineering and operations evidence kinds; it has
  generic `artifact`, `review`, and `verification`, but no first-class literature source, transcript
  coding, experiment result, replication, or product-trial evidence
  ([evidence kinds, lines 1177–1251](https://github.com/beyond10x/aep/blob/8e3f1d5ad6923f859406742a38c0d08497d0484a/crates/aep-domain/src/evidence.rs)).
- A requirement can constrain evidence by count, subject, verifier, independence, and horizon, which is
  a strong fit for scientific provenance and independent challenge
  ([requirements, lines 194–235](https://github.com/beyond10x/aep/blob/8e3f1d5ad6923f859406742a38c0d08497d0484a/crates/aep-domain/src/requirement.rs)).
  The missing part is research-specific meaning and projection, not the requirement mechanism.
- There is no `research.standard` profile, representative research task, research principle set, or
  driver step map.
- The Codex integration explicitly supplies instructions rather than hooks or a live transcript
  conformance adapter. Installing it does not enforce a research run.

## Fit assessment

| Surface | Fit now | Evidence-calibrated conclusion |
|---|---|---|
| initiatives, epics, stories, tasks, ADRs | strong | Use now through the governed planning store. |
| workflow as a typed specification | strong | Use now; structural validation catches graph defects. |
| phase-timed research principles | partial | Mechanism fits, but research phases need a declared protocol/profile. |
| scientific evidence requirements | partial | Independence, provenance, horizons, and unknown semantics fit; the evidence ontology is too coarse. |
| automatic research execution | not established | Requires a profile, representative task, step map, executor, and recorded run. |
| Codex behavioral conformance | not established | Requires the absent Codex transcript adapter and eval. |
| product feedback loop | strong as composition | End the research run at handoff; link product evidence back into a new run. |

## Proposed adoption

1. **Use the planning store now.** It already gives the repo a governed system of record without
   pretending research itself is automated.
2. **Use `research/default` as a specification.** Keep its status explicit: structurally valid,
   scientifically proposed, not driven.
3. **Exercise three representative cases manually:** one web synthesis, one transcript analysis, and
   one controlled/live evaluation. Record which states, evidence semantics, and terminal outcomes do
   or do not fit.
4. **Only then decide the protocol boundary.** Either define an Agentic Research Protocol with the
   phases and evidence semantics the cases require, or demonstrate that generic artifact/review/
   verification records are sufficient.
5. **Add a profile and representative task before claiming semantic validation.** `protocol resolve`
   is the test that phase-timed principles and the workflow actually compose.
6. **Add a driver and trace evaluation last.** Automation should follow a stable observed method, not
   freeze the first plausible diagram into runtime behavior.

## Result

Engineering Protocols is directly applicable to research planning and meaningfully applicable to the
VISION workflow as a typed specification. It should not yet be described as governing research
execution. The key architectural move is to treat one research question as the bounded run and the
product feedback cycle as composition between runs and repositories.

## Correction — 2026-08-25T01:04:07+02:00

The “adopted mitigation” described above was rejected. Copying the full document tree into the
adopter, especially at repository top level, encoded an upstream root-resolution defect as downstream
architecture and introduced unrelated profiles, drivers, principles, workflows, and protocols. The
method section remains as a record of what was tried; it must not be read as the current design.

The defect was repaired in the `engineering-protocols` working tree instead:

- `aep_engine::project::load_paths` now reads and resolves only `.engineering/project.yaml`, without
  requiring unrelated project documents to load;
- `protocol artifact` uses that configured `protocols` path for lifecycle and template discovery when
  `--root` is absent, while an explicit `--root` remains authoritative;
- the new integration test
  `planning_documents_follow_the_protocol_tree_named_by_the_project` failed against the old fallback
  and passed after the repair;
- all 21 planning CLI tests, the project-loader tests, and the complete `task check` gate passed before
  reinstalling the binary.

After reinstall, unqualified artifact commands in this repository loaded the upstream constrained
story lifecycle through `.engineering/project.yaml`. The copied top-level directories were removed.
The globally stable source identity and pinned document revision remain in
`.engineering/protocol-source.yaml`; its machine-local checkout is only the runtime resolution of that
identity. The repository-owned workflow is now
`.engineering/research-tree/workflows/research/default.yaml` and validates independently as one
workflow document.

This incident produced the separate principle seed
[`Fix the source, not the adopter`](2026-08-25T005715+0200_fix-the-source-not-the-adopter.md).

## Correction to the correction — 2026-08-25T01:13:34+02:00

The intermediate correction still used a machine-local checkout path plus
`.engineering/protocol-source.yaml`. The operator rejected any local path crossing the repository
boundary: the project must identify the repository directly.

The source model was consequently repaired as well. `project.protocols` now accepts a typed, pinned
Git source such as
`git+ssh://git@github.com/beyond10x/engineering-protocols.git#<full-commit>`. Repository sources are
not represented as `PathBuf`; the engine materializes the exact commit in a URL-hashed cache and then
hands the resulting immutable filesystem tree to the existing document loader. A moving branch, tag,
abbreviated commit, or unsupported scheme is refused.

The Git-source integration test creates a repository, loads its lifecycle, removes the source
repository, and creates an artifact from the cached template. In the live adopter check, the declared
SSH repository resolved to commit `9ffe3d7892466dd99d104a2c188168508cd73fbf`; after materialization,
`protocol artifact validate` succeeded with SSH deliberately disabled. `agentic-principles` now has
only the pinned `git+ssh` locator in `.engineering/project.yaml`; the checkout path and redundant
`.engineering/protocol-source.yaml` were removed.
