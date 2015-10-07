module.exports = function injectedDataForce(data, scopeData) {
    var types = {
            string: require('../astModules/data/string'),
            array: require('../astModules/data/array'),
            object: require('../astModules/data/object')
        };
    var q = types.object.call(this, types, data, scopeData);
    console.log(q);
    return q;
};