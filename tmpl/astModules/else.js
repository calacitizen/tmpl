define('tmpl/astModules/else', ['tmpl/jison/jsCat', 'tmpl/helpers/decorators'], function elseLoader(jsResolver, decorators) {
   var elseM = {
      module: function elseModule(tag, data) {
         var source, elseSource, captureElse = false;
         if (tag.prev === undefined || (tag.prev.name !== 'ws:if' && tag.prev.name !== 'ws:else')) {
            throw new Error('There is no "if" for "else" module to use');
         }
         try {
            source = tag.prev.attribs.data.data[0].value;
         } catch (err) {
            throw new Error('There is no data for "else" module to use');
         }
         if (tag.attribs !== undefined) {
            try {
               elseSource = jsResolver.parse(tag.attribs.data.data[0].name.trim())(data, decorators);
               tag.attribs.data.data[0].value = elseSource;
               captureElse = true;
            } catch (err) {
               throw new Error('There is no data for "else" module to use for excluding place "elseif"');
            }
         }
         function resolveStatement() {
            if (captureElse) {
               if (!source) {
                  if (elseSource) {
                     if (tag.children !== undefined) {
                        return this._process(tag.children, data);
                     }
                  }
               }
            } else {
               if (!source) {
                  if (tag.children !== undefined) {
                     return this._process(tag.children, data);
                  }
               }
            }
            return;
         }

         return function elseModuleReturnable() {
            if (tag.children !== undefined) {
               return resolveStatement.call(this);
            }
         };
      }
   };
   return elseM;
});