var utils = require('./utils');
module.exports = function resolveVariables(textData, scopeData) {
  /**
   * If function call, prepare arguments
   * @param  {String} args
   * @return {Array}        Array witj function arguments
   */
  function prepareFargs(args) {
    var argsArr = args.split(',');
    if (argsArr.length > 0 ) {
      argsArr = utils.mapForLoop(argsArr, function trimming(val) {
          val = val.trim();
        if (utils.isVar(val)) {
          return variable({name: val});
        }
        return utils.removeAroundQuotes(val).trim();
      });
    }
    return argsArr;
  }

  /**
   * Function lookup in variableSeparator
   * @param  {String} f         Function string
   * @param  {Array} compress  Scope data
   * @param  {Array} scopeData Original Scope data
   * @param  {String} variable  Variable nam,e
   * @param  {number} i         Iterator
   * @return {Array}           Array with data
   */
  function fLookUp(f, compress, scopeData, variable, i) {
    var fName = f[0],
        args = prepareFargs(f[1]);
    if (scopeData.hasOwnProperty(fName) && i === 0) {
      compress = scopeData[fName].apply(undefined, args);
    } else {
      if (compress) {
        compress = compress[fName].apply(compress, args);
      }
    }
    return compress;
  }

  /**
   * First variable lookup
   * @param  {Array} compress  new generated Scope data
   * @param  {Array} scopeData Scope data
   * @param  {Array} stScope   Array from variable string
   * @param  {number} i         Iterator
   * @return {Array}
   */
  function compressLookUp(compress, scopeData, stScope, i) {
    var f = utils.isFunction(stScope[i]);
    if (f) {
      compress = fLookUp(f, compress, scopeData, stScope[i], i);
    } else {
      if (i === 0) {
        compress = scopeData[stScope[i]];
      } else {
        if (compress) {
          compress = compress[stScope[i]];
        }
      }
    }
    return compress
  }

  /**
   * Searching for variables in stScope
   * @param  {Array} scopeData Scope data
   * @param  {Array} stScope   Array from variable string
   * @return {Array}
   */
  function searching(scopeData, stScope) {
    var compress;
    for (var i = 0; i < stScope.length; i++) {
      compress = compressLookUp(compress, scopeData, stScope, i);
    }
    return compress;
  }

  /**
   * Resolve variable value
   * @param  {Object} textData Object with AST-data
   * @return {Object|String|Array|number}          variable value
   */
  function variable(textData) {
    var stScope = utils.splitVarsAndFunctions(textData.name);
    return searching(scopeData, stScope);
  }

  return variable(textData);
}
