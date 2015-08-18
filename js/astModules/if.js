var checkSource = require('../helpers/checkSource'),
  scopeHold = require('../helpers/scopeHold'),
  State = require('../helpers/State');
module.exports = {
  module: function ifModule(tag, data) {
    var
      concreteSourceStrings = {
        operators: [{ name: ' lt ', value: '<' }, { name: ' gt ', value: '>' }, { name: ' le ', value: '<=' }, { name: ' ge ',  value: '>=' }]
      },
      source = replaceGreaterLess(tag.attribs.data.trim()),
      arrVars = lookUniqueVariables(source),
      condition = readConditionalExpression(source, arrVars);

    function replaceGreaterLess(source) {
      for (var i = 0; i < concreteSourceStrings.operators.length; i++) {
        source = source.replace(concreteSourceStrings.operators[i].name, concreteSourceStrings.operators[i].value);
      }
      return source;
    }

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
            state.keep(modAST);
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
