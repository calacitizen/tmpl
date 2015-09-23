var State = require('../helpers/State'),
    utils = require('../helpers/utils');
module.exports = {
    parse: function partialModule(tag) {
        var assignModuleVar = tag.attribs.data.trim(),
            template = tag.attribs.template.trim();

        function resolveStatement() {
            var state = State.make();

            if (this.includeStack[template] === undefined) {
                throw new Error('Include tag for "' + template + '" is not found!');
            }

            this.includeStack[template].when(
                function partialInclude(templateData) {
                    if (templateData) {
                        this.traversingAST(templateData).when(
                            function partialTraversing(modAST) {
                                tag.children = modAST;
                                state.keep(tag);
                            },
                            function brokenTraverse(reason) {
                                throw new Error(reason);
                            }
                        );
                    } else {
                        state.break('Include tag for "' + template + '" is not found!');
                    }
                }.bind(this),
                function brokenPartial(reason) {
                    throw new Error(reason);
                }
            );
            return state.promise;
        }

        return function partialResolve() {
            return resolveStatement.call(this);
        };
    },
    module: function partialModule(tag, data) {
        var assignModuleVar = tag.attribs.data.trim(),
            rootVar = 'root',
            scopeData = {};
        function resolveStatement() {
            scopeData[rootVar] = data[assignModuleVar];
            return this._process(tag.children, scopeData);
        }
        return function partialResolve() {
            return resolveStatement.call(this);
        };
    }
};
