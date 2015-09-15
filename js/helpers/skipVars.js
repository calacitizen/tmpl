var utils = require('./utils'),
    conditionalResolver = require('./conditionalResolver'),
    entityHelpers = require('./entityHelpers');
module.exports = {
    checkStatementForInners: function checkStatementForInners(value, arrVars) {
        var
            isUseful = utils.inArray(arrVars, value),
            expressionObj;
        if (isUseful === true) {
            if (!utils.isImplicitVar(value) && !utils.isFunction(value)) {
                expressionObj = conditionalResolver(value);
                if (expressionObj.condition === undefined) {
                    throw new Error('Wrong conditional expression: ' + value);
                }
                return entityHelpers.createDataExpression(expressionObj.condition, expressionObj.valOne, expressionObj.valTwo);
            }
            return entityHelpers.createDataVar(value, undefined);
        }
        return entityHelpers.createDataText(value);
    }
};
