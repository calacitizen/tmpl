var checkStatements = require('../helpers/checkStatements'),
    whatType = require('../helpers/whatType'),
    utils = require('../helpers/utils');
module.exports = {
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
            mainData;

        if (tag.attribs.data.data === undefined) {
            throw new Error('There is no data for "for" module to use');
        }

        source = tag.attribs.data.data.value.trim();
        forStampArguments = source.split(concreteSourceStrings.splittingKey);

        if (forStampArguments.length < 2) {
            throw new Error('Wrong arguments in for statement');
        }
        mainData = checkStatements(forStampArguments[1], data, [forStampArguments[1]]);

        if (!mainData.value) {
            throw new Error(mainData.name + ' variable is undefined');
        }

        firstArgument = forFindAllArguments(forStampArguments[0]);

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
            if (utils.isWsIncluded()) {
                if ($ws.helpers.instanceOfModule(object, 'SBIS3.CONTROLS.Record') || $ws.helpers.instanceOfModule(object, 'SBIS3.CONTROLS.DataSet')) {
                    data[firstArgument.value] = object;
                }
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
                children.push(this._process(utils.clone(tag.children), scrapeChildren(entity, data, i++, firstArgument)));
            }.bind(this));
            return children;
        }

        function fArray(array, data) {
            var children = [];
            for (var i = 0; i < array.length; i++) {
                children.push(this._process(utils.clone(tag.children), scrapeChildren(array, data, i, firstArgument)));
            }
            return children;
        }

        function fObject(object, data) {
            var children = [];
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    children.push(this._process(utils.clone(tag.children), scrapeChildren(object, data, key, firstArgument)));
                }
            }
            return children;
        }

        function resolveStatement(dataToIterate) {
            var scopeArray = dataToIterate.value,
                type = whatType(scopeArray),
                typeFunction,
                result;

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
