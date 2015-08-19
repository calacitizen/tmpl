var utils = require('./helpers/utils'),
  scopeUtils = require('./helpers/scopeUtils');
module.exports = {
  _modules: {
    'if': require('./astModules/if'),
    'for': require('./astModules/for'),
    'partial': require('./astModules/partialParse')
  },
  fnDataName: "tm",
  fnGen: function fnGen(inner) {
    return 'function templateGenAST(tm) { ' + inner + ' }';
  },
  /**
   * Searching modules by the tag names
   */
  _moduleMatcher: function moduleMatcher(tag) {
    return (this._modules[tag.name] !== undefined) ? this._modules[tag.name].module : false;
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
   * Collecting states from traversing tree
   */
  _collect: function collect(traverseMethod, value, scopeData) {
    var ps = traverseMethod.call(this, value, scopeData);
    return ps;
  },
  /**
   * Recursive traverse method
   */
  stampingAST: function stampingAST(ast) {
    
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
    return State.every(psArray);
  },

  /**
   * Starting point
   */
  stamping: function (ast) {
    return this.fnGen(this.stampingAST(ast));
  },
  /**
   * Loading module function
   */
  _loadModuleFunction: function loadModuleFunction(tagModule, tag, scopeData) {
    var
      moduleFunction = tagModule(tag, scopeData),
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
  _traverseTag: function traverseTag(tag, scopeData) {
    var state,
      attribs = this._traverseTagAttributes(tag.attribs, scopeData),
      takeTag = this._createTag(tag.name, tag.data, tag.raw, attribs, tag.children);
    if (takeTag.children && takeTag.children.length > 0) {
      return this.traverseTagWithChildren(takeTag, scopeData);
    } else {
      state = State.make();
      state.keep(this._generatorFunctionForTags(takeTag))
      return state.promise;
    }
  },
  /**
   * Main function for finding traverse method for module
   */
  _traverseModule: function traverseModule(tag, scopeData) {
    var tagModule = this._moduleMatcher(tag);
    return this._loadModuleFunction(tagModule, tag, scopeData);
  }
};
