---
name: writing-workflows
description: Use when authoring, editing, or scaffolding a Claude Code dynamic workflow (a JavaScript orchestration script run by the Workflow tool). Covers when a workflow is justified, the agent()/parallel()/pipeline() primitives, the meta block, sandbox constraints, structured output, and the canonical patterns. Pair with reviewing-workflows to lint before running.
---

# Writing dynamic workflows

A dynamic workflow is a **JavaScript program** the Workflow runtime executes to orchestrate many subagents deterministically (loops, fan-out, verify stages). The control flow is code, not an LLM decision — that is the whole point.

## First: do you even need one?

Reach for a workflow only when a task needs more agents than one conversation can coordinate, or when you want the orchestration codified as a readable, rerunnable script. Examples: a codebase-wide bug sweep, a large migration, a research question whose sources must be cross-checked against each other, a hard plan drafted from several independent angles.

**If a single agent can do it serially, do not write a workflow.**

## The shape every workflow must have

Begin with a pure-literal `meta` (no variables, calls, or spreads):

```js
export const meta = {
  name: 'my-workflow',
  description: 'One line shown in the permission dialog',
  phases: [{ title: 'Find' }, { title: 'Verify' }],
}
// body uses agent() / parallel() / pipeline() / phase() / log()
```

## Primitives

- `agent(prompt, opts?)` — spawn one subagent. With `{schema}` it returns a validated object; without, its final text. Returns `null` if it dies, so `.filter(Boolean)`.
- `pipeline(items, stage1, stage2, ...)` — **the default.** Each item flows through every stage independently, with no barrier between stages. Wall-clock = the slowest single item's chain.
- `parallel(thunks)` — a **barrier**: it awaits everything before returning. Use only when a stage genuinely needs ALL prior results at once (dedup, early-exit on zero, cross-item comparison).
- `phase(title)` / `log(msg)` — progress display.

## Rules that bite

- **Default to `pipeline()`.** A barrier is justified only by a real cross-item dependency — not "I need to flatten/map/filter first" (do that inside a stage).
- **Sandbox:** no filesystem, no DB, no network, no shell — and `Date.now()`, `Math.random()`, and argless `new Date()` **throw** (they break resume). Pass timestamps via `args`; vary randomness by index; do all I/O inside agents, which have tools.
- **Structured output:** pass a JSON `schema` to `agent()` instead of parsing text. Validation and retry happen at the tool layer.
- **Budget:** guard loops on `budget.total` — `while (budget.total && budget.remaining() > 50_000)` — or an unbounded loop runs to the 1000-agent cap.
- **Caps:** ≤ 16 concurrent agents; ≤ 4096 items per `parallel()` / `pipeline()` call.

## Canonical pattern — find → verify, pipelined

```js
const results = await pipeline(
  DIMENSIONS,
  d => agent(d.prompt, { phase: 'Find', schema: FINDINGS }),
  review => parallel(review.findings.map(f => () =>
    agent(`Adversarially verify: ${f.title}`, { phase: 'Verify', schema: VERDICT })
      .then(v => ({ ...f, verdict: v })))),
)
return results.flat().filter(Boolean).filter(f => f.verdict?.isReal)
```

Dimension *bugs* findings verify while dimension *perf* is still finding — no wasted wall-clock. That is why this is a `pipeline`, not two `parallel` barriers.

## Before you run it

1. Lint it with the **reviewing-workflows** skill (catches sandbox violations and barrier misuse statically).
2. Run it via the Workflow tool, or save it to `~/.claude/workflows/<name>.js` to **freeze** it as a `/<name>` named workflow you invoke verbatim (deterministic orchestration — author once, do not regenerate).

## Authoring checklist

- [ ] `meta` is a pure literal with `name` + `description`
- [ ] Defaults to `pipeline()`; every `parallel()` barrier has a real cross-item reason
- [ ] No `Date.now()` / `Math.random()` / argless `new Date()` / fs / shell in the script
- [ ] `agent()` results used as data carry a `schema`
- [ ] `.filter(Boolean)` after `parallel` / `pipeline` before mapping
- [ ] Loops guarded on `budget.total`
- [ ] `reviewing-workflows` lint passes clean
