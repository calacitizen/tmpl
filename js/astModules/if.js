var jsResolver = require('../jison/jsCat'),
   utils = require('../helpers/utils'),
   challenge = require('../helpers/challengeModuleValues'),
   decorators = require('../helpers/decorators');
module.exports = {
   module: function ifModule(tag, data) {
      function resolveStatement(source) {
         var res = jsResolver.parse(source.value)(data, decorators), processed, clonedData;
         if (source.fromAttr) {
            clonedData = utils.clone(tag.attribs.if.data[0]);
            clonedData.value = res;
            tag.attribs.if = undefined;
            if (res) {
               processed = this._process([tag], data);
               tag.attribs.if = { data: [clonedData] };
               return processed;
            }
            tag.attribs.if = { data: [clonedData] };
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
