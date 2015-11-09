var entityHelpers = require('../../helpers/entityHelpers');
module.exports = function stringTag(types, tag, scopeData) {
   var children, i;
   if (tag.children) {
      children = tag.children;
      for (i = 0; i < children.length; i++) {
         if (children[i].type === "text") {
            return entityHelpers.createNumberFromString(children[i].data.value);
         }
      }
   }
}