define('Core/tmpl/js/astModules/for', ['Core/tmpl/js/helpers/State', 'Core/tmpl/js/helpers/whatType', 'Core/tmpl/js/helpers/utils', 'Core/tmpl/js/helpers/processExpressions', 'Core/tmpl/js/jison/beforejs'], function (State, whatType, utils, processExpressions, beforejs) {
   var forM = {
      parse: function forParse(tag) {
         function resolveStatement() {
            var state = State.make(),
               concreteSourceStrings = {
                  splittingKey: ' in ',
                  key: ' as '
               },
               forStampArguments,
               source = '',
               findForAllArguments = function forFindAllArguments(value, main) {
                  var crStringArray = value.split(concreteSourceStrings.key);
                  if (crStringArray.length > 1) {
                     return {
                        key: crStringArray[0],
                        value: crStringArray[1],
                        main: main
                     };
                  }
                  return {
                     key: undefined,
                     value: crStringArray[0],
                     main: main
                  };
               };
            try {
               source = tag.attribs.data;
            } catch (err) {
               throw new Error('Wrong arguments in for statement ' + tag.raw);
            }
            forStampArguments = source.split(concreteSourceStrings.splittingKey);
            tag.forSource = findForAllArguments(forStampArguments[0], beforejs.parse(forStampArguments[1]));
            this.traversingAST(tag.children).when(
               function dataTraversing(tagDataAst) {
                  tag.children = tagDataAst;
                  state.keep(tag);
               }.bind(this)
            );
            return state.promise;
         }
         return function forResolve() {
            return resolveStatement.call(this);
         };
      },
      module: function forModule(tag, data) {
         var statelessTag,
            fromAttr = tag.attribs.hasOwnProperty('for');

         statelessTag = { attribs: tag.attribs, children: tag.children, name: tag.name, raw: tag.raw, type: tag.type };

         function scrapeChildren(object, data, key, firstArgument) {
            if (firstArgument.key) {
               data[firstArgument.key] = key;
            }
            data[firstArgument.value] = object;
            return data;
         }

         function cleanData(firstArgument) {
            data[firstArgument.value] = undefined;
            if (firstArgument.key) {
               data[firstArgument.key] = undefined;
            }
            return data;
         }

         function resolveStatement() {

            var scopeArray = processExpressions({ type: 'var', name: tag.forSource.main, value: undefined }, data, this.calculators),
               type = whatType(scopeArray),
               iterator,
               typeFunction,
               clonedData,
               result;

            if (fromAttr) {
               clonedData = utils.clone(tag.attribs.for);
               tag.attribs.for = undefined;
            }

            if (!this.iterators || !this.iterators.length) {
               throw new Error('No iterators found!');
            }

            for (var i = 0; i < this.iterators.length; i++) {
               if (this.iterators[i].is(scopeArray)) {
                  iterator = this.iterators[i].iterator;
               }
            }

            if (!iterator) {
               throw new Error('No iterator for specific type of variable ' + tag.forSource.main.string + ' found!');
            }

            function iterate(entity, data, iterator) {
               var children = [];
               iterator(entity, function entityIterator(entity, key) {
                  children.push(this._process((fromAttr ? [statelessTag] : statelessTag.children), scrapeChildren(entity, data, key, tag.forSource)));
               }.bind(this));
               return children;
            }
            result = iterate.call(this, scopeArray, data, iterator);
            if (fromAttr) {
               tag.attribs.for = clonedData;
            }
            data = cleanData(tag.forSource);
            return result;
         }

         return function forModuleReturnable() {
            if (tag.children !== undefined) {
               return resolveStatement.call(this);
            }
         };
      }
   };
   return forM;
});