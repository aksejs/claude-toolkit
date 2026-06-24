'use strict';

const { RuleTester } = require('eslint');
const babelParser = require('@babel/eslint-parser');
const requireMeta = require('../rules/require-meta-export');
const metaLiteral = require('../rules/meta-literal');
const budgetGuard = require('../rules/budget-loop-guard');

// Mirror the real eslint.config.js: workflow scripts mix ESM export with
// top-level await + top-level return, which only Babel's parser accepts.
const rt = new RuleTester({
  languageOptions: {
    parser: babelParser,
    parserOptions: {
      requireConfigFile: false,
      sourceType: 'module',
      babelOptions: {
        parserOpts: { allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true },
      },
    },
  },
});

rt.run('require-meta-export', requireMeta, {
  valid: [
    "export const meta = { name: 'w', description: 'd' };\nconst x = 1;",
    // Regression lock: realistic workflow body (top-level await + return) must parse.
    "export const meta = { name: 'w', description: 'd' };\nconst x = await agent('go');\nreturn { x };",
  ],
  invalid: [
    { code: 'const x = 1;', errors: [{ messageId: 'missingMeta' }] },
    { code: "const meta = { name: 'w' };", errors: [{ messageId: 'missingMeta' }] },
  ],
});

rt.run('meta-literal', metaLiteral, {
  valid: [
    "export const meta = { name: 'w', description: 'd', phases: [{ title: 'A' }, { title: 'B' }] };",
    'export const meta = { n: -1, ok: true, nothing: null };',
  ],
  invalid: [
    { code: "const NAME = 'w';\nexport const meta = { name: NAME };", errors: [{ messageId: 'notLiteral' }] },
    { code: "export const meta = { ...base, name: 'w' };", errors: [{ messageId: 'notLiteral' }] },
    { code: 'export const meta = { name: getName() };', errors: [{ messageId: 'notLiteral' }] },
    { code: 'export const meta = { name: `hi ${x}` };', errors: [{ messageId: 'notLiteral' }] },
    { code: 'export const meta = { phases: [{ title: T }] };', errors: [{ messageId: 'notLiteral' }] },
  ],
});

rt.run('budget-loop-guard', budgetGuard, {
  valid: [
    'while (budget.total && budget.remaining() > 50000) { x++; }',
    'while (running) { x++; }',
    'for (let i = 0; i < 10; i++) { x++; }',
    // budget used only for logging in the body, not driving the loop — must NOT fire.
    'while (running) { log(budget.remaining()); }',
  ],
  invalid: [
    { code: 'while (budget.remaining() > 50000) { x++; }', errors: [{ messageId: 'unguarded' }] },
    { code: 'while (budget.spent() < 100000) { x++; }', errors: [{ messageId: 'unguarded' }] },
    { code: 'for (; budget.remaining() > 0; ) { x++; }', errors: [{ messageId: 'unguarded' }] },
  ],
});

console.log('OK: all RuleTester suites passed.');
