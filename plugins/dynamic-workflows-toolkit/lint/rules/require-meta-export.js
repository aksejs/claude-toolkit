'use strict';

/**
 * Every dynamic workflow script must begin with `export const meta = {...}`.
 * Without it the runtime has no name/description/phases for the workflow.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require an exported `meta` object in a dynamic workflow script',
    },
    schema: [],
    messages: {
      missingMeta:
        'Workflow scripts must `export const meta` — an object literal with at least `name` and `description`.',
    },
  },
  create(context) {
    let hasMeta = false;
    return {
      ExportNamedDeclaration(node) {
        const decl = node.declaration;
        if (decl && decl.type === 'VariableDeclaration') {
          for (const d of decl.declarations) {
            if (d.id && d.id.type === 'Identifier' && d.id.name === 'meta') {
              hasMeta = true;
            }
          }
        }
      },
      'Program:exit'(node) {
        if (!hasMeta) {
          context.report({ node, messageId: 'missingMeta' });
        }
      },
    };
  },
};
