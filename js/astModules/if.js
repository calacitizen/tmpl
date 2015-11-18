define('if', ['jsCat', 'challenge', 'decorators'], function ifLoader(jsResolver, challenge, decorators) {
   var ifM = {
      module: function ifModule(tag, data) {
         function resolveStatement(source) {
            var res = jsResolver.parse(source.value)(data, decorators), processed, clonedData;
            if (source.fromAttr) {
               tag.attribs.if = undefined;
               if (res) {
                  return this._process([tag], data);
               }
            } else {
               tag.attribs.data.data[0].value = res;
               if (res) {
                  if (tag.children !== undefined) {
                     return this._process(tag.children, data);
                  }
               }
            }
            return;
         }
         return function ifModuleReturnable() {
            if (tag.children !== undefined) {
               return resolveStatement.call(this, challenge(tag, 'if'));
            }
         };
      }
   };
   return ifM;
});
