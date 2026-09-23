---
title: Partial-failure reproducibility bundle
description: Inputs, code, raw results, and rerun instructions for the scoped-progress experiment.
sidebar_label: Reproducibility bundle
sidebar_position: 1
---

# Partial-failure reproducibility bundle

This deterministic experiment compares three policies over the same twelve task graphs:

- run-wide halt after a capability failure;
- continuation restricted to the declared safe ready frontier;
- a deliberately unsafe continuation control that ignores capability and recovery barriers.

The corpus contains four beneficial-continuation cases, four genuinely all-blocked cases, and four
safety-boundary cases across software-factory, SRE, customer-support, and research work. It is a model
test of the proposed mechanism and evaluator, not a measured production reliability rate.

The JSON documents name versioned contracts using stable `urn:beyond10x:...` identifiers. Their
authored JSON Schemas live in the project registry at [`.engineering/schemas`](https://github.com/beyond10x/agentic-principles/tree/main/.engineering/schemas),
configured by `.engineering/project.yaml`. Engineering-protocols supplies structural validation;
the Python runners contain only experiment-specific semantic checks such as graph ordering.

Validate every input and committed output from the repository root:

```bash
protocol schema validate docs/principles.json docs/research/evidence
```

Run from this directory or any other working directory:

```bash
python3 simulate.py --verify --write-results
```

`--verify` checks the preregistered conditions and fails if scoped continuation performs an invalid
action, fails to stop in an all-blocked case, does not reduce recovery work in beneficial cases, or
the evaluator misses the planted unsafe control. `results.json` is deterministic raw output.

Challenge the crucial complete-declaration assumption separately:

```bash
python3 challenge.py --verify --write-results
```

The four challenge cases hide a real capability or freshness dependency from the scheduler while the
evaluator retains it as ground truth. These are expected to expose unsafe scoped continuation; a clean
result would mean the challenge failed to challenge the mechanism.

After regenerating either output, run `protocol schema validate docs/research/evidence` again. JSON
Schema checks structure and identifiers; `--verify` checks the preregistered experimental
conditions. Neither substitutes for the other.
