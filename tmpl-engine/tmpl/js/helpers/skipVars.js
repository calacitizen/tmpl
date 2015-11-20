define('Core/tmpl/js/helpers/skipVars', ['Core/tmpl/js/helpers/utils', 'Core/tmpl/js/helpers/entityHelpers'], function (utils, entityHelpers) {
   return {
      checkStatementForInners: function checkStatementForInners(value, arrVars) {
         var isUseful = utils.inArray(arrVars, value);
         if (isUseful === true) {
            return entityHelpers.createDataVar(value, undefined);
         }
         return entityHelpers.createDataText(value);
      }
   };
});
