var utils = require('./utils'),
    entityHelpers = require('./entityHelpers');
module.exports = {
    checkStatementForInners: function checkStatementForInners(value, arrVars) {
        var isUseful = utils.inArray(arrVars, value);
        if (isUseful === true) {
            return entityHelpers.createDataVar(value, undefined);
        }
        return entityHelpers.createDataText(value);
    }
};
