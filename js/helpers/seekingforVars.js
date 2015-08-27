var conditional = require('./conditional');
module.exports = function seekForVars(textData, scopeData) {
  var
    variableSeparator = '.',
    stScope,
    compress;
  if (textData.type === 'expression') {
    if (conditional(textData.expression, scopeData)) {
      return textData.value;
    }
    return;
  }
  if (textData.type === 'var') {
    stScope = textData.name.split(variableSeparator);
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
      return compress;
    }
    return scopeData[textData.name];
  }
  return textData.value;
};
