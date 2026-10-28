---
title: Fix the source, not the adopter
description: An incident-derived seed about repairing owned shared tooling instead of institutionalizing its defects downstream.
sidebar_label: Fix the source, not the adopter
sidebar_position: 2
---

# Fix the source, not the adopter

- **Status:** seed
- **Created:** 2026-08-25T00:57:15+02:00
- **Evidence class:** observed single incident with causal interpretation

## Research question

When an agent discovers that a shared component does not honor its declared configuration, should it
repair that component or reshape the adopting repository around the defect?

This matters because an expedient workaround can silently become architecture. In a software factory,
that choice affects every later adopter, the incentives to repair shared infrastructure, and the amount
of configuration knowledge duplicated across repositories.

## Observation

The `protocol artifact` commands located the planning store through `.engineering/project.yaml`, but
loaded lifecycle and template documents from an independently defaulted repository root. Instead of
repairing that inconsistent root resolution in `engineering-protocols`, the agent copied the upstream
protocol tree into the top level of `agentic-principles` so unqualified commands would work.

The workaround made one adopter conform to a tooling defect. It also introduced unrelated directories,
duplicated upstream material, obscured the intended `.engineering` loading boundary, and removed the
immediate pressure to correct a root component used by future adopters. The operator rejected this as
technical debt that preserved the shared component's mistake and impeded progress in the stack.

## Candidate principle

> When an agent encounters a defect in a shared upstream component that is within its authority and
> practical ability to change, it should repair the defect at its source instead of encoding the defect
> as downstream architecture.

This is a seed, not yet a supported principle.

## Proposed mechanism

A downstream workaround optimizes the current symptom while distributing the upstream defect's false
assumptions. Each adopter then gains local configuration, compatibility behavior, and migration cost.
The original component receives less corrective pressure, while divergence makes a later repair more
expensive. A source correction instead restores the declared abstraction once and lets adopters remain
organized around their own concerns.

## Scope and boundary conditions

The preference applies when the behavior is a defect rather than a deliberate compatibility contract,
the shared component is in scope, and a source change can be tested in proportion to its blast radius.
It does not require an unsafe or unbounded detour during an incident, nor does it grant authority over an
external dependency.

A temporary workaround can be justified when the source is unavailable, the repair exceeds the task's
authority or time budget, compatibility must be preserved during migration, or immediate containment is
necessary. In that case the workaround should be explicit, minimal, linked to the source defect, assigned
an expiry or removal condition, and designed not to masquerade as the desired architecture.

## Operational consequence

Before adding adopter-side structure in response to a tool limitation, an agent should:

1. compare the observed behavior with the component's declared configuration or contract;
2. determine whether the source component is owned, reachable, and safe to change;
3. estimate the blast radius and regression test needed for a source repair;
4. prefer the smallest tested source correction when it is in scope;
5. treat any necessary workaround as temporary debt with a removal condition, not as a design premise.

Agent review should flag a workaround that duplicates an upstream subsystem, exposes internal loader
structure in an adopter, or exists only because a configured path is ignored.

## Counter-pressure and possible failure modes

- An agent can misuse “fix it at the source” to expand a bounded task into an uncontrolled platform
  rewrite.
- A local workaround may be lower risk when the shared component has many consumers and weak tests.
- What appears to be a bug may be an undocumented compatibility constraint.
- Repairing a source without coordinating its consumers can create a larger regression than the local
  workaround.

The principle therefore needs an authority, proportionality, and regression-evidence condition; it is
not a blanket preference for broad refactoring.

## Falsifiable hypothesis

For defects in internally owned shared tooling, source repairs with regression coverage will produce
less adopter-specific configuration and fewer repeated integration failures than permanent adopter-side
workarounds, without increasing escaped regressions beyond an agreed threshold.

Evidence against the hypothesis would include repeated cases where tested source repairs cause greater
total migration and failure cost than contained workarounds, or where the supposed defect is consistently
shown to be a necessary consumer-specific contract.

## Next evidence

Complete the present source repair, add a regression test that reproduces the adopter configuration,
then remove the copied top-level tree and verify unqualified commands in `agentic-principles`. Record the
diff in adopter structure and whether any other consumer behavior regresses. Later, sample similar
cross-repository integration incidents to test whether the mechanism generalizes.
