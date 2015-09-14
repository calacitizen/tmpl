var conditional = require('./conditional'),
    utils = require('./utils'),
    entityHelpers = require('./entityHelpers'),
    resolveVariables = require('./resolveVariables');
module.exports = function seekForVars(textData, scopeData) {

    function expressionResolve(value, scopeData) {
        if (value !== undefined) {
            if (utils.isVar(value)) {
                return resolveVariables(entityHelpers.createDataVar(value, undefined), scopeData);
            }
            return utils.removeAroundQuotes(value);
        }
        return;
    }

    function expression(textData) {
        if (conditional(textData.expression, scopeData)) {
            return expressionResolve(textData.valueOne, scopeData);
        }
        return expressionResolve(textData.valueTwo, scopeData);
    }

    if (textData.type === 'expression') {
        return expression(textData);
    }

    if (textData.type === 'var') {
        return resolveVariables(textData, scopeData);
    }
    return textData.value;
};
