'use strict';
const workflowLint = require('./index.js');
const babelParser = require('@babel/eslint-parser');

// Workflow scripts are executed inside an async wrapper, so they legally mix
// ESM `export` with top-level `await` and top-level `return`. espree can't parse
// that combo (globalReturn is incompatible with module mode), so we use Babel's
// parser with allowReturnOutsideFunction.
module.exports = [
  {
    files: ['fixtures/**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: 'module',
        babelOptions: {
          parserOpts: {
            allowReturnOutsideFunction: true,
            allowAwaitOutsideFunction: true,
          },
        },
      },
    },
    plugins: { 'workflow-lint': workflowLint },
    rules: {
      'workflow-lint/require-meta-export': 'error',
      'workflow-lint/meta-literal': 'error',
      'workflow-lint/budget-loop-guard': 'error',
    },
  },
];
