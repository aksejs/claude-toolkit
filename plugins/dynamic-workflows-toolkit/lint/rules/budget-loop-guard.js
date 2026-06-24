'use strict';

/**
 * A loop driven by `budget.remaining()` or `budget.spent()` must ALSO reference
 * `budget.total` in its test. With no token target, `budget.total` is null and
 * `budget.remaining()` is Infinity, so an unguarded loop runs to the 1000-agent
 * cap. Correct form: `while (budget.total && budget.remaining() > 50_000) {...}`.
 *
 * Known limitation: only the loop TEST is scanned, and the guard must reference
 * `budget.total` directly (not via an aliased variable). The canonical idiom is
 * inline, so this is a deliberate precision/simplicity trade-off.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'a budget-driven loop must guard on budget.total',
    },
    schema: [],
    messages: {
      unguarded:
        'Loop uses `budget.{{method}}()` without also checking `budget.total`. With no target, budget.remaining() is Infinity and this loop runs to the 1000-agent cap. Guard it: `while (budget.total && ...)`.',
    },
  },
  create(context) {
    function scanBudget(root) {
      const res = { remaining: false, spent: false, total: false };
      const seen = new Set();
      (function walk(n) {
        if (!n || typeof n !== 'object' || seen.has(n)) return;
        seen.add(n);
        if (
          n.type === 'MemberExpression' &&
          !n.computed &&
          n.object && n.object.type === 'Identifier' && n.object.name === 'budget' &&
          n.property && n.property.type === 'Identifier'
        ) {
          if (n.property.name === 'remaining') res.remaining = true;
          if (n.property.name === 'spent') res.spent = true;
          if (n.property.name === 'total') res.total = true;
        }
        for (const key in n) {
          if (key === 'parent' || key === 'loc' || key === 'range' || key === 'start' || key === 'end') continue;
          const v = n[key];
          if (Array.isArray(v)) {
            for (const item of v) walk(item);
          } else if (v && typeof v === 'object' && typeof v.type === 'string') {
            walk(v);
          }
        }
      })(root);
      return res;
    }

    function check(node) {
      if (!node.test) return;
      const b = scanBudget(node.test);
      if ((b.remaining || b.spent) && !b.total) {
        context.report({
          node: node.test,
          messageId: 'unguarded',
          data: { method: b.remaining ? 'remaining' : 'spent' },
        });
      }
    }

    return {
      WhileStatement: check,
      DoWhileStatement: check,
      ForStatement: check,
    };
  },
};
