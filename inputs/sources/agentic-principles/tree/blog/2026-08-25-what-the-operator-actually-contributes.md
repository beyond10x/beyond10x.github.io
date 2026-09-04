---
title: We read 100 agent sessions to find out what the human actually contributes
description: A transcript study of 1,567 human turns in coding-agent sessions, separating the turns that carried information from the turns that only carried permission.
authors: [b10x-author-01]
tags: [transcripts, automation, human-in-the-loop, measurement]
---

The median instruction given to a coding agent in our sample is **eleven words long** and sets off
**eight tool calls**. That ratio is the whole economics of agentic work in one line: a very small
amount of human input steering a very large amount of machine work.

So we went looking for the obvious follow-up question. Of those eleven words — how many mattered?

{/* truncate */}

## The question

Any team running agents at volume eventually asks where to put the automation boundary. The honest
version of the question is uncomfortable: **which of the human's turns carry information the agent
could not have obtained, and which are ceremony — permission, nudging, repetition — that a script or
a fixed policy could emit instead?**

We can now answer it with numbers rather than vibes, because agent harnesses record everything.

## What we measured

We took the 100 most recently active Claude Code sessions from one heavy operator's machine, spanning
twelve days and 22 working directories, and rebuilt each one as a sequence of
`human turn → agent operations → outcome`.

| | |
|---|---|
| sessions | 100 (18 of them already fully headless) |
| human turns | 1,567 |
| agent messages | 33,327 |
| tool calls | 33,293 |
| wall-clock | 673 h elapsed, 222 h with gaps over 5 min removed |
| compute | ~$10,200 at API list prices (these ran on a subscription; this is an equivalence, not a bill) |

Two things in that table are worth pausing on. Agent messages and tool calls are nearly **1:1** —
almost every turn the model takes, it takes an action. And 18 sessions had no human in them at all;
that is the automation baseline this operator had already built before anyone measured anything.

**On method.** Counts, costs, latencies and sequence motifs are *observed* — read directly off the
transcripts. The labels on each human turn (intent, motivation, what information it carried, whether
it could be replaced) are *inferred* by an LLM classifier over a closed taxonomy, and they are
judgements, not measurements. We keep the two apart everywhere below, and we spot-checked labels
against raw turn text before trusting them.

## The shape of a turn

| metric | value |
|---|---|
| median human turn | 11 words / 65 characters |
| turns under 10 words | 44% |
| median tool calls triggered | 8 |
| turns triggering no tool at all | 15% |
| turns that interrupted a running agent | 1% |

And the number that reframes the problem:

> The agent spent **229 hours idle waiting for a human to reply** — **34% of all session wall-clock**.
> Median wait after the agent stops: **2 minutes**. Ninth decile: **21 minutes**.

A third of the elapsed time of agentic work, in this sample, was the machine waiting for a person to
read something and type a short reply. That is the cost being paid for whatever the human turns
contribute. So: what do they contribute?

## What the turns were

| intent | share |
|---|---|
| open new work | 21% |
| approve / green-light | 12% |
| narrow or expand scope | 9% |
| manage the agent itself (context, config, tooling) | 9% |
| ask a question | 8% |
| correct an agent error | 8% |
| supply outside information | 8% |
| commit / push / release chores | 6% |
| "keep going" | 4% |
| ask for status | 4% |

Then we asked a sharper question of each turn: *did it carry anything the agent did not already
have?*

| information contributed | share |
|---|---|
| **nothing new** | **42%** |
| a new goal | 16% |
| state only a human could see | 12% |
| a taste or priority preference | 11% |
| a judgement between options the agent had already surfaced | 10% |
| domain knowledge the agent lacked | 8% |

Nearly half of all human turns added no information to the conversation. Widen it slightly — include
pure approvals, status requests and continuation nudges — and **48% of turns (748 of 1,567) carried
no new information**, arriving in 355 consecutive runs, the longest of them nine turns deep.

## Which turns could be replaced

The classifier judged each turn against four options: a deterministic rule could have emitted it, a
fixed agent policy could have, another AI with context could have, or it genuinely needed the human.

| replaceable by | share |
|---|---|
| human only | 44% |
| a fixed agent policy | 23% |
| a deterministic rule | 20% |
| another AI with context | 14% |

**43% of human turns could be produced by a rule or a policy.** Not "eventually" — from the
transcript alone, with the trigger visible.

The interesting part is *which* intents concentrate the removable turns:

