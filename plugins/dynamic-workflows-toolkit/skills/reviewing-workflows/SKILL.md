---
name: reviewing-workflows
description: Use when reviewing, validating, or linting a Claude Code dynamic workflow script before running it. Runs the semgrep sandbox-ban ruleset and the ESLint structural rules (in lint/) to catch sandbox violations (Date.now/Math.random/new Date/fs/shell), a missing or non-literal meta, and unguarded budget loops — before you spend a single token running the workflow.
---

# Reviewing / linting dynamic workflows

Workflows are JavaScript, so — unlike prose skills — they can be checked **statically**, before spending a single token running them. Two linters ship with this plugin.

## 1. Sandbox bans (semgrep)

`workflow-lint.yml` ships next to this `SKILL.md`. With [semgrep](https://semgrep.dev) installed:

```bash
semgrep --config workflow-lint.yml path/to/your-workflow.js
```

Catches the sandbox violations that throw at runtime or break resume: `Date.now()`, argless `new Date()`, `Math.random()`, `fs`, `child_process`.

## 2. Structural rules (ESLint)

The ESLint plugin in `../../lint/` adds structural checks semgrep can't:

- `require-meta-export` — the script has no `export const meta`
- `meta-literal` — `meta` isn't a pure literal (variable, call, spread, computed key, or template interpolation)
- `budget-loop-guard` — a `budget.remaining()` / `budget.spent()` loop with no `budget.total` guard

```bash
cd ../../lint && npm install && npm run lint:example   # demo on fixtures/
# then point eslint.config.js's `files` glob at your own workflow to lint it
```

**Important:** workflow scripts mix ESM `export` with top-level `await` / `return`, so the config uses `@babel/eslint-parser` with `allowReturnOutsideFunction`. Plain espree errors with `'return' outside of function`.

## Still check by hand (roadmap)

Needs data-flow analysis, not yet automated:

- `parallel()` used where `pipeline()` belongs — a barrier with no cross-item dependency just wastes wall-clock (not statically decidable; see **writing-workflows**)
- missing `.filter(Boolean)` after `parallel` / `pipeline`
- an `agent()` result used as structured data without a `schema`

## Why this exists

The Workflow runtime already throws on some of these at run time — but the linters catch them **before you run / in CI**, and flag the structural smells the runtime never complains about. See **writing-workflows** for how to author them correctly in the first place.
