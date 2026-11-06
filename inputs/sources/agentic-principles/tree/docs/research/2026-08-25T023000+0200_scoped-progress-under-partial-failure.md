---
title: What should an agent do when one capability fails?
description: A mixed-method study of global halt, scoped continuation, and safety stop boundaries under partial failure.
sidebar_label: Progress under partial failure
sidebar_position: 1
---

# What should an agent do when one capability fails?

- **Status:** candidate principle
- **Created:** 2026-08-25T02:30:00+02:00
- **Synthesized:** 2026-08-25T02:37:37+02:00
- **Method:** targeted primary-source review, formal task model, deterministic experiment, and bounded
  transcript analysis
- **Decision target:** failure handling and resumability in agent harnesses and metaharnesses

## Receive

During initialization of this repository, Internet loss made GitHub authentication and remote pushes
unavailable while local files, the planning CLI, validation tools, and Git remained usable. The agent
initially yielded the whole task. The operator's correction—independent local work was still
possible—motivates the question. It is an observation to investigate, not evidence sufficient to
establish a general rule.

## Research question

When one capability needed by a multi-step agent run becomes unavailable, under what conditions should
the agent continue other work rather than halt the whole run?

The answer could change whether `harness` and `metaharness` represent failure at run level or at the
level of actions, dependencies, and capabilities; what state they checkpoint; and which recovery
behaviors they evaluate.

## Registered hypotheses

### H1 — dependency-scoped continuation

If task prerequisites, required capabilities, authority, and freshness constraints are explicit, a
policy that defers only blocked tasks and continues the safe ready frontier will complete more useful
work before recovery than a global-halt policy without increasing invalid effects.

Proposed mechanism: the failed capability removes only the graph nodes that require it and their
dependants. Halting nodes outside that cut wastes available capacity and increases recovery latency.

### H2 — global halt protects consistency

A global halt will produce fewer invalid or stale-state actions because apparently independent tasks
often share hidden state, assumptions, or transaction boundaries. Continuing work can accumulate
rework and make the eventual state harder to reconcile.

This is the principal competing explanation, not a straw man. It predicts that the benefit of H1 will
disappear or reverse when dependencies and freshness constraints are incomplete.

### H3 — the effect is conditional

Scoped continuation will dominate only when a non-empty safe frontier remains. It will equal global
halt when every remaining task is blocked and must yield to a safety stop when the missing capability
also removes authorization, observability, rollback, required evidence, or the ability to determine
whether state is fresh.

## Operational model

Represent a run as a directed acyclic graph of tasks. Each task declares:

- prerequisite tasks;
- required capabilities;
- whether it changes external state;
- whether it needs state refreshed after capability restoration;
- its useful-work weight.

During an outage, a task is in the **safe ready frontier** only when every prerequisite succeeded, all
required capabilities are available, its authority remains valid, and no freshness or transaction
barrier applies. The policies under comparison are:

1. **Global halt:** after the first unavailable capability is observed, execute no task until it is
   restored.
2. **Scoped continuation:** defer tasks cut by the failed capability, checkpoint their blockers, and
   execute tasks in the safe ready frontier. Re-evaluate deferred tasks after restoration.
3. **Naive continuation:** ignore declared capability and freshness constraints. This intentionally
   unsafe control tests whether the evaluator can detect invalid progress.

## Measures

Primary measures:

- useful-work weight completed during the outage;
- invalid executions during the outage;
- tasks requiring rework after restoration;
- total tasks completed after restoration;
- scheduling decisions from restoration to completion.

Secondary measures:

- number of tasks with a localized blocker rather than a run-wide blocker;
- whether the policy preserves a resumable checkpoint;
- cases where scoped continuation correctly makes no progress.

The candidate principle is supported only if scoped continuation produces strictly more useful outage
work in at least one predeclared beneficial case, never executes a task whose declared safety
conditions are false, and correctly halts in all predeclared safety-boundary cases. A single violation
of the last two conditions challenges H1 as operationalized.

## Experiment design

A deterministic local simulator will execute predeclared task graphs from four domains:

- software factory: remote forge or package registry unavailable;
- SRE: telemetry or change-control capability unavailable;
- customer support: CRM or outbound-message capability unavailable;
- research operations: web access or remote Git unavailable.

The corpus must include at least:

- four cases with independent safe work;
- four cases where all remaining work is genuinely blocked;
- four cases with hidden-state risk made explicit as a freshness, authority, observability, rollback,
  or transaction barrier;
- one planted evaluator control where naive continuation must be caught.

Inputs, simulator source, raw JSON results, and a human-readable result table will be retained under
`docs/research/evidence/scoped-progress-partial-failure/`. The simulator must be deterministic and
must fail its own verification command if the planted unsafe control is not detected.

## Source-review method

Search primary standards, official reliability guidance, and original research for:

