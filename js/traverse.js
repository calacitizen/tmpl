var
  htmlparser = require('htmlparser'),
  utils = require('./helpers/utils'),
  scopeUtils = require('./helpers/scopeUtils'),
  VOW = require('./helpers/VOW');
module.exports = {
  _astTypes: ['tag', 'text', 'directive', 'comment', 'style', 'script'],
  _modules: {
    'if': require('./astModules/if'),
    'for': require('./astModules/for'),
    'include': require('./astModules/include'),
    'partial': require('./astModules/partial')
  },
  _regex: {
    forVariables: /\{\{ ?(.*?) ?\}\}/g
  },
  _includeStack: {},
  _tagStack: [],
  parse: function parse(tmpl, handler) {
    var
      handlerObject = new htmlparser.DefaultHandler(handler || this.defaultHandler, {
        ignoreWhitespace: true
      }),
      parser = new htmlparser.Parser(handlerObject);
    parser.parseComplete(tmpl);
    return handlerObject.dom;
  },
  _traverseTagAttributes: function traverseTagAttributes(attribs, scopeData) {
    var dataAttributes = utils.clone(attribs);
    return utils.eachObject(dataAttributes, function traverseTagAttributesEach(attrib) {
      return this._traverseText({
        data: attrib
      }, scopeData);
    }.bind(this));
  },
  _moduleMatcher: function moduleMatcher(tag) {
    return (this._modules[tag.name] !== undefined) ? this._modules[tag.name].module : false;
  },
  _replaceAllUncertainStuff: function replaceAllUncertainStuff(string) {
    return string.replace(this.safeReplaceSingleQuotesReg, this.safeReplaceSingleQuotesPlace).replace(this.safeReplaceCaseReg, this.safeReplaceCasePlace);
  },
  _createDataVar: function createDataVar(name, value) {
    return {
      type: 'var',
      name: name,
      value: value
    };
  },
  _createDataText: function createDataText(value) {
    return {
      type: 'text',
      value: value
    };
  },
  _searchForVars: function searchForVars(arrOfVars) {
    return utils.mapForLoop(arrOfVars, function searchForVarsLoop(value) {
      return value.split(this._regex.forVariables).join('');
    }.bind(this));
  },
  _replaceAndCreateStatements: function replaceAndCreateStatements(data, scopeData, arrOfVars) {
    return utils.mapForLoop(data, function searchInScope(value) {
      ssCheck = scopeUtils.checkStatementForInners(value, scopeData, arrOfVars);
      if (ssCheck.isVar) {
        return this._createDataVar(value, ssCheck.value);
      }
      return this._createDataText(value);
    }.bind(this));
  },
  _replaceMatch: function replaceMatch(str, scopeData) {
    var
      regExForVar = /\{\{ ?(.*?) ?\}\}/g,
      resString = this._replaceAllUncertainStuff(str.data),
      arrOfVars = resString.match(regExForVar),
      arrOfVarsClean,
      resultingObject = str,
      ssCheck;
    if (arrOfVars) {
      arrOfVarsClean = this._searchForVars(arrOfVars);
    }
    resultingObject.data = resString.split(regExForVar);
    if (arrOfVarsClean) {
      resultingObject.data = this._replaceAndCreateStatements(resultingObject.data, scopeData, arrOfVarsClean);
    } else {
      resultingObject.data = this._createDataText(resultingObject.data[0]);
    }
    return resultingObject;
  },
  _lookForStatements: function lookForStatements(statement, scopeData) {
    return this._replaceMatch(statement, scopeData);
  },
  _whatMethodShouldYouUse: function whatMethodShouldYouUse(entity) {
    if (this._isTag(entity.type)) {
      if (this._modules[entity.name]) {
        return this._traverseModule;
      }
      return this._traverseTag;
    }
    if (this._isText(entity.type)) {
      return this._traverseText;
    }
  },
  actionOnMainArray: function actionOnMainArray(modAST, traverseObject) {
    if (traverseObject !== undefined) {
      if (traverseObject.length > 0) {
        for (var i = 0; i < traverseObject.length; i++) {
          modAST.concat(this.actionOnMainArray(modAST, traverseObject[i]));
        }
      } else {
        modAST.push(traverseObject);
      }
    }
    traverseObject = null;
    return modAST;
  },
  _isTag: function isTag(type) {
    return type === 'tag';
  },
  _isText: function isText(type) {
    return type === 'text';
  },
  isTagInclude: function isTagInclude(name) {
    return name === 'include';
  },
  _collect: function collect(traverseMethod, value, scopeData) {
    var ps = traverseMethod.call(this, value, scopeData);
    if (this.isTagInclude(value.name)) {
      this._includeStack[value.attribs.name] = ps;
    } else {
      return ps;
    }
  },
  traversingAST: function traversingAST(ast, scopeData) {
    var traverseMethod,
      psArray = [],
      collect;
    for (var i = 0; i < ast.length; i++) {
      traverseMethod = this._whatMethodShouldYouUse(ast[i]);
      if (traverseMethod) {
        collect = this._collect(traverseMethod, ast[i], scopeData);
        if (collect !== undefined) {
          psArray.push(collect);
        }
      }
    }
    return VOW.every(psArray);
  },
  traverse: function (ast, data, config) {
    var oath;
    oath = this.traversingAST(ast, data).when(function resulting(data) {
      return this.actionOnMainArray([], data);
    }.bind(this));
    return oath;
  },
  _loadModuleFunction: function loadModuleFunction(tagModule, tag, scopeData) {
    var
      moduleFunction = tagModule(tag, scopeData),
      res = moduleFunction.call(this);
    if (res) {
      return res;
    }
    return undefined;
  },
  _generatorFunctionForTags: function generatorFunctionForTags(tag, inner) {
    tag.children = this.actionOnMainArray([], inner);
    return tag;
  },
  _traverseTag: function traverseTag(tag, scopeData) {
    var vow = VOW.make(),
      attribs = this._traverseTagAttributes(tag.attribs, scopeData),
      takeTag = this._createTag(tag.name, tag.data, tag.raw, attribs, tag.children);
    if (takeTag.children && takeTag.children.length > 0) {
      return this.traversingAST(takeTag.children, scopeData).when(
        function traverseTagSuccess(ast) {
          return this._generatorFunctionForTags(takeTag, ast);
        }.bind(this),
        function brokenTagTraversing(reason) {
          throw new Error(reason);
        }
      );
    } else {
      vow.keep(this._generatorFunctionForTags(takeTag))
      return vow.promise;
    }
  },
  _traverseModule: function traverseModule(tag, scopeData) {
    var tagModule = this._moduleMatcher(tag);
    return this._loadModuleFunction(tagModule, tag, scopeData);
  },
  _traverseText: function traverseText(text, scopeData) {
    var text = utils.clone(text),
      vow = VOW.make();
    if (text.hasOwnProperty('type')) {
      vow.keep(this._lookForStatements(text, scopeData));
      return vow.promise;
    }
    return this._lookForStatements(text, scopeData);
  },
  _createTag: function createTag(name, data, raw, attribs, children) {
    return {
      name: name,
      data: data,
      raw: raw,
      attribs: attribs,
      children: children,
      type: "tag"
    };
  },
  defaultHandler: function defaultHandler(error, dom) {
    if (error) {
      throw new Error(error);
    }
  }
};
