define('Core/tmpl/js/helpers/scopeHold', ['Core/tmpl/js/helpers/checkStatements'], function scopeHoldLoader(checkStatements) {
   return function scopeHold(arrVars, scope) {
      var
         ms = [],
         stepVar,
         i;
      for (i = 0; i < arrVars.length; i++) {
         if (scope.hasOwnProperty(arrVars[i])) {
            stepVar = checkStatements(arrVars[i], scope, arrVars);
            if (stepVar.isVar === true) {
               ms.push(stepVar.value);
            }
         }
      }
      return ms;
   };
});
