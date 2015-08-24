var checkSource = require('../helpers/checkSource'),
  scopeHold = require('../helpers/scopeHold');
module.exports = {
  module: function ifModule(tag, data) {
    var
      concreteSourceStrings = {
        operators: [{
          name: ' lt ',
          value: '<'
        }, {
          name: ' gt ',
          value: '>'
        }, {
          name: ' le ',
          value: '<='
        }, {
          name: ' ge ',
          value: '>='
        }]
      },
      source,
      arrVars,
      condition;

    if (tag.attribs.data.data === undefined) {
      throw new Error('There is no data for "if" module to use');
    }

    source = replaceGreaterLess(tag.attribs.data.data.value.trim();
    arrVars = lookUniqueVariables(source);
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
      if (condition) {
        if (tag.children !== undefined) {
          return this._process(tag.children, data);
        }
      }
      return;
    }

    return function ifModuleReturnable() {
      if (tag.children !== undefined) {
        return resolveStatement.call(this, condition.apply(this, scopeHold(arrVars, data)));
      }
    }
  }
}
