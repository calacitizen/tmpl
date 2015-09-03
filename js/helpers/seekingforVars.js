var conditional = require('./conditional'),
  resolveVariables = require('./resolveVariables');
module.exports = function seekForVars(textData, scopeData) {

  function expression(textData) {
    if (conditional(textData.expression, scopeData)) {
      return textData.value;
    }
    return;
  }

  if (textData.type === 'expression') {
    return expression(textData);
  }

  if (textData.type === 'var') {
    return resolveVariables(textData, scopeData);
  }
  return textData.value;
};
