var utils = require('./utils'),
    entityHelpers = require('./entityHelpers');
module.exports = {
  checkStatementForInners: function checkStatementForInners(value, arrVars) {
    var
      variableSeparator = '.',
      stScope = value.split(variableSeparator),
      isUseful = utils.inArray(arrVars, value),
      expressionArr,
      compress;

    if (entityHelpers.isExpression(value) && isUseful) {
        expressionArr = value.split(':');
        return entityHelpers.createDataExpression(utils.removeAroundQuotes(expressionArr[0]), expressionArr[1]);
    }

    if (isUseful === true) {
      return entityHelpers.createDataVar(value, undefined);
    }

    return entityHelpers.createDataText(value);
  }
}
