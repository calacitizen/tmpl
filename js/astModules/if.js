var jsResolver = require('../jison/jsCat'),
    decorators = require('../helpers/decorators');
module.exports = {
   module: function ifModule(tag, data) {
      function resolveStatement(source) {
         var res = jsResolver.parse(source)(data, decorators);
         tag.attribs.data.data[0].value = res;
         if (res) {
            if (tag.children !== undefined) {
               return this._process(tag.children, data);
            }
         }
         return;
      }
      var source;
      try {
         source =  tag.attribs.data.data[0].name.trim();
      } catch (err) {
         throw new Error('There is no data for "if" module to use');
      }
      return function ifModuleReturnable() {
         if (tag.children !== undefined) {
            return resolveStatement.call(this, source);
         }
      };
   }
};
