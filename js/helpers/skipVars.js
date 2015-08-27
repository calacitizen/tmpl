var utils = require('./utils'),
    entityHelpers = require('./entityHelpers');
module.exports = {
  checkStatementForInners: function checkStatementForInners(value, arrVars) {
    var
      variableSeparator = '.',
      stScope = value.split(variableSeparator),
      isVar = utils.inArray(arrVars, value),
      expressionArr,
      compress;

    if (entityHelpers.isExpression(value)) {
      expressionArr = value.split(':');
      return entityHelpers.createDataExpression(expressionArr[0], expressionArr[1]);
    }

    if (isVar === true) {
      return entityHelpers.createDataVar(value, undefined);
    }

    return entityHelpers.createDataText(value);
  }
}
