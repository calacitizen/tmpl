define('Core/tmpl/js/helpers/processExpressions', ['Core/tmpl/js/helpers/expressions'], function processExpressionsCaller(expressions) {
   return function processExpressionsRec(expressionRaw, data, calculators) {
      var i, body, res;
      if (expressionRaw.type === 'var') {
         if (expressionRaw.name.type === 'Program') {
            body = expressionRaw.name.body;
            expressions.calculators = calculators;
            for (i = 0; i < body.length; i++) {
               if (expressions[body[i].type]) {
                  res = expressions[body[i].type].call(expressions, body[i], data);
                  expressionRaw.value = res;
                  return res;
               }
            }
         } else {
            throw new Error('Something wrong with the expression given');
         }
      }
      return expressionRaw.value;
   };
});