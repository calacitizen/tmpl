define('Core/tmpl/js/astModules/data/object', ['Core/tmpl/js/helpers/utils', 'Core/tmpl/js/helpers/entityHelpers'], function objectLoader(utils, entityHelpers) {
   return function objectTag(injected, types, scopeData) {
      var tObject = {}, typeFunction, nameExists, i, objectForMerge = {}, htmlArray = [];
      function isEntityUsefulOrHTML(nameExists) {
         return nameExists && !this._modules.hasOwnProperty(nameExists) && !entityHelpers.isTagRequirableBool(nameExists);
      }
      objectForMerge = entityHelpers.parseAttributesForData.call(this, injected.attribs, scopeData, this.calculators);
      if (injected.children) {
         injected = injected.children;
      }
      for (i = 0; i < injected.length; i++) {
         nameExists = utils.splitWs(injected[i].name);
         if (isEntityUsefulOrHTML.call(this, nameExists)) {
            if (injected[i].children) {
               typeFunction = types[nameExists];
               if (typeFunction) {
                  return typeFunction.call(this, injected[i], types, scopeData);
               }
               tObject[nameExists] = types.object.call(this, injected[i].children, types, scopeData);
            }
         } else {
            htmlArray.push(injected[i]);
         }
      }
      if (objectForMerge !== undefined) {
         tObject = utils.plainMergeAttrs(tObject, objectForMerge);
      }
      if (htmlArray.length > 0) {
         return htmlArray;
      }
      return tObject;
   };
});