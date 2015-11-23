define('Core/tmpl/js/helpers/decorators', function decoratorsLoader() {
   function embraceChain(array, ev) {
      if (array) {
         array.push(ev);
         return array;
      }
      return [ev];
   }
   function createEv(name, fArgs, value) {
      return {
         name: name,
         args: fArgs,
         value: value
      };
   }
   var slice = Array.prototype.slice;

   var decorators = {
      ucFirst: function ucFirst(string) {
         return string.replace(/^\w/, function (match) {
            return match.toUpperCase();
         });
      },
      toUpperCase: function toUpperCase(string) {
         return string.toUpperCase();
      },
      trim: function trim(string) {
         return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
      },
      substr: function substr(string, start, length) {
         return string.substr(start, length);
      },
      replace: function replace(string, pattern, newPattern) {
         return string.replace(pattern, newPattern);
      },
      command: function command(array, name) {
         return embraceChain(array, createEv("command", slice.call(arguments, 2), name));
      },
      preventDefault: function preventDefault(array) {
         return embraceChain(array, createEv("preventDefault"));
      },
      stopPropagation: function stopPropagation(array) {
         return embraceChain(array, createEv("stopPropagation"));
      },
      method: function method(array, name) {
         return embraceChain(array, createEv("method", slice.call(arguments, 2), name));
      }
   };
   return decorators;
});