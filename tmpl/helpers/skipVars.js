define('tmpl/helpers/skipVars', ['tmpl/helpers/utils', 'tmpl/helpers/entityHelpers', 'Core/tmpl/js/jison/beforejs'], function (utils, entityHelpers, beforejs) {
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
