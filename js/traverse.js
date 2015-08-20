var
  htmlparser = require('htmlparser'),
  utils = require('./helpers/utils'),
  scopeUtils = require('./helpers/skipVars'),
  State = require('./helpers/State');
module.exports = {
  _modules: {
    'include': require('./astModules/include'),
    'partial': require('./astModules/partial')
  },
  _regex: {
    forVariables: /\{\{ ?(.*?) ?\}\}/g
  },
  safeReplaceCaseReg: /\r|\n|\t|\/\*[\s\S]*?\*\//g,
  safeReplaceCasePlace: "",
  _includeStack: {},
  /**
   * Parsing html string to the directive state
   */
  parse: function parse(tmpl, handler) {
    var
      handlerObject = new htmlparser.DefaultHandler(handler || this.defaultHandler, {
        ignoreWhitespace: true
      }),
      parser = new htmlparser.Parser(handlerObject);
    parser.parseComplete(tmpl);
    return handlerObject.dom;
  },
  /**
   * Atribute traverse in order to find variables
   */
  _traverseTagAttributes: function traverseTagAttributes(attribs, scopeData) {
    var dataAttributes = utils.clone(attribs);
    return utils.eachObject(dataAttributes, function traverseTagAttributesEach(attrib) {
      return this._traverseText({
        data: attrib
      }, scopeData);
    }.bind(this));
  },
  /**
   * Searching modules by the tag names
   */
  _moduleMatcher: function moduleMatcher(tag) {
    return (this._modules[tag.name] !== undefined) ? this._modules[tag.name].module : false;
  },
  /**
   * Removing unnecessary stuf from strings
   */
  _replaceAllUncertainStuff: function replaceAllUncertainStuff(string) {
    return string.trim().replace(this.safeReplaceSingleQuotesReg, this.safeReplaceSingleQuotesPlace).replace(this.safeReplaceCaseReg, this.safeReplaceCasePlace);
  },
  /**
   * Searching for vars in string
   */
  _searchForVars: function searchForVars(arrOfVars) {
    return utils.mapForLoop(arrOfVars, function searchForVarsLoop(value) {
      return value.split(this._regex.forVariables).join('');
    }.bind(this));
  },
  /**
   * Replacing and creating statements for variables and text chunks
   */
  _replaceAndCreateStatements: function replaceAndCreateStatements(data, arrOfVars) {
    return utils.mapForLoop(data, function searchInScope(value) {
      ssCheck = scopeUtils.checkStatementForInners(value, arrOfVars);
      if (ssCheck.isVar) {
        return this._createDataVar(value, ssCheck.value);
      }
      return this._createDataText(value);
    }.bind(this));
  },
  /**
   * Preparing string for structured tree
   */
  _replaceMatch: function replaceMatch(str) {
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
      resultingObject.data = this._replaceAndCreateStatements(resultingObject.data, arrOfVarsClean);
    } else {
      resultingObject.data = this._createDataText(resultingObject.data[0]);
    }
    return resultingObject;
  },
  /**
   * Looking for variables in strings
   */
  _lookForStatements: function lookForStatements(statement) {
    return this._replaceMatch(statement);
  },
  /**
   * Resolving method to handle tree childs
   */
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
  /**
   * Concating childs into the main array
   */
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
  /**
   * Collecting states from traversing tree
   */
  _collect: function collect(traverseMethod, value) {
    var ps = traverseMethod.call(this, value);
    if (this.isTagInclude(value.name)) {
      this._includeStack[value.attribs.name] = ps;
    } else {
      return ps;
    }
  },
  /**
   * Recursive traverse method
   */
  traversingAST: function traversingAST(ast) {
    var traverseMethod,
      psArray = [],
      collect;
    for (var i = 0; i < ast.length; i++) {
      traverseMethod = this._whatMethodShouldYouUse(ast[i]);
      if (traverseMethod) {
        collect = this._collect(traverseMethod, ast[i]);
        if (collect !== undefined) {
          psArray.push(collect);
        }
      }
    }
    return State.every(psArray);
  },
  /**
   * Starting point
   */
  traverse: function (ast, config) {
    return this.traversingAST(ast).when(
      function resulting(data) {
        return this.actionOnMainArray([], data);
      }.bind(this),
      function broken(reason) {
        throw new Error(reason);
      }
    );
  },
  /**
   * Loading module function
   */
  _loadModuleFunction: function loadModuleFunction(tagModule, tag) {
    var
      moduleFunction = tagModule(tag),
      res = moduleFunction.call(this);
    if (res) {
      return res;
    }
    return undefined;
  },
  /**
   * Generating tag and tag childs
   */
  _generatorFunctionForTags: function generatorFunctionForTags(tag, inner) {
    tag.children = this.actionOnMainArray([], inner);
    return tag;
  },
  /**
   * Traversing tag with children
   */
  traverseTagWithChildren: function traverseTagWithChildren(takeTag, data) {
    return this.traversingAST(takeTag.children, data).when(
      function traverseTagSuccess(ast) {
        return this._generatorFunctionForTags(takeTag, ast);
      }.bind(this),
      function brokenTagTraversing(reason) {
        throw new Error(reason);
      }
    )
  },
  /**
   * Main function for tag traversing
   */
  _traverseTag: function traverseTag(tag) {
    var state,
      attribs = this._traverseTagAttributes(tag.attribs),
      takeTag = this._createTag(tag.name, tag.data, tag.raw, attribs, tag.children);
    if (takeTag.children && takeTag.children.length > 0) {
      return this.traverseTagWithChildren(takeTag);
    } else {
      state = State.make();
      state.keep(this._generatorFunctionForTags(takeTag))
      return state.promise;
    }
  },
  /**
   * Main function for finding traverse method for module
   */
  _traverseModule: function traverseModule(tag) {
    var tagModule = this._moduleMatcher(tag);
    return this._loadModuleFunction(tagModule, tag);
  },
  /**
   * Text node traversing
   */
  _traverseText: function traverseText(text) {
    var text = utils.clone(text),
      state = State.make();
    if (text.hasOwnProperty('type')) {
      text.raw = this._replaceAllUncertainStuff(text.raw);
      state.keep(this._lookForStatements(text));
      return state.promise;
    }
    return this._lookForStatements(text);
  },
  /**
   * Is tag?
   */
  _isTag: function isTag(type) {
    return type === 'tag';
  },
  /**
   * Is text?
   */
  _isText: function isText(type) {
    return type === 'text';
  },
  /**
   * is Include
   */
  isTagInclude: function isTagInclude(name) {
    return name === 'include';
  },
  /**
   * Creating vars for data
   */
  _createDataVar: function createDataVar(name, value) {
    return {
      type: 'var',
      name: name,
      value: value
    };
  },
  /**
   * Creating text chuncks
   */
  _createDataText: function createDataText(value) {
    return {
      type: 'text',
      value: value
    };
  },
  /**
   * Creating tag
   */
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
  /**
   * Default handler for parsing
   */
  defaultHandler: function defaultHandler(error, dom) {
    if (error) {
      throw new Error(error);
    }
  }
};
