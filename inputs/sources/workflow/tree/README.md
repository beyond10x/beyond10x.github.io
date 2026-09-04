# Workflow

Workflow is the standalone, generated Rust service for user-maintained workflow definitions and
immutable revisions. Authors edit draft directed acyclic graphs, publish canonical snapshots, and
activate an owned revision. Tenant, authority, and optional realm come only from Identity.

## Current status

Version 0.3.0 replaces the former `WorkflowId` placeholder. The ESS model, runtime annotations,
generated `WorkflowClient`, Identity-authenticated HTTP server, OpenAPI, Connector contribution,
and conformance scenarios are one deterministic package rooted at [`service.yaml`](service.yaml).
Service SDK also generates the executable host, durable SQLite lifecycle, ESS component/build/
runtime IR, BuildKit graph, and configuration-neutral Helm chart. There is no handwritten host,
Dockerfile, service/client adapter, or compatibility path for the predecessor or the 0.1.0 crate.

Semantic node kinds are closed to `compute`, `read`, `call`, `judge`, `wait`, `invoke`, `emit`, and
`complete`. Layout coordinates remain a product concern and are not persisted in semantic graphs.
All mutations carry optimistic concurrency and idempotency. Nodes must be disconnected before
removal; connections refuse missing endpoints, self edges, duplicates, and cycles. Publishing
freezes ordered node/edge data with a deterministic digest; published revisions are never edited.

The HTTP resource audience is exactly `urn:b10x:workflow`. Reads require `workflows.read`, while
draft authoring, publishing, and activation require `workflows.manage`. Verification and exact scope
authorization happen before operation JSON is decoded.

Build and validate the boundary that exists today:

```bash
task check
```

Execution, triggers, schedules, leases, cancellation, and revision deletion remain planned.

<!-- b10x-docs:start -->
## Documentation

[Workflow documentation](https://beyond10x.github.io/docs/workflow/) · [Start](https://beyond10x.github.io/) · [Ecosystem](https://beyond10x.github.io/ecosystem/) · [Impact](https://beyond10x.github.io/changes/) · [Releases](https://beyond10x.github.io/releases/)
<!-- b10x-docs:end -->
