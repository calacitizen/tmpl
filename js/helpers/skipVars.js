var utils = require('./utils'),
    conditionalResolver = require('./conditionalResolver'),
    entityHelpers = require('./entityHelpers');
module.exports = {
    checkStatementForInners: function checkStatementForInners(value, arrVars) {
        var
            isUseful = utils.inArray(arrVars, value),
            expressionObj;

        if (entityHelpers.isExpression(value) && isUseful) {
            expressionObj = conditionalResolver(value);
            return entityHelpers.createDataExpression(expressionObj.condition, expressionObj.valOne, expressionObj.valTwo);
        }

        if (isUseful === true) {
            return entityHelpers.createDataVar(value, undefined);
        }

        return entityHelpers.createDataText(value);
    }
};
