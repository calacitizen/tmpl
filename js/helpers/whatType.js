define('whatType', function whatTypeLoader() {
   return function checkType(value) {

      var type = function checkTypeInside(o) {

         if (o === null) {
            return 'null';
         }

         if (o && (o.nodeType === 1 || o.nodeType === 9)) {
            return 'element';
         }

         var s = Object.prototype.toString.call(o);
         var type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

         if (type === 'number') {
            if (isNaN(o)) {
               return 'nan';
            }
            if (!isFinite(o)) {
               return 'infinity';
            }
         }

         return type;
      };

      var types = [
         'Null',
         'Undefined',
         'Object',
         'Array',
         'String',
         'Number',
         'Boolean',
         'Function',
         'RegExp',
         'Element',
         'NaN',
         'Infinite'
      ];

      var generateMethod = function(t) {
         type['is' + t] = function(o) {
            return type(o) === t.toLowerCase();
         };
      };

      for (var i = 0; i < types.length; i++) {
         generateMethod(types[i]);
      }

      return type(value);

   };
});
