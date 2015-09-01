module.exports = {
  mapForLoop: function mapForLoop(array, mapFunction) {
    var arrayLen = array.length;
    var newArray = new Array(arrayLen);
    for (var i = 0; i < arrayLen; i++) {
      newArray[i] = mapFunction(array[i], i, array);
    }
    return newArray;
  },
  eachObject: function eachObject(object, modifier) {
    for (var value in object) {
      if (object.hasOwnProperty(value)) {
        object[value] = modifier(object[value]);
      }
    }
    return object;
  },
  inArray: function inArray(array, needle) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === needle) {
        return true;
      }
    }
    return false;
  },
  isNode: function isNode() {
    return Object.prototype.toString.call(global.process) === '[object process]';
  },
  removeAroundQuotes: function removingQuotes(string) {
    return string.trim().replace(/^['"](.*)['"]$/, '$1');
  },
  removeAllSpaces: function removeAllSpaces(string) {
    return string.replace(/\s/g, "");
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
  }
}
