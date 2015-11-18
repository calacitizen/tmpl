define('injectedDataForce', ['string', 'array', 'object', 'number'], function injectedDataForceLoader(str, arr, obj, num) {
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