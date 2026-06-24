# dynamic-workflows-toolkit

Tools for authoring, linting, and shipping [Claude Code dynamic workflows](https://code.claude.com/docs/en/workflows).

## Skills

- **writing-workflows** — how to author a correct, idiomatic dynamic workflow: when one is justified, the `agent()` / `pipeline()` / `parallel()` primitives, the sandbox rules, structured output, and the canonical fan-out → verify pattern.
- **reviewing-workflows** — lint a workflow *before* you run it. Drives the linters in [`lint/`](lint/).

## Linters (`lint/`)

- **semgrep** `skills/reviewing-workflows/workflow-lint.yml` — sandbox bans (`Date.now` / argless `new Date` / `Math.random` / `fs` / `child_process`).
- **ESLint** `lint/` — structural rules semgrep can't do: `require-meta-export`, `meta-literal`, `budget-loop-guard`. Tested with `RuleTester` + realistic good/bad fixtures (`cd lint && npm install && npm test`).

## Examples (`examples/`)

- **[beads-swarm.js](examples/beads-swarm.js)** — a beads-aware worker-swarm that drains a ready-queue via atomic claim. Verified lint-clean by the linters above.

## Install

```
/plugin marketplace add aksejs/claude-toolkit
/plugin install dynamic-workflows-toolkit@claude-toolkit
/reload-plugins
```

Skills are namespaced once installed: `/dynamic-workflows-toolkit:writing-workflows`.

## Why

Dynamic workflows are JavaScript, so — unlike prose skills — they can be **validated statically** before you spend a single token running them. The runtime already throws on some sandbox violations at run time; the linters catch them earlier (in CI / before a run) and flag the *structural* smells the runtime never complains about.

## Status

- [x] semgrep sandbox-ban ruleset
- [x] ESLint `require-meta-export`, `meta-literal`, `budget-loop-guard` — with `RuleTester` fixtures and verified good/bad example workflows
- [x] `@babel/eslint-parser` config so real workflows (ESM export + top-level `await`/`return`) actually parse
- [x] Example workflow: beads-aware queue-draining swarm ([examples/beads-swarm.js](examples/beads-swarm.js)) — dogfooded lint-clean
- [ ] ESLint data-flow rules: `filter-boolean-after-parallel`, `agent-result-needs-schema` (need scope/data-flow analysis)
- [ ] Mock-runner: dry-run a workflow with stubbed `agent()` / `parallel()` / `pipeline()` for zero-token control-flow validation

> Deliberately not built: a `prefer-pipeline-over-parallel` rule — barrier misuse isn't statically decidable without false positives, so it lives in the `writing-workflows` guidance instead.
