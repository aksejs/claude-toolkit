'use strict';

/**
 * eslint-plugin-workflow-lint — static checks for Claude Code dynamic workflow
 * scripts. Pair with the semgrep ruleset (sandbox bans) for full coverage.
 */
const plugin = {
  meta: { name: 'workflow-lint', version: '0.1.0' },
  rules: {
    'require-meta-export': require('./rules/require-meta-export'),
    'meta-literal': require('./rules/meta-literal'),
    'budget-loop-guard': require('./rules/budget-loop-guard'),
  },
};

// Flat-config preset that turns all rules on as errors.
plugin.configs = {
  recommended: {
    plugins: { 'workflow-lint': plugin },
    rules: {
      'workflow-lint/require-meta-export': 'error',
      'workflow-lint/meta-literal': 'error',
      'workflow-lint/budget-loop-guard': 'error',
    },
  },
};

module.exports = plugin;
