var checkStatements = require('./checkStatements');
module.exports = function scopeHold(arrVars, scope) {
  var ms = [],
      stepVar;
  for (var i = 0; i < arrVars.length; i++) {
    if (scope.hasOwnProperty(arrVars[i])) {
      stepVar = checkStatements(arrVars[i], scope, arrVars);
      if (stepVar.isVar === true) {
        ms.push(stepVar.value);
      }
    }
  }
  return ms;
}
