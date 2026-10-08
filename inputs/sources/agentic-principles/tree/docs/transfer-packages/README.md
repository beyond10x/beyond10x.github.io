---
title: Transfer packages
description: Where a principle's transfer package lives, which principles may reach a running agent, what the projected document costs per turn, and how a product result is correlated back to the research run that produced it.
sidebar_label: Transfer packages and the harness handoff
---

# Transfer packages

A **transfer package** is the testable handoff described in
[the research vision](../VISION.md): the claim and its confidence, the evidence and known
counterevidence, the conditions where the claim applies, the behavior it suggests, an evaluation
that can detect improvement and regression, and the expected safety, quality, latency, cost, and
operator-attention effects.

This page answers three questions that were open while the package existed only as prose: where the
package lives, which principles may reach a running agent, and how a product result finds its way
back to the research run that produced it.

## Where the package lives

One file per principle, named by its registry identifier:

```text
docs/transfer-packages/<principle-id>.json
```

It is a sidecar, not a second registry. The package carries no maturity label and no claim of its
own: maturity stays sourced from `docs/principles.json`, and the package's claim statement must be a
verbatim quotation of the research note it cites. The structure is the project-owned contract
`urn:beyond10x:agentic-principles:schema:transfer-package:1` in `.engineering/schemas/`, validated
in CI by the same `ess schema validate` run that validates the registry.

Today there is exactly one: `docs/transfer-packages/AP-011.json`, for
[the partial-failure study](../research/2026-08-25T023000+0200_scoped-progress-under-partial-failure.md).

## Which principles may reach a run

A principle reaches an agent run only when **both** conditions hold:

1. its maturity in `docs/principles.json` is `candidate` or `supported`; and
2. a transfer package exists for it and validates.

The bar is not advisory. `tools/project_harness_context.py` holds the projectable maturities in a
module constant with no command-line override, so a principle below the bar has no code path to a
document at all. That matches the responsible use this project already publishes for a seed —
generate a research question; do not turn it into policy — and it is what makes the maturity label
cost something: a `candidate` with no package is refused by name, not projected with gaps.

`challenged`, `revised`, and `retired` are not projectable either. They are not stages above
`candidate` on the lifecycle; they label a principle whose standing is in flux or ended, and a run
should not be told to weigh one.

Ten of the eleven principles in the catalog are seeds, so today AP-011 is the only principle that
projects and the other ten are refused.

## How it reaches a run

The projector writes an ordinary file; an operator names it on the command line:

```bash
python3 tools/project_harness_context.py AP-011 --out build/harness-context
harness --context build/harness-context/AP-011.md
```

No harness change, contract version, or flag was needed, and nothing is ambient. The document
becomes one provided-context layer at operator trust, with its path as the layer source. The
projection is deterministic: identical inputs produce identical bytes, and nothing in it reads the
clock, the environment, or an unordered collection.

## What it costs, and why the bar is not "all principles"

The AP-011 document is **6,848 bytes, roughly 1.7k tokens**. A context layer is billed on **every
turn** of a run, and compaction cannot reclaim it — it is not conversation history that can be
summarized away, it is a layer the run carries until it ends. A hundred-turn run therefore pays that
cost a hundred times.

That is the honest reason the bar exists. Projecting all eleven principles would cost roughly an
order of magnitude more per turn for ten claims the evidence does not yet support, and a research
question is not worth a permanent tax on every turn of every run. The bar keeps the per-turn cost
proportional to the strength of the evidence behind it.

## How a result is correlated back

**The correlation key is the sha256 of the projected document.**

The digest covers the registry entry and the package together, so it identifies exactly which claim,
which maturity label, and which revision of which package a given run carried. Two runs that quote
the same digest were told the same thing; a run whose digest is unknown was not told this.

The projector prints the digest for every document it writes, and `--verify` reprints it:

```text
AP-011 sha256:364b6d6c85efe29ab712a07ea669a0ec5dd19faaa491c25b4527e6d155c8d72f 6848 bytes
```

The package's own `returnPath` states what comes back and where it lands:

- **A result** is recorded as a dated note under `docs/research/` carrying the harness run
  identifier, the model, the harness and configuration version, the digest of the projected context
  document, and the measured values of the package's evaluation measures. Its conclusion is then
  added to the package's `evidence` or `counterevidence` array.
- **A contradiction** becomes a counterevidence citation on the package plus a new research run. The
  originating run stays closed. Registry maturity moves only through a reviewable synthesis
  decision, never automatically from a product result.

That is what keeps the loop bounded. A product outcome returns as research input for a new run or a
revision, rather than holding the run that produced the package permanently open.

## The gates, and the proof that they fire

A gate that cannot fail is not a gate, so the refusals are tested against planted fixtures under
`tools/fixtures/gate-proof/`. `python3 tools/project_harness_context.py --verify` runs in CI on every
pull request and fails if any refusal stops firing:

| Planted case | Refusal |
|---|---|
| A seed that does have a well-formed transfer package | `maturity_below_bar` |
| A candidate with no transfer package | `no_transfer_package` |
| A package whose claim statement has drifted from its cited study | `claim_not_quoted` |
| A malformed package | `package_invalid`, after `ess schema validate` rejects it |
| The real registry, projected twice | Identical bytes, identical digest, ten principles refused |

The third is the one that keeps the projection honest: navigation and summaries are projections, not
a second research corpus, so a projected document may not restate or strengthen a claim. If the
statement in the package is not found verbatim in the study it cites, the principle is refused
rather than rendered.

Structural validation is delegated to `ess schema validate`, the same tool CI uses. If `ess` is
absent the projector fails closed rather than projecting unvalidated documents.
