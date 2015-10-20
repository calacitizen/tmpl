var State = require('../helpers/State'),
    utils = require('../helpers/utils'),
    injectedDataForce = require('../helpers/injectedDataForce');
module.exports = {
    parse: function partialParse(tag) {
        var tagData = tag.children;
        function resolveInjectedData(state, tag, injectingData) {
            if (injectingData) {
                this.traversingAST(injectingData).when(
                    function dataTraversing(tagDataAst) {
                        tag.injectedData = tagDataAst;
                        state.keep(tag);
                    }.bind(this)
                );
            } else {
                state.keep(tag);
            }
            return state;
        }
        function resolveInjectedTemplate(tag, state, tagData) {
            var template = tag.attribs.template.data;
            tag.injectedTemplate = template[0];
            state = resolveInjectedData.call(this, state, tag, tagData);
            return state.promise;
        }
        function resolveTemplate(tag, state, tagData) {
            var template = tag.attribs.template.data.value.trim();
            if (this.includeStack[template] === undefined) {
                throw new Error('Requiring tag for "' + template + '" is not found!');
            }
            this.includeStack[template].when(
                function partialInclude(modAST) {
                    if (modAST) {
                        tag.children = modAST;
                        state = resolveInjectedData.call(this, state, tag, tagData);
                    } else {
                        state.break('Requiring tag for "' + template + '" is not found!');
                    }
                }.bind(this),
                function brokenPartial(reason) {
                    throw new Error(reason);
                }
            );
            return state.promise;
        }
        function resolveStatement() {
            var state = State.make(),
                attribs = this._traverseTagAttributes(tag.attribs);
            if (attribs.template === undefined) {
                throw new Error("No template tag for partial " + tag.name);
            }
            tag.attribs = attribs;
            if (attribs.template.data.length > 0) {
                return resolveInjectedTemplate.call(this, tag, state, tagData);
            }
            return resolveTemplate.call(this, tag, state, tagData);
        }
        return function partialResolve() {
            return resolveStatement.call(this);
        };
    },
    module: function partialModule(tag, data) {
        function prepareScope(tag, data) {
            var scope,
                rootVar = '__root';
            scope = injectedDataForce.call(this, { children: tag.injectedData, attribs: tag.attribs }, data);
            scope[rootVar] = scope;
            return scope;
        }

        function resolveStatement() {
            var assignModuleVar;
            if (tag.injectedTemplate) {
                assignModuleVar = tag.injectedTemplate.name.trim();
                return this._process(data[assignModuleVar], prepareScope.call(this, tag, data));
            }
            return this._process(tag.children, prepareScope.call(this, tag, data));
        }
        return function partialResolve() {
            return resolveStatement.call(this);
        };
    }
};
