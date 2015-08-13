var checkSource = require('../helpers/checkSource'),
  scopeUtils = require('../helpers/scopeUtils'),
  whatType = require('../helpers/whatType'),
  utils = require('../helpers/utils'),
  VOW = require('../helpers/VOW');
module.exports = {
  module: function forModule(tag, data) {
    var
      source = tag.attribs.data.trim(),
      types = {
        'array': fArray,
        'object': fObject
      },
      concreteSourceStrings = {
        splittingKey: ' in ',
        key: ' as '
      },
      forStampArguments = source.split(concreteSourceStrings.splittingKey),
      firstArgument,
      mainData;

    if (forStampArguments.length < 2) {
      throw new Error('Wrong arguments in for statement');
    }

    mainData = scopeUtils.checkStatementForInners(forStampArguments[1], data, [forStampArguments[1]]);

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
      data[firstArgument.value] = object[key];
      if (firstArgument.key) {
        data[firstArgument.key] = key;
      }
      return data;
    }

    function fArray(array, data) {
      var children = [];
      for (var i = 0; i < array.length; i++) {
        children.push(this.traversingAST(utils.clone(tag.children), scrapeChildren(array, data, i, firstArgument)));
      }
      return VOW.every(children);
    }

    function fObject(object, data) {
      var children = [];
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          children.push(this.traversingAST(utils.clone(tag.children), scrapeChildren(object, data, key, firstArgument)));
        }
      }
      return VOW.every(children);
    }

    function resolveStatement(dataToIterate) {
      var scopeArray = dataToIterate.value,
        scopeData = utils.clone(data),
        typeFunction = types[whatType(scopeArray)],
        ps;
      if (typeFunction === undefined) {
        throw new Error('Wrong type in for statement arguments');
      }
      ps = types[whatType(scopeArray)].call(this, scopeArray, scopeData);
      ps.when(function resolveStatementFor(data) {
        return this.actionOnMainArray([], data);
      }.bind(this), function brokenFor(reason) {
        throw new Error(reason);
      });
      return ps;
    }

    return function forModuleReturnable() {
      if (tag.children !== undefined) {
        return resolveStatement.call(this, mainData);
      }
    }
  }
}
