var utils = require('./utils');
module.exports = function resolveVariables(textData, scopeData) {
  function prepareFargs(args) {
    var argsArr = args.split(',');
    if (argsArr.length > 0 ) {
      argsArr = utils.mapForLoop(argsArr, function trimming(val) {
        if (utils.isVar(val)) {
          return variable({name: val});
        }
        return utils.removeAroundQuotes(val).trim();
      });
    }
    return argsArr;
  }

  function fLookUp(f, compress, scopeData, variable, i) {
    var fName = f[0],
        args = prepareFargs(f[1]);
    if (scopeData.hasOwnProperty(fName) && i === 0) {
      compress = scopeData[fName].apply(undefined, args);
    } else {
      if (compress && compress.hasOwnProperty(fName)) {
        compress = compress[fName].apply(undefined, args);
      }
    }
    return compress;
  }

  function compressLookUp(compress, scopeData, stScope, i) {
    var f = utils.isFunction(stScope[i]);
    if (f) {
      compress = fLookUp(f, compress, scopeData, stScope[i], i);
    } else {
      if (scopeData.hasOwnProperty(stScope[i]) && i === 0) {
        compress = scopeData[stScope[i]];
      } else {
        if (compress && compress.hasOwnProperty(stScope[i])) {
          compress = compress[stScope[i]];
        }
      }
    }
    return compress
  }

  function searching(scopeData, stScope) {
    var compress;
    for (var i = 0; i < stScope.length; i++) {
      compress = compressLookUp(compress, scopeData, stScope, i);
    }
    return compress;
  }

  function variable(textData) {
    var variableSeparator = '.',
      stScope = textData.name.split(variableSeparator);
    if (stScope.length > 1) {
      return searching(scopeData, stScope);
    }
    return scopeData[textData.name];
  }

  return variable(textData);
}