- graceful degradation and preservation of essential functions;
- fault containment, bulkheads, and failure-domain isolation;
- static stability and dependency removal during impairment;
- durable or fault-tolerant workflow scheduling;
- counterexamples involving stale state, split-brain behavior, unsafe fallback, or lost observability.

Include a source only for claims it directly supports. Record version or publication date and access
date. The review stops after at least four relevant primary or authoritative sources from at least
three independent organizations, including at least one source that materially constrains
continuation rather than merely endorsing availability.

## Transcript-analysis method

Use only the current authorized session. Preserve ordering and code each pending action at the first
global yield as:

- blocked by the unavailable capability;
- safe and independent;
- unsafe or indeterminate without the capability;
- already complete.

Compare that coding with actions actually completed after the operator correction and before Internet
restoration. This is a single purposive incident, so it can test the task classification and expose a
mechanism; it cannot estimate a general success rate.

## Safety envelope

The experiment is local, deterministic, and produces repository files only. Source collection is
read-only. No production outage, customer data, credential exercise, external message, or mutation of
`harness` or `metaharness` is authorized. Stop immediately if a method would require any such effect.

## Challenge plan

Before synthesis:

1. run the planted unsafe policy to verify the evaluator catches violations;
2. run cases where no safe frontier exists to disprove an unconditional “always continue” rule;
3. search specifically for reliability guidance against fallback and work on stale state;
4. distinguish progress that is merely busy from progress that remains useful after recovery;
5. record any scenario where global halt has lower rework or safer outcomes.

## Stopping conditions

Stop with a candidate principle only when the source threshold, experimental corpus, evaluator control,
transcript coding, counterexample search, and reproducibility checks are complete. Stop as
**inconclusive** if source claims conflict without a defensible scope, the evaluator cannot distinguish
unsafe work, or results depend on unrecorded task annotations. Do not promote beyond candidate based on
this study: the operational incident is singular and the experiment is a model, not a production
reliability trial.

## Gathered evidence

The complete source extraction, limitations, transcript coding, experiment inputs, simulator, raw
results, and challenge results are retained under
[`evidence/scoped-progress-partial-failure/`](evidence/scoped-progress-partial-failure/README.md).

Seven primary or authoritative sources from NIST, AWS, Google, Microsoft, and three research teams were
included. Their relevant results converge on failure containment and selected degraded operation, but
also identify stale state, untested fallback paths, retry cascades, and isolation complexity as
material risks:

- NIST defines a **Continue** resiliency objective around essential functions, functional
  dependencies, and critical assets.
- AWS static stability separates impaired control-plane changes from continued data-plane operation,
  while explicitly accepting that updates can be unavailable during impairment.
- Google SRE recommends selective useful work under overload but warns that rare degradation paths and
  retries can worsen incidents.
- Microsoft's bulkhead pattern contains a failed dependency so unrelated services can operate, with
  resource and complexity trade-offs.
- workflow-scheduling research formalizes task precedence and resource constraints as a DAG;
- ToolMaze reports dynamic recovery as a distinct weakness of current tool-using agents, particularly
  under implicit semantic failures and complex paths;
- ReliabilityBench demonstrates the need for controlled tool/API fault injection and outcome-based
  evaluation rather than happy-path success alone.

These sources support the mechanism and the test method. They do not directly prove the proposed rule
for autonomous SaaS work.

## Experimental findings

### Primary model test

The command below ran twelve deterministic task graphs: four with safe independent work, four where all
work was genuinely blocked, and four with explicit safety barriers.

```bash
python3 docs/research/evidence/scoped-progress-partial-failure/simulate.py \
  --verify --write-results
```

It exited 0. Scoped continuation completed 34 units of useful outage work, executed zero invalid tasks,
correctly did no work in every all-blocked case, and reduced post-recovery scheduling in every
beneficial case. The unsafe control crossed 30 missing-capability, barrier, or tainted-dependency
boundaries, all of which the verifier detected. Two runs produced identical result hash
`8f6050b1b081885d0c854a3c6f7e8b3051d315dc9a409a9267895ebbecb48aa2`.

This validates the internal mechanism only under complete declarations. It is not a reliability rate
and does not show that an agent can infer a correct dependency graph.

### Transcript analysis

At the first run-wide yield in the motivating incident, four pending actions required only local files
and tools, while four required the unavailable GitHub API or transport. After operator intervention,
all four locally independent actions were completed before connectivity returned: both protocol
validations, the Atlas work log, and Markdown checks. No blocked external action was attempted. The
preserved Git index then allowed the bot commits and pushes to resume after restoration without
reconstructing the repository state.

This observation is consistent with H1, but it remains a single purposive trace and required human
correction. It does not establish how often an agent will classify the frontier correctly.

## Challenge and counterevidence

The annotation-fault challenge deliberately hid one real dependency from the scheduler in each domain
while retaining it as evaluator ground truth:

```bash
python3 docs/research/evidence/scoped-progress-partial-failure/challenge.py \
  --verify --write-results
```

