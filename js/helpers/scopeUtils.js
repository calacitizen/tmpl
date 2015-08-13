var utils = require('./utils');
module.exports = {
  checkStatementForInners: function checkStatementForInners(value, scopeData, arrVars) {
    var
      variableSeparator = '.',
      stScope = value.split(variableSeparator),
      isVar = utils.inArray(arrVars, value),
      compress;

    function varOrNot(isVar, value, name) {
      if (isVar) {
        return {
          isVar: isVar,
          name: name,
          value: value
        };
      }
      return {
        isVar: isVar,
        value: value
      };
    }

    if (stScope.length > 1) {
      for (var i = 0; i < stScope.length; i++) {
        if (scopeData.hasOwnProperty(stScope[i]) && i === 0) {
          compress = scopeData[stScope[i]];
        } else {
          if (compress && compress.hasOwnProperty(stScope[i])) {
            compress = compress[stScope[i]];
          }
        }
      }
      return varOrNot(isVar, compress, value);
    }

    if (isVar === true) {
      return varOrNot(isVar, scopeData[value], value);
    }

    return varOrNot(isVar, value);
  }
}