| intent | n | % a rule or policy could emit |
|---|---|---|
| manage the agent itself | 136 | **73%** |
| approve / green-light | 190 | **61%** |
| ask a question | 130 | 35% |
| open new work | 324 | 19% |
| narrow or expand scope | 145 | 8% |

Two clusters are almost pure overhead. **Context management** — compacting, clearing, re-orienting the
agent after it lost the thread — is the agent's own housekeeping, delegated upward to a human who
notices before it does. And **approval** is mostly a human saying yes to something they were always
going to say yes to.

Scope refinement goes the other way: only 8% of those turns reduce to a rule or a policy, and 70%
were judged to need the human outright. That is the reassuring half of the result. Deciding *what*
and *how much* survives automation. Deciding *whether to proceed with the thing you already asked
for* does not.

## The repair tax

**20% of human turns (313) existed only because the agent erred or stopped short.** The dominant
cause was not wrong answers:

| friction | share of turns |
|---|---|
| agent stopped short of the task | 18% |
| agent got something wrong | 7% |
| missing context | 3% |
| tool failure | 3% |
| ambiguous instruction | 1% |

Omission outweighs error two and a half to one. The operator's most common corrective act is not "that's wrong",
it is "you didn't finish". Tone tracks this: 44% of turns read as terse and pressing, 5% as
frustrated.

## Does more human involvement produce better outcomes?

| human turns in session | n | success | partial | abandoned / failed | open-ended |
|---|---|---|---|---|---|
| 0 (headless) | 18 | 10 | – | 6 | 2 |
| 1–3 | 26 | 17 | – | 8 | 1 |
| 4–10 | 16 | 6 | 9 | 1 | – |
| 11–30 | 21 | 6 | 13 | 2 | – |
| 31+ | 19 | **2** | **17** | – | – |

Sessions with more than thirty human turns finished cleanly twice out of nineteen.

We are **not** claiming that talking to the agent more makes it worse. The obvious competing
explanation is confounding by difficulty: hard, sprawling, poorly specified work attracts both more
human turns and worse outcomes. That explanation is at least as consistent with this table as any
causal story, and this study cannot separate them.

What the table does support is narrower and still useful: **a long human-turn count is an early
distress signal**, not a sign of diligence. A session past its twentieth human turn is, empirically,
a session in trouble — and something should notice that and say so.

## From turns to workflows

Grouping sessions by the shape of the work gives a small, repeating catalogue: incident
investigation, agent-harness tuning, greenfield scaffolding, refactor sweeps, review-and-gate runs,
backlog grooming, multi-agent fan-out, release cuts. Thirteen named archetypes plus a catch-all
cover all 100 sessions; the six largest named ones cover 63 of them.

Judged per session, **64 of 100 could run unattended or with a small number of gates**. The gates
that survive scrutiny fall into exactly four categories, and they are worth naming because they are
the actual specification for a human-in-the-loop design:

1. **Irreversible writes** — production changes, published artifacts, anything with no undo.
2. **Outward-facing communication** — a message that goes to a customer or a colleague under someone's name.
3. **Priority and taste calls** — which of these three defensible options we want.
4. **Facts from outside the machine** — what a person said, what a dashboard showed, what the device did.

Everything else in the observed recipes — resolving the trigger, gathering context, running the gate,
reading the failure, patching, re-running, committing, reporting — appeared in the transcripts as
mechanical work that a human was narrating rather than performing.

## Limitations

One operator, one harness, twelve days, one machine's habits. The corpus skews toward infrastructure
and agent-tooling work and contains almost no greenfield product code. The replaceability labels are
an LLM's opinion about a single turn in context; that classifier does not know what an automated
replacement would have cost, or what it would have broken. The outcome-versus-turn-count table is
confounded as described. And the analysis of these sessions was itself performed by an agent of the
same family as the one under study — which is either efficient or a conflict of interest, depending
on how the next replication goes.

## What we would test next

The cheapest falsification is a **turn-count tripwire**: have the harness announce, at the twentieth
human turn, that this session is now in the population that historically finishes partial, and offer
to restate the goal from scratch. If outcomes do not move, the distress-signal reading is wrong and
the confound was the whole story.

The second is a **default-approval policy** for the 61% of approvals the classifier called removable:
state the intended action with its default, act after a fixed pause unless contradicted, and keep a
hard stop on the four gate categories above. That converts approval from a blocking request into a
revocable one — and reclaims most of a third of the wall-clock.
