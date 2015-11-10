var utils = require('../../helpers/utils');
module.exports = function arrayTag(tag, types, scopeData) {
   var children, array = [], nameExists, typeFunction, i;
   if (tag.children) {
      children = tag.children;
      for (i = 0; i < children.length; i++) {
         nameExists = utils.splitWs(children[i].name);
         if (nameExists) {
            if (children[i].children) {
               typeFunction = types[nameExists];
               if (typeFunction) {
                  array.push(typeFunction.call(this, types, children[i], scopeData));
               } else {
                  throw new Error(children[i].name + ' property can\'t be in the root of ws:array tag');
               }
            }
         }
      }
   }
   return array;
}