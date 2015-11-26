define('Core/tmpl/js/astModules/if', ['Core/tmpl/js/helpers/challengeModuleValues', 'Core/tmpl/js/helpers/decorators'], function ifLoader(challenge, decorators) {
   var ifM = {
      module: function ifModule(tag, data) {
         function resolveStatement(source) {
            var processed, clonedData;
            if (source.fromAttr) {
               clonedData = tag.attribs.if;
               tag.attribs.if = undefined;
               if (source.value) {
                  processed = this._process([tag], data);
                  tag.attribs.if = clonedData;
                  return processed;
               }
               tag.attribs.if = clonedData;
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
               return resolveStatement.call(this, challenge.call(this, tag, 'if', false, data));
            }
         };
      }
   };
   return ifM;
});
