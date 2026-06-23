# dynamic-workflows-toolkit

Tools for authoring, linting, and shipping [Claude Code dynamic workflows](https://code.claude.com/docs/en/workflows).

## Skills

- **writing-workflows** — how to author a correct, idiomatic dynamic workflow: when one is justified, the `agent()` / `pipeline()` / `parallel()` primitives, the sandbox rules, structured output, and the canonical fan-out → verify pattern.
- **reviewing-workflows** — lint a workflow *before* you run it. Ships `workflow-lint.yml`, a semgrep ruleset that catches sandbox violations statically.

## Install

```
/plugin marketplace add aksejs/claude-toolkit
/plugin install dynamic-workflows-toolkit@claude-toolkit
/reload-plugins
```

Skills are namespaced once installed: `/dynamic-workflows-toolkit:writing-workflows`.

## Why

Dynamic workflows are JavaScript, so — unlike prose skills — they can be **validated statically** before you spend a single token running them. The runtime already throws on some sandbox violations at run time; the linter catches them earlier (in CI / before a run) and flags the *structural* smells the runtime never complains about.

## Roadmap

- [ ] ESLint custom rules for structural smells (parallel-vs-pipeline barrier misuse, missing `.filter(Boolean)`, schema-less `agent()` results, unguarded `budget` loops, non-literal `meta`, >4096-item calls)
- [ ] `RuleTester` fixtures (valid + invalid) for every rule
- [ ] Mock-runner: dry-run a workflow with stubbed `agent()` / `parallel()` / `pipeline()` and throwing stubs for banned globals — zero-token control-flow validation
- [ ] Example workflows (including a beads-aware queue-draining swarm)
