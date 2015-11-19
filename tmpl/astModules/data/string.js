define('tmpl/astModules/data/string', function stringLoader() {
   return function stringTag(tag, types, scopeData) {
      var children, string = '', i;
      if (tag.children) {
         children = tag.children;
         for (i = 0; i < children.length; i++) {
            if (children[i].type === "text") {
               string += this._processData(children[i].data, scopeData);
            }
         }
      }
      return string;
   };
});