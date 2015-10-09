module.exports = function injectedDataForce(data, scopeData) {
    var types = {
            string: require('../astModules/data/string'),
            array: require('../astModules/data/array'),
            object: require('../astModules/data/object')
        };
    return types.object.call(this, types, data, scopeData);
};