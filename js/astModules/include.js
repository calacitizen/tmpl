var straightFromFile = require('../helpers/straightFromFile'),
   entityHelpers = require('../helpers/entityHelpers'),
   State = require('../helpers/State');
module.exports = {
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
