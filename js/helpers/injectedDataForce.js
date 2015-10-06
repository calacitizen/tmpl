module.exports = function injectedDataForce(data) {
    var types = {
            string: require('../astModules/data/string'),
            array: require('../astModules/data/array'),
            object: require('../astModules/data/object')
        };
    var q = types.object(types, data);
    console.log(q);
    return q;
};