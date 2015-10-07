var State = require('../helpers/State'),
    utils = require('../helpers/utils'),
    injectedDataForce = require('../helpers/injectedDataForce');
module.exports = {
    parse: function partialParse(tag) {
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
                                tag.children = modAST;
                                if (tagData) {
                                    this.traversingAST(tagData).when(function dataTraversing(tagDataAst) {
                                        tag.injectedData = tagDataAst;
                                        state.keep(tag);
                                    }.bind(this));
                                } else {
                                    state.keep(tag);
                                }
                            }.bind(this),
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

        function resolveStatement() {
            if (tag.injectedData) {
                injected = injectedDataForce.call(this, tag.injectedData, data);
            }
            scopeData[rootVar] = (injected ? injected : data[assignModuleVar]);
            return this._process(tag.children, scopeData);
        }
        return function partialResolve() {
            return resolveStatement.call(this);
        };
    }
};
