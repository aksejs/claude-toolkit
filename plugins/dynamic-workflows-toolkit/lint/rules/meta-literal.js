'use strict';

/**
 * The exported `meta` must be a PURE literal: no variables, function calls,
 * spreads, computed keys, or template interpolation. The runtime reads `meta`
 * before executing the script, so anything dynamic is unavailable / unsafe.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'the exported `meta` object must be a pure literal',
    },
    schema: [],
    messages: {
      notLiteral:
        'meta must be a pure literal — `{{kind}}` is not allowed (no variables, function calls, spreads, computed keys, or template interpolation).',
    },
  },
  create(context) {
    function checkValue(node) {
      if (!node) return;
      switch (node.type) {
        case 'Literal':
          return;
        case 'TemplateLiteral':
          if (node.expressions.length > 0) {
            context.report({ node, messageId: 'notLiteral', data: { kind: 'template interpolation' } });
          }
          return;
        case 'UnaryExpression':
          // allow negative/positive numeric literals like -1
          if (node.argument && node.argument.type === 'Literal') return;
          context.report({ node, messageId: 'notLiteral', data: { kind: node.type } });
          return;
        case 'ObjectExpression':
          for (const prop of node.properties) {
            if (prop.type === 'SpreadElement' || prop.type === 'ExperimentalSpreadProperty') {
              context.report({ node: prop, messageId: 'notLiteral', data: { kind: 'spread' } });
              continue;
            }
            if (prop.computed) {
              context.report({ node: prop.key, messageId: 'notLiteral', data: { kind: 'computed key' } });
            }
            checkValue(prop.value);
          }
          return;
        case 'ArrayExpression':
          for (const el of node.elements) {
            if (el && el.type === 'SpreadElement') {
              context.report({ node: el, messageId: 'notLiteral', data: { kind: 'spread' } });
              continue;
            }
            checkValue(el);
          }
          return;
        default:
          context.report({ node, messageId: 'notLiteral', data: { kind: node.type } });
      }
    }

    return {
      ExportNamedDeclaration(node) {
        const decl = node.declaration;
        if (!decl || decl.type !== 'VariableDeclaration') return;
        for (const d of decl.declarations) {
          if (d.id && d.id.type === 'Identifier' && d.id.name === 'meta' && d.init) {
            checkValue(d.init);
          }
        }
      },
    };
  },
};
