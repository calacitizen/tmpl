define('tmpl/astModules/if', ['tmpl/jison/jsCat', 'tmpl/helpers/challengeModuleValues', 'tmpl/helpers/decorators'], function ifLoader(jsResolver, challenge, decorators) {
   var ifM = {
      module: function ifModule(tag, data) {
         function resolveStatement(source) {
            if (source.fromAttr) {
               tag.attribs.if = undefined;
               if (source.value) {
                  return this._process([tag], data);
               }
            } else {
               tag.attribs.data.data[0].value = source.value;
               if (source.value) {
                  if (tag.children !== undefined) {
                     return this._process(tag.children, data);
                  }
               }
            }
            return;
         }
         return function ifModuleReturnable() {
            if (tag.children !== undefined) {
               return resolveStatement.call(this, challenge(tag, 'if', false, data));
            }
         };
      }
   };
   return ifM;
});
