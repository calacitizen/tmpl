var State = require('../helpers/State'),
    utils = require('../helpers/utils'),
    injectedDataForce = require('../helpers/injectedDataForce');
module.exports = {
    parse: function partialModule(tag) {
        var template = tag.attribs.template.trim(),
            tagData = tag.children;

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
                                if (tagData) {
                                    tag.injectedData = tagData;
                                }
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
            scopeData = {},
            injected;

        if (tag.injectedData) {
            injected = scopeData = injectedDataForce(tag.injectedData);
        }

        function resolveStatement() {
            scopeData[rootVar] = (injected ? injected : data[assignModuleVar]);
            return this._process(tag.children, scopeData);
        }
        return function partialResolve() {
            return resolveStatement.call(this);
        };
    }
};
