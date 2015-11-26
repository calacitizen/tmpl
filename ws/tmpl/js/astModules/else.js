define('Core/tmpl/js/astModules/else', ['Core/tmpl/js/helpers/processExpressions'], function elseLoader(processExpressions) {
   var elseM = {
      module: function elseModule(tag, data) {
         function resolveStatement() {

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
                  elseSource = processExpressions(tag.attribs.data.data[0].name, data, this.calculators);
                  tag.attribs.data.data[0].value = elseSource;
                  captureElse = true;
               } catch (err) {
                  throw new Error('There is no data for "else" module to use for excluding place "elseif"');
               }
            }

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