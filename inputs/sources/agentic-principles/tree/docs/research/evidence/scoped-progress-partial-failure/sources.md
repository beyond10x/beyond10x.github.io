---
title: Primary sources for partial-failure research
description: Direct resilience, workflow, and safety sources reviewed for the scoped-progress study.
sidebar_label: Primary-source review
sidebar_position: 3
---

# Primary sources for partial-failure research

- **Accessed:** 2026-08-25
- **Question:** When one capability fails, when should useful work continue?
- **Selection:** Primary standards, first-party reliability guidance, and original research that
  directly addresses degraded operation, failure isolation, workflow dependencies, or agent recovery.

## Sources and extracted claims

### NIST SP 800-160 Volume 2 Revision 1

NIST's December 2021 systems-security engineering guidance defines cyber resilience around the ability
to anticipate, withstand, recover from, and adapt to adverse conditions. Its **Continue** objective is
to maximize the duration and viability of essential functions during adversity, and its discussion
ties that objective to explicit functional dependencies and critical assets. It also states that
resilient systems may operate in a degraded state to carry out mission-essential functions.

- Source: [NIST SP 800-160 Vol. 2 Rev. 1](https://doi.org/10.6028/NIST.SP.800-160v2r1),
  pp. 1, 11–12, 109–110.
- Supports: continue selected essential work; model dependencies and resource status.
- Constrains: continuation is about prioritized essential functions, not maximizing arbitrary
  activity. The publication is normative engineering guidance, not an agent experiment.

### AWS Builders' Library — static stability

AWS separates control-plane changes from data-plane operation. Its static-stability pattern keeps
existing correct operation available when a dependency is impaired, while acknowledging that updates
from the failed dependency may not arrive. This provides a close operational analogue for separating
blocked change actions from unaffected work.

- Source: [Static stability using Availability Zones](https://aws.amazon.com/builders-library/static-stability-using-availability-zones/),
  accessed 2026-08-25.
- Supports: isolate dependency effects; keep already-supported behavior working; prepare the degraded
  path before the incident.
- Constrains: cached state can become stale. Static stability supports known existing behavior more
  strongly than novel actions based on unavailable state.

### Google SRE — cascading failures

Google's SRE guidance frames load shedding and graceful degradation as doing as much useful work as a
system can without exhausting itself. It recommends selective rejection by task or priority rather
than indiscriminate overload. The same chapter warns that rarely exercised degradation paths and naive
retries can create new failure modes and cascading load.

- Source: [Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/),
  especially *Load Shedding and Graceful Degradation* and *Retries*, accessed 2026-08-25.
- Supports: useful work should be selected, bounded, and isolated during impairment.
- Constrains: degraded behavior needs testing, monitoring, disable controls, and retry budgets; more
  activity is not necessarily more useful work.

### Microsoft Azure Architecture Center — bulkheads

Microsoft's bulkhead pattern partitions resources so a failed dependency does not consume the capacity
needed by unrelated services. The guidance says unaffected services can continue, while identifying
cost, performance, management overhead, and over-granular isolation as trade-offs.

- Source: [Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead),
  updated 2026-03-19, accessed 2026-08-25.
- Supports: failure scope should be contained to consumers that use the failed dependency.
- Constrains: isolation has real resource and complexity cost and must follow meaningful boundaries.

### Zhu et al. — fault-tolerant workflow scheduling

Zhu et al. formally model a workflow as a directed acyclic graph whose edges carry task precedence and
data dependencies, then evaluate fault-tolerant scheduling and resource provisioning. The paper is not
about LLM agents, but it supports using dependency structure rather than run-wide state as the unit of
scheduling and recovery analysis.

- Source: Xiaomin Zhu et al., [Fault-Tolerant Scheduling for Real-Time Scientific Workflows with
  Elastic Resource Provisioning in Virtualized Clouds](https://faculty.cc.gatech.edu/~lingliu/papers/2016/FaultTolerantWorkflow.pdf),
  IEEE Transactions on Parallel and Distributed Systems, 2016, §§3 and 6.
- Supports: explicit precedence and resource constraints are necessary for fault-tolerant scheduling.
- Constrains: replicated cloud compute tasks differ from semantic agent work, authority, and external
  effects; the performance findings cannot be transferred directly.

### ToolMaze

ToolMaze evaluates dynamic path discovery and recovery over DAG-shaped tool tasks with explicit versus
implicit and transient versus permanent failures. Its reported results show that tool perturbations
degrade agents broadly, with implicit semantic corruption especially difficult and complex paths
producing trial-and-error loops.

- Source: Dongsheng Zhu et al., [When Tools Fail: Benchmarking Dynamic Replanning and Anomaly Recovery
  in LLM Agents](https://arxiv.org/abs/2606.05806), arXiv:2606.05806v1, 2026.
- Supports: recovery is a distinct agent capability; DAG structure and failure type belong in the
  evaluation; blind retries are an inadequate substitute for replanning.
- Constrains: this is a 2026 preprint over simulated tools. It does not establish that continuing
  independent real-world effects is safe.

### ReliabilityBench

ReliabilityBench injects timeouts, rate limits, partial responses, and schema drift into tool-using
agent tasks and evaluates outcome correctness across repeated and perturbed runs. It reports material
success degradation under stress and treats fault tolerance as separate from happy-path task success.

- Source: Aayush Gupta, [ReliabilityBench: Evaluating LLM Agent Reliability Under Production-Like
  Stress Conditions](https://arxiv.org/abs/2601.06112), arXiv:2601.06112v1, 2026.
- Supports: agent evaluations should inject tool failures and judge end-state equivalence rather than
  answer style alone.
- Constrains: this is a single-author preprint over two agent architectures and four simulated domains;
  its reported rates are not treated as production estimates here.

## Review result

The sources converge on a conditional claim: contain a failure to its actual dependency boundary and
preserve selected useful function, but do not invent an untested fallback or operate across missing
freshness, authority, observability, or consistency guarantees. The literature challenges both global
halt and naive continuation. It supports testing a third policy: dependency-scoped continuation with
explicit barriers, verification, and recovery state.
