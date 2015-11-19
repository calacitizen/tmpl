define('tmpl/helpers/checkStatements', ['tmpl/helpers/utils', 'tmpl/jison/jsCat', 'tmpl/helpers/decorators'], function checkStatementsLoader(utils, jsResolver, decorators) {
   return function checkStatementForInners(value, scopeData, arrVars) {
      var isVar = utils.inArray(arrVars, value);
      /**
       * Variable or node
       * @param  {Boolean} isVar
       * @param  {[type]}  value
       * @param  {String}  name
       * @return {Object}
       */
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
         return varOrNot(isVar, jsResolver.parse(value)(scopeData, decorators), value);
      }

      return varOrNot(isVar, value);
   };
});