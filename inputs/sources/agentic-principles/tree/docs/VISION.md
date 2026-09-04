---
title: Research vision and method
description: The mission, scientific method, scope, and product feedback loop for Agentic Principles.
sidebar_label: Research vision and method
sidebar_position: 3
---

# Research vision and method

## Mission

This repository exists to discover, test, and distill **the agentic principles**: durable principles
for running agentic work automation safely and efficiently.

The work is empirical. We gather ideas, facts, failures, theories, and hypotheses from any useful
source—web research, standards, incident reports, live tests, controlled evaluations, transcript
analysis, product behavior, and direct operational experience. We turn that material into claims that
can be challenged, tested, refined, and eventually used to improve real systems.

Our primary application is the automation of a SaaS business:

- software factories that plan, implement, review, test, release, and maintain software;
- SRE agents that investigate, mitigate, repair, and learn from operational failures;
- customer-support agents that understand requests, communicate, resolve cases, and escalate safely;
- the connective operational work around those systems: triage, coordination, compliance, reporting,
  and routine back-office execution.

The resulting principles should inform the design and evaluation of `harness` and `metaharness`.
Research here does not replace product engineering. It gives product engineering better hypotheses,
constraints, experiments, and evidence.

## What we mean by agentic work automation

An agentic system does more than produce an answer. It observes state, forms or adopts an objective,
chooses among possible actions, uses tools, changes external state over multiple steps, evaluates the
result, and adapts what it does next. It operates with some discretion delegated by a person or another
system.

That discretion is the source of both value and risk. A useful agent can handle variation that was not
enumerated in advance. The same freedom can amplify a mistaken premise, misuse a capability, conceal a
failure behind a plausible report, or consume more time and money than the work is worth.

We therefore study **bounded autonomy**: enough discretion to complete meaningful work, inside explicit
limits on authority, resources, risk, and acceptable evidence.

## What counts as a principle

A principle is not a slogan, a product preference, or a recipe that happened to work once. A mature
agentic principle should:

- make a clear claim about how agentic work should be designed, delegated, executed, evaluated, or
  governed;
- explain the mechanism by which following it should improve an outcome;
- name the conditions where it applies and the counter-pressures it introduces;
- connect to evidence and preserve material counterevidence;
- admit a test that could weaken, refine, or falsify it;
- change a concrete engineering or operating decision.

Principles may be conditional. “Use this control when these risk factors are present” is often more
truthful and useful than a universal command.

## Safe and efficient

**Safe** means that automation preserves authorization, confidentiality, integrity, availability, and
human agency in proportion to the consequences of its work. Failures should be contained, observable,
attributable, interruptible, and recoverable. Safety includes the people affected by an agent, not only
the infrastructure running it.

**Efficient** means producing verified useful outcomes with less scarce human attention, elapsed time,
compute, and operational cost. Fast action that creates hidden review work, repeated incidents, or
unverifiable results is not efficient. Neither is a control system so burdensome that automation cannot
do useful work.

The objective is not maximum autonomy. It is the highest useful autonomy that the evidence supports for
a particular task and operating environment.

## The research loop

Our default loop is:

```text
observe → question → hypothesize → operationalize → test → try to falsify
        → synthesize → apply → observe again
```

Different questions require different methods. A controlled evaluation can measure tool-selection
errors; transcript analysis can expose recurring coordination failures; an incident can reveal a
missing safety boundary; standards research can identify established controls; and a live trial can
show whether a theoretically sound workflow survives contact with a real system. No method is granted
authority merely because it produces numbers.

We value negative results, contradictions, and corrections. They constrain the design space and protect
us from turning a compelling anecdote into doctrine.

## Research themes

The initial research program includes:

- delegation contracts: objectives, invariants, permissions, budgets, and completion conditions;
- autonomy and control: approval, notification, interruption, escalation, and shutdown;
- verification: outcome checks, independent evaluation, verifier quality, and evidence bundles;
- execution safety: isolation, least privilege, reversible actions, idempotency, and blast radius;
- context and memory: provenance, freshness, contamination, retention, and forgetting;
- coordination: human-agent and agent-agent handoffs, ownership, conflict, and shared state;
- observability: traces, decisions, tool effects, costs, and reconstruction of a run;
- resilience: partial failure, retries, compensation, rollback, and recovery from bad premises;
- economics: useful outcomes per unit of attention, latency, compute, and operational complexity;
- lifecycle: evaluation, staged deployment, monitoring, incident response, and continual improvement;
- domain differences among software engineering, SRE, customer support, and other SaaS operations.

## From research to products

Research should reach `harness` and `metaharness` as a testable transfer package:

1. the claim and its confidence;
2. the evidence and known counterevidence;
3. the task and risk conditions where it should apply;
4. the behavior or interface it suggests;
5. an evaluation capable of detecting improvement and regression;
6. expected safety, quality, latency, cost, and operator-attention effects.

`harness` is where principles can shape the agent loop, tool round trips, approvals, budgets, and run
artifacts. `metaharness` is where they can shape external control, observability, steering, hermetic
execution, comparative evaluation, and reproducibility. The products remain free to reject a proposal
when evidence from implementation contradicts it; that contradiction returns here as research input.

## What this repository is not

This is not:

- a collection of generic AI advice or vendor marketing claims;
- a standards index without analysis;
- a benchmark leaderboard detached from real work;
- a place to make product claims sound scientific after the decision was already made;
- the implementation home for `harness`, `metaharness`, or domain-specific agents;
- permission to experiment on production systems, customers, or private data without explicit
  authority and safeguards.

## Success

The repository succeeds when its principles predict important failures, explain observed successes,
survive serious attempts to disprove them, and improve decisions in real agentic systems.

The ultimate measure is not the number of documents or principles. It is whether our systems complete
more valuable work with less supervision while producing fewer unsafe, incorrect, wasteful, or
unexplained outcomes—and whether we can show why.
