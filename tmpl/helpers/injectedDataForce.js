define('tmpl/helpers/injectedDataForce', ['tmpl/astModules/data/string', 'tmpl/astModules/data/array', 'tmpl/astModules/data/object', 'tmpl/astModules/data/number'], function injectedDataForceLoader(str, arr, obj, num) {
   return function injectedDataForce(data, scopeData) {
      var types = {
         string: str,
         array: arr,
         object: obj,
         number: num
      };
      return types.object.call(this, data, types, scopeData);
   };
});