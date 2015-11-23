define('Core/tmpl/js/astModules/if', ['Core/tmpl/js/jison/jsCat', 'Core/tmpl/js/helpers/challengeModuleValues', 'Core/tmpl/js/helpers/decorators'], function ifLoader(jsResolver, challenge, decorators) {
   var ifM = {
      module: function ifModule(tag, data) {
         function resolveStatement(source) {
            var res = jsResolver.parse(source.value)(data, decorators), processed, clonedData;
            if (source.fromAttr) {
               clonedData = tag.attribs.if;
               tag.attribs.if = undefined;
               if (res) {
                  processed = this._process([tag], data);
                  tag.attribs.if = clonedData;
                  return processed;
               }
               tag.attribs.if = clonedData;
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
