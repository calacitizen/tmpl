define('Core/tmpl/js/helpers/skipVars', ['Core/tmpl/js/helpers/utils', 'Core/tmpl/js/helpers/entityHelpers', 'Core/tmpl/js/jison/beforejs'], function (utils, entityHelpers, beforejs) {
   return {
      checkStatementForInners: function checkStatementForInners(value, arrVars) {
         var isUseful = utils.inArray(arrVars, value);
         if (isUseful === true) {
            return entityHelpers.createDataVar(beforejs.parse(value), undefined);
         }
         return entityHelpers.createDataText(value);
      }
   };
});
