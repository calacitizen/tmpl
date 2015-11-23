define('Core/tmpl/js/astModules/module', ['Core/tmpl/js/helpers/utils', 'Core/tmpl/js/astModules/partial', 'Core/tmpl/js/helpers/straightFromFileAMD'], function moduleLoader(utils, partial, straightFromFile) {
   var moduleM = {
      parse: function modulePars(tag) {
         var name = utils.splitWs(tag.name.trim());
         function resolveStatement() {
            if (!this.includeStack[name]) {
               this.includeStack[name] = straightFromFile.call(this, name);
            }
            if (tag.attribs === undefined) {
               tag.attribs = {};
            }
            tag.attribs.template = name;
            return partial.parse(tag).call(this);
         }
         return function moduleParseResolve() {
            return resolveStatement.call(this);
         };
      },
      module: function moduleParsing(tag, data) {
         return partial.module(tag, data);
      }
   };
   return moduleM;
});
