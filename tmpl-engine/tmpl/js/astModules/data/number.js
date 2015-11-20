define('Core/tmpl/js/astModules/data/number', ['Core/tmpl/js/helpers/entityHelpers'], function numberLoader() {
   return function stringTag(tag, types, scopeData) {
      var children, i;
      if (tag.children) {
         children = tag.children;
         for (i = 0; i < children.length; i++) {
            if (children[i].type === "text") {
               return entityHelpers.createNumberFromString(children[i].data.value);
            }
         }
      }
   };
});