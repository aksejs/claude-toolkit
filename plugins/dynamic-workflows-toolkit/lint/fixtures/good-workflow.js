export const meta = {
  name: 'review-changes',
  description: 'Review changed files across dimensions, verify each finding',
  phases: [{ title: 'Find' }, { title: 'Verify' }],
};

const DIMENSIONS = [{ key: 'bugs', prompt: '...' }, { key: 'perf', prompt: '...' }];

const results = await pipeline(
  DIMENSIONS,
  (d) => agent(d.prompt, { phase: 'Find', schema: {} }),
  (review) =>
    parallel(
      review.findings.map((f) => () =>
        agent('verify ' + f.title, { phase: 'Verify', schema: {} }).then((v) => ({ ...f, verdict: v }))
      )
    )
);

const confirmed = results.flat().filter(Boolean);

const bugs = [];
while (budget.total && budget.remaining() > 50000) {
  const r = await agent('find bugs', { schema: {} });
  bugs.push(...r.bugs);
}

return { confirmed, bugs };
