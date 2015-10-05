var traverseInjectedData = require('../helpers/traverseInjectedData');
module.exports = function injectedDataForce(data) {
    var types = {
            string: require('../astModules/data/string'),
            array: require('../astModules/data/array')
        };
    var q = traverseInjectedData(types, data);
    console.log(q);
    return q;
};