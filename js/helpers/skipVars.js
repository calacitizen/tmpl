var utils = require('./utils'),
    conditionalResolver = require('./conditionalResolver'),
    entityHelpers = require('./entityHelpers');
module.exports = {
    checkStatementForInners: function checkStatementForInners(value, arrVars) {
        var
            isUseful = utils.inArray(arrVars, value),
            expressionObj;
        if (isUseful === true) {
            if (utils.isNumber(value)) {
                return entityHelpers.createDataText(entityHelpers.createNumberFromString(value));
            }
            if (utils.isImplicitVar(value)) {
                return entityHelpers.createDataVar(value, undefined);
            }
            expressionObj = conditionalResolver(value);
            if (expressionObj.condition !== undefined) {
                return entityHelpers.createDataExpression(expressionObj.condition, expressionObj.valOne, expressionObj.valTwo);
            }
            if (utils.isFunction(value)) {
                return entityHelpers.createDataVar(value, undefined);
            }
            throw new Error('Wrong conditional expression: ' + value);
        }
        return entityHelpers.createDataText(value);
    }
};
