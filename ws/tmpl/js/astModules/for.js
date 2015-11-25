define('Core/tmpl/js/astModules/for', ['Core/tmpl/js/helpers/checkStatements', 'Core/tmpl/js/helpers/whatType', 'Core/tmpl/js/helpers/challengeModuleValues', 'Core/tmpl/js/helpers/utils'], function (checkStatements, whatType, challenge, utils) {
   var forM = {
      module: function forModule(tag, data) {
         var
            source,
            types = {
               'array': fArray,
               'object': fObject
            },
            concreteSourceStrings = {
               splittingKey: ' in ',
               key: ' as '
            },
            forStampArguments,
            firstArgument,
            statelessTag,
            mainData;
         source = challenge(tag, 'for', true);
         forStampArguments = source.value.split(concreteSourceStrings.splittingKey);

         if (forStampArguments.length < 2) {
            throw new Error('Wrong arguments in for statement');
         }
         mainData = checkStatements(forStampArguments[1], data, [forStampArguments[1]]);

         if (!mainData.value) {
            throw new Error(mainData.name + ' variable is undefined');
         }

         firstArgument = forFindAllArguments(forStampArguments[0]);
         statelessTag = { attribs: tag.attribs, children: tag.children, name: tag.name, raw: tag.raw, type: tag.type };
         function forFindAllArguments(value) {
            var crStringArray = value.split(concreteSourceStrings.key);
            if (crStringArray.length > 1) {
               return {
                  key: crStringArray[0],
                  value: crStringArray[1]
               };
            }
            return {
               key: undefined,
               value: crStringArray[0]
            };
         }

         function scrapeChildren(object, data, key, firstArgument) {
            if (utils.isWsIncluded() && ($ws.helpers.instanceOfModule(object, 'SBIS3.CONTROLS.Record') || $ws.helpers.instanceOfModule(object, 'SBIS3.CONTROLS.DataSet'))) {
               data[firstArgument.value] = object;
            } else {
               data[firstArgument.value] = object[key];
            }
            if (firstArgument.key) {
               data[firstArgument.key] = key;
            }
            return data;
         }

         function cleanData(firstArgument) {
            data[firstArgument.value] = undefined;
            if (firstArgument.key) {
               data[firstArgument.key] = undefined;
            }
            return data;
         }

         function fDataSet(dataset, data) {
            var children = [], i = 0;
            dataset.each(function fDataSetCallBack(entity) {
               children.push(this._process(utils.clone((source.fromAttr ? [statelessTag] : statelessTag.children)), scrapeChildren(entity, data, i++, firstArgument)));
            }.bind(this));
            return children;
         }

         function fArray(array, data) {
            var children = [], i;
            for (i = 0; i < array.length; i++) {
               children.push(this._process(utils.clone((source.fromAttr ? [statelessTag] : statelessTag.children)), scrapeChildren(array, data, i, firstArgument)));
            }
            return children;
         }

         function fObject(object, data) {
            var children = [], key;
            for (key in object) {
               if (object.hasOwnProperty(key)) {
                  children.push(this._process(utils.clone((source.fromAttr ? [statelessTag] : statelessTag.children)), scrapeChildren(object, data, key, firstArgument)));
               }
            }
            return children;
         }

         function resolveStatement(dataToIterate) {
            var scopeArray = dataToIterate.value,
               type = whatType(scopeArray),
               typeFunction,
               clonedData,
               result;

            if (source.fromAttr) {
               clonedData = utils.clone(tag.attribs.for);
               tag.attribs.for = undefined;
            }

            if (type === 'object') {
               if (utils.isWsIncluded()) {
                  $ws.helpers.instanceOfModule(scopeArray, 'SBIS3.CONTROLS.DataSet');
                  typeFunction = fDataSet;
               } else {
                  typeFunction = types[type];
               }
            } else {
               typeFunction = types[type];
            }

            if (typeFunction === undefined) {
               throw new Error('Wrong type in for statement arguments');
            }
            result = typeFunction.call(this, scopeArray, data);
            if (source.fromAttr) {
               tag.attribs.for = clonedData;
            }
            data = cleanData(firstArgument);
            return result;
         }

         return function forModuleReturnable() {
            if (tag.children !== undefined) {
               return resolveStatement.call(this, mainData);
            }
         };
      }
   };
   return forM;
});