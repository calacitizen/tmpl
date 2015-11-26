define('Core/tmpl/js/helpers/utils', function utilsLoader() {
   var utils = {
      isTypeOfFunction: function isTypeOfFunction(value) {
         return whatType(value) === 'function';
      },
      reduceMap: function reduceMap(array, fn, bind, initial) {
         var len = array.length, i = 0;
         if (len == 0 && arguments.length == 1) return null;
         var result = initial || array[i];
         for (; i < len; i++) result = fn.call(bind, result, array[i], i, array);
         return result;
      },
      reduceArray: function reduceArray(array, callback) {
         var len = array.length >>> 0, k = 0, value;
         while (k < len && ! k in array) {
            k++;
         }
         if (k >= len) {
            throw new TypeError('Reduce of empty array with no initial value');
         }
         value = array[k];
         for (; k <= len; k++) {
            if (k in array) {
               value = callback(value, array[k], k, array);
            }
         }
         return value;
      },
      mapForLoop: function mapForLoop(array, mapFunction) {
         var arrayLen = array.length,
            newArray = new Array(arrayLen),
            i;
         for (i = 0; i < arrayLen; i++) {
            newArray[i] = mapFunction(array[i], i, array);
         }
         return newArray;
      },
      eachObject: function eachObject(object, modifier) {
         var value;
         for (value in object) {
            if (object.hasOwnProperty(value)) {
               object[value] = modifier(object[value], value);
            }
         }
         return object;
      },
      inArray: function inArray(array, needle) {
         var i;
         for (i = 0; i < array.length; i++) {
            if (array[i] === needle) {
               return true;
            }
         }
         return false;
      },
      flattenArray: function flattenArray(ar1, ar2) {
         return [].concat.apply(ar1, ar2)
      },
      isNode: function isNode() {
         return (typeof global !== 'undefined' && Object.prototype.toString.call(global.process) === '[object process]');
      },
      isImplicitVar: function isImplicitVar(string) {
         return /^([A-z0-9\.]+)$/.test(string.trim());
      },
      isFunction: function isFunction(string) {
         var f = string.split(/\(([^\(]*)\)/);
         if (f.length === 1) {
            return false;
         }
         return f;
      },
      isProperty: function isProperty(string) {
         return /^(on-[A-z0-9])\w*$/.test(string);
      },
      isStyle: function isStyle(string) {
         return string === 'style';
      },
      isNumber: function isNumber(string) {
         return /^((?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?)$/.test(string.trim());
      },
      isString: function isString(string) {
         return (Object.prototype.toString.call(string) === '[object String]');
      },
      isVar: function isVar(string) {
         return !/['"].*?['"]/.test(string) && isNaN(parseInt(string));
      },
      getFirstLetter: function getFirstLetter(string) {
         return string.charAt(0);
      },
      isUpperCase: function isUpperCase(firstLetter) {
         return firstLetter === firstLetter.toUpperCase();
      },
      isWsIncluded: function isWsIncluded() {
         return (typeof $ws !== 'undefined');
      },
      splitVarsAndFunctions: function splitVarsAndFunctions(s) {
         var depth = 0, seg = 0, rv = [];
         s.replace(/[^().]*([)]*)([(]*)(.)?/g,
            function (m, cls, opn, com, off, s) {
               depth += opn.length - cls.length;
               var newseg = off + m.length;
               if (!depth && com) {
                  rv.push(s.substring(seg, newseg - 1));
                  seg = newseg;
               }
               return m;
            }
         );
         rv.push(s.substring(seg));
         return rv;
      },
      isVarFromScope: function isVarFromScope(varArray, scope) {
         var f;
         if (varArray.length > 0) {
            f = this.isFunction(varArray[0]);
            if (f) {
               return scope.hasOwnProperty(f[0]);
            }
            return scope.hasOwnProperty(varArray[0]);
         }
         return false;
      },
      splitVarString: function splitVarString(string) {
         return string.split('.');
      },
      removeAroundQuotes: function removingQuotes(string) {
         return string.trim().replace(/^['"](.*)['"]$/, '$1');
      },
      removeAllSpaces: function removeAllSpaces(string) {
         return string.replace(/\s/g, "");
      },
      splitWs: function splitWs(string) {
         var ws;
         if (string !== undefined) {
            ws = string.split('ws:');
            return ws[1];
         }
         return undefined;
      },
      clone: function clone(src) {
         function mixin(dest, source, copyFunc) {
            var name, s, i, empty = {};
            for (name in source) {
               s = source[name];
               if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
                  dest[name] = copyFunc ? copyFunc(s) : s;
               }
            }
            return dest;
         }

         if (!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]") {
            return src;
         }
         if (src.nodeType && "cloneNode" in src) {
            return src.cloneNode(true);
         }
         if (src instanceof Date) {
            return new Date(src.getTime());
         }
         if (src instanceof RegExp) {
            return new RegExp(src);
         }
         var r, i, l;
         if (src instanceof Array) {
            r = [];
            for (i = 0, l = src.length; i < l; ++i) {
               if (i in src) {
                  r.push(clone(src[i]));
               }
            }
         } else {
            r = src.constructor ? new src.constructor() : {};
         }
         return mixin(r, src, clone);
      },
      plainMergeAttrs: function plainMergeAttrs(inner, attrs) {
         for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
               inner[attr] = attrs[attr];
            }
         }
         return inner;
      },
      merge: function merge(target, source) {
         var property, a, sourceProperty, l;
         if (typeof target !== 'object') {
            target = {};
         }
         for (property in source) {
            if (source.hasOwnProperty(property)) {
               sourceProperty = source[property];
               if (typeof sourceProperty === 'object') {
                  target[property] = merge(target[property], sourceProperty);
                  continue;
               }
               target[property] = sourceProperty;
            }
         }
         for (a = 2, l = arguments.length; a < l; a++) {
            this.merge(target, arguments[a]);
         }
         return target;
      }
   };
   return utils;
});