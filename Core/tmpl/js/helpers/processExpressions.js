define('Core/tmpl/js/helpers/processExpressions', ['Core/tmpl/js/helpers/expressions'], function processExpressionsCaller(expressions) {
   return function processExpressionsRec(expressionRaw, data) {
      var i, body;
      if (expressionRaw.type === 'var') {
         if (expressionRaw.name.type === 'Program') {
            body = expressionRaw.name.body;
            for (i = 0; i < body.length; i++) {
               if (expressions[body[i].type]) {
                  return expressions[body[i].type].call(expressions, body[i], data);
               }
            }
         } else {
            throw new Error('Something wrong with the expression given');
         }
      }
      return expressionRaw.value;
   };
});