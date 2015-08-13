var scopeUtils = require('./scopeUtils');
module.exports = function scopeHold(arrVars, scope) {
  var ms = [],
      variableSeparator = '.',
      stepVar;
  for (var i = 0; i < arrVars.length; i++) {
    if (scope.hasOwnProperty(arrVars[i])) {
      stepVar = scopeUtils.checkStatementForInners(arrVars[i], scope, arrVars);
      if (stepVar.isVar === true) {
        ms.push(stepVar.value);
      }
    }
  }
  return ms;
}
