define('tmpl/helpers/seekingForVars', ['tmpl/jison/jsCat', 'tmpl/helpers/decorators'], function seekForVarsLoader(jsResolver, decorators) {
   return function seekForVars(textData, scopeData) {
      function resolveVariable(variable, data) {
         return jsResolver.parse(variable)(data, decorators);
      }
      var res;
      if (textData.type === 'expression') {
         res = resolveVariable(textData.expression, scopeData);
         textData.value = res;
         return res;
      }
      if (textData.type === 'var') {
         res = resolveVariable(textData.name, scopeData);
         textData.value = res;
         return res;
      }
      return textData.value;
   };
});
