var scopeHold = require("./scopeHold");
module.exports = function conditional(source, data) {
  var
    sourceStrings = {
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
    source = replaceGreaterLess(source),
    arrVars = lookUniqueVariables(source),
    condition = readConditionalExpression(source, arrVars);

    function replaceGreaterLess(source) {
      for (var i = 0; i < sourceStrings.operators.length; i++) {
        source = source.replace(sourceStrings.operators[i].name, sourceStrings.operators[i].value);
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

    return condition.apply(this, scopeHold(arrVars, data));

}
