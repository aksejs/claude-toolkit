export const meta = {
  name: 'beads-swarm',
  description:
    'Drain the beads ready-queue with a swarm of worker agents that atomically claim, do, update, and push issues until the queue is empty.',
  phases: [{ title: 'Swarm' }],
};

// Size the swarm: scale to the token target if one was set, else a sane default.
const WORKERS = budget.total
  ? Math.min(8, Math.max(2, Math.floor(budget.total / 150000)))
  : 4;

phase('Swarm');

const WORKER = `You are one worker draining the beads ready-queue. Loop until it is empty:

1. List ready (unblocked, priority-sorted) work: \`bd ready --json\`.
2. If nothing is returned, STOP and report the issue IDs you completed — the queue is drained.
3. Atomically claim the top issue (e.g. \`bd claim <id>\`). If the claim fails because another worker took it, move to the next ready issue.
4. Do the work the issue describes — make the real code/file changes.
5. Mark it done (e.g. \`bd update <id> --status done\`), or reopen with a note if you were blocked.
6. Land the plane: commit and push so work is never left unpushed locally.
7. Repeat from step 1.

Claim exactly one issue at a time and never touch an issue you have not claimed. If your beads version uses different flags, run \`bd --help\` or use the beads MCP tools and adapt.`;

const summaries = await parallel(
  Array.from({ length: WORKERS }, (_, i) => () =>
    agent(WORKER, { label: `worker-${i + 1}`, phase: 'Swarm' })
  )
);

const done = summaries.filter(Boolean);
log(`${done.length}/${WORKERS} workers reported in`);

return { workers: WORKERS, reports: done };
