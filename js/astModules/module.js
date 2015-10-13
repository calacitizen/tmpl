var requireFile = require('../helpers/requireFile'),
    entityHelpers = require('../helpers/entityHelpers'),
    utils = require('../helpers/utils'),
    partial = require('./partial'),
    State = require('../helpers/State');
module.exports = {
    parse: function requireOrRetire(tag) {
        var name = utils.splitWs(tag.name.trim());
        function straightFromFile() {
            var unState = State.make();
            requireFile.call(this, name).when(
                function includeTraverse(templateData) {
                    this.traversingAST(templateData).when(
                        function includeTraverseState(modAST) {
                            unState.keep(modAST);
                        }.bind(this),
                        function brokenTraverse(reason) {
                            throw new Error(reason);
                        }
                    );
                }.bind(this),
                function (reason) {
                    throw new Error(reason);
                }
            );
            return unState.promise;
        }
        function resolveStatement() {
            var moduleFunction;
            if (!this.includeStack[name]) {
                this.includeStack[name] = straightFromFile.call(this);
            }
            if (tag.attribs === undefined) {
                tag.attribs = {};
            }
            tag.attribs.template = name;
            moduleFunction = partial.parse(tag);
            return moduleFunction.call(this);
        }
        return function includeResolve() {
            return resolveStatement.call(this);
        };
    },
    module: function requireModule(tag, data) {
        return partial.module(tag, data);
    }
};
