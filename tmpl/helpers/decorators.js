define('tmpl/helpers/decorators', function decoratorsLoader() {
   function embraceChain(array, ev) {
      if (array) {
         array.push(ev);
         return array;
      }
      return [ev];
   }
   function createEv(type, fArgs, name) {
      return {
         type: type,
         args: fArgs,
         name: name
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
      toString: function toString(entity) {
         return entity.toString();
      },
      split: function split(string, delimeter) {
         return string.split(delimeter);
      },
      strftime: function strftime(time, type) {
         if (time) {
            return time.strftime(type);
         }
      },
      trim: function trim(string) {
         return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
      },
      parseInt: function trim(entity, count) {
         return parseInt(entity, count);
      },
      substr: function substr(string, start, length) {
         return string.substr(start, length);
      },
      replace: function replace(string, pattern, newPattern) {
         return string.replace(pattern, newPattern);
      },
      removeParentheses: function removeParentheses(string) {
         return string.replace(/[()]/g, '');
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