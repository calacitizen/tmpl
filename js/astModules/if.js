var checkSource = require('../helpers/checkSource'),
  scopeHold = require('../helpers/scopeHold'),
  State = require('../helpers/State');
module.exports = {
  module: function ifModule(tag, data) {
    var
      source = tag.attribs.data.trim(),
      concreteSourceStrings = {
        operators: ['&&', '||', '===', '!==', '<', '>', '<=', '>=']
      },
      type = checkSource(source, data),
      arrVars = lookUniqueVariables(source),
      condition = readConditionalExpression(source, arrVars);

    function lookUniqueVariables(expression) {
      var variables = expression.match(/([A-z]+)/g),
        length = variables.length,
        uniqueVariables = [],
        index = 0;
      while (index < length) {
        var variable = variables[index++];
        if (uniqueVariables.indexOf(variable) < 0) {
          uniqueVariables.push(variable);
        }
      }
      return uniqueVariables;
    }

    function readConditionalExpression(expression, uniqueVariables) {
      return Function.apply(null, uniqueVariables.concat("return " + expression));
    }

    function resolveStatement(condition) {
      var state = State.make();
      if (condition) {
        if (tag.children !== undefined) {
          this.traversingAST(tag.children, data).when(function ifObjectTraverse(modAST) {
            state.keep(modAST[0]);
          }, function brokenIf(reason) {
            throw new Error(reason);
          });
        }
      } else {
        state.keep(undefined)
      }
      return state.promise;
    }

    return function ifModuleReturnable() {
      if (tag.children !== undefined) {
        return resolveStatement.call(this, condition.apply(this, scopeHold(arrVars, data)));
      }
    }
  }
}
