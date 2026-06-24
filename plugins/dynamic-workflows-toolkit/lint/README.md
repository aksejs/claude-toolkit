# eslint-plugin-workflow-lint

ESLint rules for [Claude Code dynamic workflow](https://code.claude.com/docs/en/workflows) scripts — the structural checks the semgrep sandbox-ban ruleset can't do.

## Rules

| Rule | Catches |
|------|---------|
| `require-meta-export` | a script with no `export const meta` |
| `meta-literal` | a `meta` that isn't a pure literal (variables, calls, spreads, computed keys, template interpolation) |
| `budget-loop-guard` | a loop driven by `budget.remaining()` / `budget.spent()` with no `budget.total` guard (the infinite-loop-to-1000-agents footgun) |

## Run it

```bash
npm install
npm test              # RuleTester valid/invalid suites for every rule
npm run lint:example  # run the rules on fixtures/
```

## Parser note (important)

Workflow scripts legally mix ESM `export` with **top-level `await` and top-level `return`** (the runtime wraps them in an async function). espree cannot parse that combo — it errors with `'return' outside of function`. This plugin's `eslint.config.js` uses `@babel/eslint-parser` with `allowReturnOutsideFunction`; copy that parser config or your real workflows won't lint.

## Verified

- `npm test` → RuleTester valid/invalid fixtures for every rule, incl. a top-level-`return` regression lock
- `fixtures/good-workflow.js` → **0 errors** (no false positives on a realistic workflow)
- `fixtures/bad-workflow.js` → **2 errors**

## Deliberately NOT included (and why)

These need data-flow / scope analysis to do without false positives, so they are roadmap rather than shipped half-working:

- **`prefer-pipeline-over-parallel`** — you cannot tell from the AST whether a `parallel()` barrier has a real cross-item dependency. A static rule here would be a false-positive machine; it's covered by the `writing-workflows` skill's guidance instead.
- **`filter-boolean-after-parallel`** — needs to track the result of `await parallel()/pipeline()` through variables to its `.map()` / access site.
- **`agent-result-needs-schema`** — needs data-flow to know whether an `agent()` result is used as structured data.
- **mock-runner dry-run** — execute the workflow with stubbed `agent()/parallel()/pipeline()` and throwing banned globals, for zero-token control-flow validation.
