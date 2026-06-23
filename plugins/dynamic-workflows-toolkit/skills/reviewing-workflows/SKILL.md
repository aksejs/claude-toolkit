---
name: reviewing-workflows
description: Use when reviewing, validating, or linting a Claude Code dynamic workflow script before running it. Runs the workflow-lint ruleset to catch sandbox violations (Date.now/Math.random/new Date/fs/shell) and points out the structural anti-patterns (misused parallel barriers, schema-less agents) that the runtime will not flag until too late.
---

# Reviewing / linting dynamic workflows

Workflows are JavaScript, so — unlike prose skills — they can be checked **statically**, before spending a single token running them. This skill lints a workflow script.

## Run the linter

The ruleset `workflow-lint.yml` ships next to this `SKILL.md`. With [semgrep](https://semgrep.dev) installed, from this skill's directory:

```bash
semgrep --config workflow-lint.yml path/to/your-workflow.js
```

When installed as a plugin, the file lives at
`plugins/dynamic-workflows-toolkit/skills/reviewing-workflows/workflow-lint.yml`
(also reachable via `$CLAUDE_PLUGIN_ROOT` if that variable is set in your environment).

## What it catches today (static, deterministic)

Sandbox violations that make a workflow throw at runtime or silently break resume:

- `Date.now()`, argless `new Date()`, `Math.random()` — banned, they break resume
- `require('fs')` / `import … from 'fs'`, and `child_process` — no filesystem or shell in the orchestration script (do that work inside an `agent()`)

## What to check by hand (roadmap: ESLint AST rules)

The high-value *structural* smells need real AST analysis and are coming as ESLint custom rules:

- `parallel()` used where `pipeline()` belongs — a barrier with no cross-item dependency just wastes wall-clock
- missing `.filter(Boolean)` after `parallel` / `pipeline`
- an `agent()` whose result is used as structured data without a `schema`
- `while (budget.remaining() …)` with no `budget.total` guard (infinite-loop footgun)
- `meta` that is not a pure literal, or `parallel`/`pipeline` calls whose array can exceed 4096 items

## Dry-run (roadmap)

A mock-runner that executes the workflow with `agent()` / `parallel()` / `pipeline()` stubbed to return canned schema-shaped data, and the banned globals replaced by throwing stubs — validating control flow for **zero tokens**. Tracked in the plugin README.

## Why this exists

The Workflow runtime already throws on some of these at run time — but the linter catches them **before you run / in CI**, and flags the structural smells the runtime never complains about. See **writing-workflows** for how to author them correctly in the first place.
