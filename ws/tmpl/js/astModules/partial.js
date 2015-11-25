define('Core/tmpl/js/astModules/partial', ['Core/tmpl/js/helpers/State', 'Core/tmpl/js/helpers/injectedDataForce', 'Core/tmpl/js/helpers/processExpressions'], function partialLoader(State, injectedDataForce, processExpressions) {
   var partialM = {
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
            return injectedDataForce.call(this, { children: tag.injectedData, attribs: tag.attribs }, data);
         }
         function resolveStatement() {
            var assignModuleVar, preparedScope = prepareScope.call(this, tag, data);
            if (tag.injectedTemplate) {
               assignModuleVar = processExpressions(tag.injectedTemplate, data);
               if (assignModuleVar) {
                  if (entityHelpers.isControlClass(assignModuleVar)) {
                     return this._process([entityHelpers.createControlNode(assignModuleVar, preparedScope.key)], preparedScope);
                  }
                  return this._process(assignModuleVar, preparedScope);
               }
               throw new Error('Your template variable by the name of "' + tag.injectedTemplate.name + '" is empty');
            }
            return this._process(tag.children, preparedScope);
         }
         return function partialResolve() {
            return resolveStatement.call(this);
         };
      }
   };
   return partialM;
});