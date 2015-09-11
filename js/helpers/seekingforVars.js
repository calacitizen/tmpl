var conditional = require('./conditional'),
    utils = require('./utils'),
    entityHelpers = require('./entityHelpers'),
    resolveVariables = require('./resolveVariables');
module.exports = function seekForVars(textData, scopeData) {

    function expression(textData) {
        if (conditional(textData.expression, scopeData)) {
            if (utils.isVar(textData.value)) {
                return resolveVariables(entityHelpers.createDataVar(textData.value, undefined), scopeData);
            }
            return utils.removeAroundQuotes(textData.value);
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
