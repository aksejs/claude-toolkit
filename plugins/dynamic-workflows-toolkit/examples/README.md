# Example workflows

Lint-clean reference workflows. Copy one into `~/.claude/workflows/<name>.js` to install it as a `/<name>` named workflow you can invoke and rerun verbatim.

## beads-swarm.js

A **pull / worker-swarm** that drains a [beads](https://github.com/gastownhall/beads) ready-queue. It spawns N worker agents; each loops `bd ready --json` → atomically **claim** the top issue → do it → `bd update` → push ("land the plane") → repeat until the queue is empty. beads' atomic claim makes the parallel workers race-free, so the orchestration script itself stays tiny.

- Worker count scales to the token target (`budget.total`) when one is set, else defaults to 4.
- The orchestration script is sandbox-pure; every `bd` call happens inside the worker agents (which have tools) — never in the script.

**Verified lint-clean** by this plugin's own linters:

- ESLint (`require-meta-export`, `meta-literal`, `budget-loop-guard`) → 0 errors
- semgrep sandbox bans → no matches

### Install

```bash
cp beads-swarm.js ~/.claude/workflows/beads-swarm.js
# then, in Claude Code:
/beads-swarm
```

Adjust the `bd` flags in the worker prompt to match your beads version (`bd --help`) or use the beads MCP tools.

> Design note: this is the **pull** model (workers self-serve via atomic claim — simplest, self-balancing). A **planned/wave** variant (scout `bd ready` → allocate the frontier deterministically → re-scout) is only worth it if you need predetermined issue→agent assignment or strict ordering. Start here.
