define('tmpl/astModules/include', ['tmpl/helpers/straightFromFile', 'tmpl/helpers/entityHelpers', 'tmpl/helpers/State'], function (straightFromFile, entityHelpers, State) {
   var includeM = {
      parse: function requireOrRetire(tag) {
         var name = tag.attribs.name.trim(),
            template = tag.attribs.template.trim();
         function resolveStatement() {
            var st = State.make();
            this.includeStack[name] = straightFromFile.call(this, template);
            st.keep(entityHelpers.createDataRequest(name));
            return st.promise;
         }
         return function includeResolve() {
            return resolveStatement.call(this);
         };
      }
   };
   return includeM;
});