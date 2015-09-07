var scopeHold = require("./scopeHold"),
    utils = require("./utils");
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
    reservedVarStrings = ["false", "true", "undefined", "null"],
    source = replaceGreaterLess(source),
    arrVars = lookUniqueVariables(source),
    condition = readConditionalExpression(source, arrVars);

    /**
     * Replace greater and less for real directives
     * @param  {String} source String with expression
     * @return {String}        String with replaced directives
     */
    function replaceGreaterLess(source) {
      for (var i = 0; i < sourceStrings.operators.length; i++) {
        source = source.replace(sourceStrings.operators[i].name, sourceStrings.operators[i].value);
      }
      return source;
    }

    /**
     * Looking up for unqiue variables in expression
     * @param  {String} expression String with expression
     * @return {Array}            Array with unqiue variables
     */
    function lookUniqueVariables(expression) {
      var variables = expression.match(/([A-z0-9'"]+)/g),
        length = variables.length,
        uniqueVariables = [],
        index = 0;
      while (index < length) {
        var variable = variables[index++];
        if (uniqueVariables.indexOf(variable) < 0 && !utils.inArray(reservedVarStrings, variable)) {
          if (utils.isVar(variable)) {
            uniqueVariables.push(variable);
          }
        }
      }
      return uniqueVariables;
    }

    /**
     * Reading conditional expression
     * @param  {String} expression      String with expression
     * @param  {Array} uniqueVariables  Array with unique variables
     * @return {Function}                 Function with resulting expression
     */
    function readConditionalExpression(expression, uniqueVariables) {
      return Function.apply(null, uniqueVariables.concat("return " + expression));
    }

    return condition.apply(this, scopeHold(arrVars, data));
}
