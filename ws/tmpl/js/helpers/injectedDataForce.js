define('Core/tmpl/js/helpers/injectedDataForce', ['Core/tmpl/js/astModules/data/string', 'Core/tmpl/js/astModules/data/array', 'Core/tmpl/js/astModules/data/object', 'Core/tmpl/js/astModules/data/number'], function injectedDataForceLoader(str, arr, obj, num) {
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