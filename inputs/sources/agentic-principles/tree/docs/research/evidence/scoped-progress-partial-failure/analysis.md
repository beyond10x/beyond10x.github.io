---
title: Partial-failure experiment analysis
description: Aggregate and per-scenario interpretation of the scoped-progress experiment and its annotation challenge.
sidebar_label: Experiment analysis
sidebar_position: 2
---

# Partial-failure experiment analysis

- **Run date:** 2026-08-25
- **Command:** `python3 simulate.py --verify --write-results`
- **Environment:** Python 3, local deterministic simulator, no network or external effects
- **Exit status:** 0
- **Result hash:** `sha256:8f6050b1b081885d0c854a3c6f7e8b3051d315dc9a409a9267895ebbecb48aa2`

The same command was run twice. Both generated the recorded hash.

## Aggregate result

| measure | result |
|---|---:|
| scenarios | 12 |
| beneficial / all-blocked / safety-boundary | 4 / 4 / 4 |
| scoped-continuation useful outage weight | 34 |
| scoped-continuation invalid executions | 0 |
| invalid executions detected in planted naive control | 30 |

## Per-scenario result

| scenario | class | scoped outage weight | scoped recovery tasks | global-halt recovery tasks | naive invalid tasks |
|---|---|---:|---:|---:|---:|
| research-remote-git | beneficial | 6 | 3 | 6 | 3 |
| factory-package-registry | beneficial | 6 | 2 | 5 | 2 |
| sre-change-api | beneficial | 7 | 1 | 5 | 1 |
| support-outbound-messaging | beneficial | 7 | 1 | 5 | 1 |
| research-web-only | all-blocked | 0 | 3 | 3 | 3 |
| factory-source-forge | all-blocked | 0 | 4 | 4 | 4 |
| sre-live-telemetry | all-blocked | 0 | 4 | 4 | 4 |
| support-account-state | all-blocked | 0 | 4 | 4 | 4 |
| sre-observability-barrier | safety-boundary | 2 | 2 | 4 | 2 |
| support-authorization-barrier | safety-boundary | 1 | 2 | 3 | 2 |
| factory-provenance-barrier | safety-boundary | 3 | 2 | 4 | 2 |
| research-freshness-barrier | safety-boundary | 2 | 2 | 4 | 2 |

## Observation

The scoped policy met every preregistered assertion. It did useful work in all four beneficial cases,
made no outage progress in all four genuinely blocked cases, crossed no declared barrier, and reduced
the number of post-recovery scheduling decisions wherever a safe frontier existed. The deliberately
naive policy crossed missing-capability, freshness, or tainted-dependency boundaries in every planted
control and the verifier detected those executions.

## Interpretation

This establishes an internal property of the operational model: given complete and correct dependency,
capability, and barrier declarations, global halt is unnecessarily idle whenever the safe frontier is
non-empty, while naive continuation is unsafe. It does **not** establish that real agents will infer
those declarations correctly. The model makes hidden dependencies visible by construction; production
work often does not.

The experiment therefore supports the mechanism and the proposed evaluation shape, while the principal
open risk remains dependency discovery and state freshness. A product experiment must inject omitted or
incorrect dependencies, not only declared capability failures.

## Annotation-fault challenge

- **Command:** `python3 challenge.py --verify --write-results`
- **Exit status:** 0
- **Result hash:** `sha256:2f3b80306c4ee421aacd387a4b37331f2751b53f31a1352b33938f887083a037`

The challenge hid one real dependency from the scheduler in each of four domains while retaining it in
the evaluator's ground truth. Scoped continuation crossed the hidden observability, authorization,
provenance, and freshness boundary in all four cases. This is counterevidence to any rule that assumes
an agent's inferred dependency graph is complete.

The result narrows the proposed mechanism: continuation is safe only over dependencies and barriers
that are both declared and sufficiently substantiated. Unknown or low-confidence dependencies must be
treated as a stop boundary for consequential work, and product evaluations must mutate dependency
declarations as well as tool availability.
