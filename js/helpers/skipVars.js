var utils = require('./utils');
module.exports = {
  checkStatementForInners: function checkStatementForInners(value, arrVars) {
    var
      variableSeparator = '.',
      stScope = value.split(variableSeparator),
      isVar = utils.inArray(arrVars, value),
      compress;

    function varOrNot(isVar, value, name) {
      if (isVar) {
        return {
          isVar: isVar,
          name: name,
          value: value
        };
      }
      return {
        isVar: isVar,
        value: value
      };
    }

    if (isVar === true) {
      return varOrNot(isVar, undefined, value);
    }

    return varOrNot(isVar, value);
  }
}
