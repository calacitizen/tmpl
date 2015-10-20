var utils = require('../helpers/utils'),
    partial = require('./partial'),
    straightFromFile = require('../helpers/straightFromFile');
module.exports = {
    parse: function modulePars(tag) {
        var name = utils.splitWs(tag.name.trim());
        function resolveStatement() {
            if (!this.includeStack[name]) {
                this.includeStack[name] = straightFromFile.call(this, name);
            }
            if (tag.attribs === undefined) {
                tag.attribs = {};
            }
            tag.attribs.template = name;
            return partial.parse(tag).call(this);
        }
        return function moduleParseResolve() {
            return resolveStatement.call(this);
        };
    },
    module: function moduleParsing(tag, data) {
        return partial.module(tag, data);
    }
};
