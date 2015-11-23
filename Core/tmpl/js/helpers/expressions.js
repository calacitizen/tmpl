define('Core/tmpl/js/helpers/expressions', ['Core/tmpl/js/helpers/utils', 'Core/tmpl/js/helpers/calculator', 'Core/tmpl/js/helpers/decorators'], function (utils, calculator, decorators) {
   var expressions = {
      'Identifier': function IdentifierCaller(node, data) {
         return calculator(node.name, data);
      },
      'ExpressionStatement': function ExpressionStatementCaller(node, data) {
         return this[node.expression.type](node.expression, data);
      },
      'LogicalExpression': function LogicalExpressionCaller(node, data) {
         function logicalExpressionTypes(operator, left, right) {
            if (operator) {
               switch (operator) {
                  case '||':
                     return left || right;
                  case '&&':
                     return left && right;
                  default:
                     throw new Error('Wrong conditional expression ' + left + ' ' + operator + ' ' + right);
               }
            } else {
               throw new Error('Wrong conditional expression ' + left + ' ' + operator + ' ' + right);
            }
         }
         return logicalExpressionTypes(node.operator, this[node.left.type](node.left, data), this[node.right.type](node.right, data));
      },
      'Literal': function LiteralNodeCaller(node) {
         return node.value;
      },
      'MemberExpression': function MemberExpressionNodeCaller(node, data) {
         if (node.property) {
            return this[node.property.type](node.property, this[node.object.type](node.object, data));
         }
         return this[node.object.type](node.object, data);
      },
      'ConditionalExpression': function ConditionalExpressionNodeCaller(node, data) {
         var alternate = (node.alternate !== undefined) ? this[node.alternate.type](node, data) : undefined;
         return this[node.test.type](node.test, data) ? this[node.consequent.type](node.consequent, data) : alternate;
      },
      'CallExpression': function CallExpressionCaller(node, data) {
         var callee = this[node.callee.type](node.callee, data);
         return callee.apply(undefined, utils.mapForLoop(node.arguments, function mapArgs(value) { return this[value.type](value, data); }.bind(this)));
      },
      'BinaryExpression': function BinaryExpressionCaller(node, data) {
         function binaryExpressionTypes(operator, left, right) {
            if (operator) {
               switch (operator) {
                  case '*':
                     return left * right;
                  case '/':
                     return left / right;
                  case '%':
                     return left % right;
                  case '+':
                     return left + right;
                  case '-':
                     return left - right;
                  case '<':
                     return left < right;
                  case '>':
                     return left > right;
                  case '<=':
                     return left <= right;
                  case '>=':
                     return left >= right;
                  case '==':
                     return left == right;
                  case '!=':
                     return left != right;
                  case '===':
                     return left === right;
                  case '!==':
                     return left !== right;
                  default:
                     throw new Error('Wrong binary expression ' + left + ' ' + operator + ' ' + right);
               }
            }
            throw new Error('Wrong binary expression ' + left + ' ' + operator + ' ' + right);
         }
         return binaryExpressionTypes(node.operator, this[node.left.type](node.left, data), this[node.right.type](node.right, data));
      },
      'DecoratorChainCall': function DecoratorChainCallCaller(node, data, caller) {
         var decArgs = utils.mapForLoop(node.argumentsDecorator || [], function decArgsMap(value) {
            return this[value.type](value, data);
         }.bind(this));
         decArgs.unshift(caller);
         return decorators[node.identifier].apply(undefined, decArgs);
      },
      'DecoratorChainContext': function DecoratorChainContextCaller(node, data, caller) {
         return this[node.fn.type](node.fn, data, caller);
      },
      'DecoratorCall': function DecoratorCallCaller(node, data) {
         return this[node.decorator.type](node.decorator, data, (node.caller ? this[node.caller.type](node.caller, data) : undefined));
      },
      'UnaryExpression': function UnaryExpressionCaller(node, data) {
         function unaryExpressionTypes(operator, argument) {
            if (operator) {
               switch (operator) {
                  case '+':
                     return +argument;
                  case '-':
                     return -argument;
                  case '!':
                     return !argument;
                  default:
                     throw new Error('Wrong unary expression ' + operator + argument);
               }
            }
            throw new Error('Wrong unary expression ' + operator + argument);
         }
         return unaryExpressionTypes(node.operator, this[node.argument.type](node.argument, data));
      },
      'ArrayExpression': function ArrayExpressionNodeCaller(node, data) {
         return utils.mapForLoop(node.elements, function ArrayExpressionNodeMap(value) {
               return this[value.type](value, data);
            }.bind(this)) || [];
      },
      'ObjectExpression': function ObjectExpressionNodeCaller(node, data) {
         var obj = {}, massArr = utils.mapForLoop(node.properties, function ObjectExpressionNodeMap(value) {
            var key = this[value.key.type](value.key, data);
            if (key) {
               obj[key] = this[value.value.type](value.value, data);
            }
         }.bind(this));
         return obj;
      },
      'EmptyStatement': function EmptyStatementNodeCaller(node, data) {
         return;
      }
   };
   return expressions;
});