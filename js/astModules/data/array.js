module.exports = function arrayTag(tag) {

    function resolveStatement() {
        
    }

    return function arrayReturnable() {
        return resolveStatement.call(this);
    };
}