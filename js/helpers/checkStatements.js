var utils = require('./utils'),
    resolveVariables = require('./resolveVariables');
module.exports = function checkStatementForInners(value, scopeData, arrVars) {
    var
        variableSeparator = '.',
        stScope = value.split(variableSeparator),
        isVar = utils.inArray(arrVars, value),
        compress;

    /**
     * Crate type for empty data tag
     * @param  {Boolean} isVar
     * @return {String}
     */
    function restrictType(isVar) {
        if (isVar) {
            return "var";
        }
        return "text";
    }

    /**
     * Variable or node
     * @param  {Boolean} isVar
     * @param  {[type]}  value
     * @param  {String}  name
     * @return {Object}
     */
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

    if (isVar === true) {
        return varOrNot(isVar, resolveVariables({ type: restrictType(isVar), name: value, value: undefined }, scopeData), value);
    }

    return varOrNot(isVar, value);
};
