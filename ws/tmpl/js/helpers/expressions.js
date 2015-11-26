define('Core/tmpl/js/helpers/expressions', ['Core/tmpl/js/helpers/utils', 'Core/tmpl/js/helpers/calculator', 'Core/tmpl/js/helpers/decorators'], function (utils, calc, decorators) {
   var expressions = {
      'Identifier': function IdentifierCaller(node, data) {
         var calculators = this.calculators,
            calculator = calc;
         if (calculators) {
            for (var i=0; i < calculators.length; i++) {
               if (calculators[i].is(data)) {
                  calculator = calculators[i].calculator;
                  break;
               }
            }
         }
         return calculator(node.name, data);
      },
      'ExpressionStatement': function ExpressionStatementCaller(node, data) {
         var expr = this[node.expression.type](node.expression, data);
         return expr;
      },
      'LogicalExpression': function LogicalExpressionCaller(node, data) {
         var left = this[node.left.type](node.left, data),
            right = this[node.right.type](node.right, data),
            exprString = left + ' ' + node + ' ' + right;
         function logicalExpressionTypes(operator, left, right) {
            if (operator) {
               switch (operator) {
                  case '||':
                     return left.value || right.value;
                  case '&&':
                     return left.value && right.value;
                  default:
                     throw new Error('Wrong conditional expression ' + exprString);
               }
            }
            throw new Error('Wrong conditional expression ' + exprString);
         }
         return logicalExpressionTypes(node.operator, left, right);
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
         return callee.apply(data, utils.mapForLoop(node.arguments, function mapArgs(value) { return this[value.type](value, data); }.bind(this)));
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
      'DecoratorChainCall': function DecoratorChainCallCaller(node, data, caller, nodecaller) {
         var decArgs = utils.mapForLoop(node.argumentsDecorator || [], function decArgsMap(value) {
            return this[value.type](value, data);
         }.bind(this));
         if (node.identifier === 'trace') {
            decArgs.unshift(nodecaller.string);
         }
         decArgs.unshift(caller);
         return decorators[node.identifier].apply(undefined, decArgs);
      },
      'DecoratorChainContext': function DecoratorChainContextCaller(node, data, caller, nodecaller) {
         return this[node.fn.type](node.fn, data, caller, nodecaller);
      },
      'DecoratorCall': function DecoratorCallCaller(node, data) {
         return this[node.decorator.type](node.decorator, data, (node.caller ? this[node.caller.type](node.caller, data) : undefined), node.caller);
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