It exited 0 because it detected the intended counterexample: scoped continuation crossed the hidden
observability, authorization, provenance, and freshness boundary in all four cases. The result hash is
`2f3b80306c4ee421aacd387a4b37331f2751b53f31a1352b33938f887083a037`.

This materially supports H2. A dependency-scoped scheduler is not safe merely because it has a graph;
its safety depends on the graph's completeness and the truth of its capability and barrier state.
Other counter-pressure remains:

- partitioning work and maintaining checkpoints adds orchestration complexity and cost;
- local work can become obsolete while remote state changes;
- continuing low-value work can hide the fact that the objective is blocked;
- an outage can remove the evidence needed to tell whether work is safe;
- poorly bounded retries can prolong the failed dependency and cause a cascade;
- transaction-wide invariants may legitimately require a global stop.

## Synthesis

H1 is supported only in the conditional form anticipated by H3. Global halt is over-broad when a
substantiated safe frontier exists; naive continuation is unsafe; and scoped continuation becomes
unsafe when its dependency declarations are wrong. The evidence therefore supports a candidate
principle with an explicit epistemic boundary.

## Candidate principle — contain the failure, continue the safe frontier

> When a capability fails, an agent should checkpoint and defer the work that depends on it while
> continuing only the independently verifiable safe frontier; if a consequential task's dependencies,
> authority, freshness, observability, or rollback conditions are uncertain, that uncertainty is
> itself a stop boundary.

### Mechanism

Failure localization prevents an impaired dependency from turning into run-wide idleness. Explicit
prerequisites and capabilities identify which nodes remain runnable; checkpoints preserve completed
evidence and blocked state for recovery. The uncertainty boundary prevents a plausible but incomplete
task graph from authorizing work whose real preconditions disappeared with the failed capability.

### Scope and boundary conditions

The principle applies to multi-step work where tasks and effects can be separated, checkpointed, and
verified independently. It is strongest for local analysis, validation, drafting, and other reversible
work whose inputs remain valid. It permits a global halt when:

- all remaining work is dependency-cut;
- a transaction or invariant spans the whole run;
- authorization, monitoring, evidence capture, or rollback is unavailable;
- current external state is necessary and cannot be refreshed;
- the agent cannot substantiate the independence of a consequential action;
- the operator reprioritizes the run to incident response.

“Continue” does not mean retry the failed tool, invent a fallback, create unrelated busywork, or make
progress claims against stale state.

### Evidence and confidence

- **Mechanism confidence:** moderate. Five independent reliability/workflow traditions converge, and
  the deterministic model behaves as predicted.
- **Agent-generalization confidence:** low to moderate. Two recent agent benchmarks establish that tool
  failure and recovery are real, distinct evaluation dimensions, but the local transcript is one case
  and the custom experiment does not contain an LLM.
- **Maturity:** candidate principle. It is not supported principle status because it has not survived
  repeated agent trials with realistic hidden dependencies and external effects.

### Falsifier and next experiment

The principle is weakened if, under matched partial failures, frontier continuation produces no
durable useful work, increases invalid or unauthorized effects, or creates enough reconciliation and
rework to erase its recovery advantage. It is also weakened if agents cannot identify dependency
uncertainty well enough to honor the stop boundary.

The next discriminating evaluation should run representative software-factory, SRE, and customer-
support agents against a stateful fault-injection harness. Compare global halt, naive continuation, and
scoped continuation under:

- explicit timeouts, rate limits, and permanent failures;
- silent partial or stale results;
- omitted and incorrect dependency declarations;
- loss of authority, observability, and rollback capabilities;
- restoration with remote-state drift.

Measure valid useful work during impairment, unauthorized or invalid effects, stale-state decisions,
rework, recovery latency, retry load, total cost, and operator interventions. Plant known-bad cases to
verify the evaluator before trusting the result.

## Product handoff

For a bounded `harness` or `metaharness` experiment, represent each action with prerequisites, required
capabilities, effect class, evidence freshness, and rollback/compensation state. On failure:

1. record a typed capability-level blocker rather than only a run-level error;
2. checkpoint completed evidence and effect receipts;
3. compute the ready frontier deterministically outside the model;
4. ask the model to choose only among permitted frontier actions;
5. fail closed for consequential actions with unknown dependency confidence;
6. use budgeted, event-driven recovery rather than retry polling;
7. refresh external state and reconcile effects before releasing deferred actions.

Acceptance requires more durable useful work or lower recovery latency than global halt with no
increase in unauthorized effects, invalid state transitions, or evaluator escapes. Roll back to
run-wide halt if those safety measures regress.

## Review result

The source threshold, preregistered experiment, planted evaluator control, transcript coding,
counterexample search, annotation-fault challenge, reproducibility check, and bounded product handoff
are complete. The evidence supports the conditional candidate principle above. Promotion to a
supported principle requires independent empirical agent runs and serious hidden-dependency testing.
