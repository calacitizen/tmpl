var utils = require('./helpers/utils'),
  scopeUtils = require('./helpers/scopeUtils');
module.exports = {
  _modules: {
    'if': require('./astModules/if'),
    'for': require('./astModules/for'),
    'partial': require('./astModules/partialParse')
  },
  fnDataName: "tm",
  mainVar: "ast",
  fnGenerateText: 'function createText(data, raw) { return { data: data, raw: raw, type: \'text\' } };',
  fnGenerateTag: 'function createTag(name, data, raw, attribs, children) { return { name: name, data: data, raw: raw, attribs: attribs, children: children, type: \'tag\' }; };',
  /**
   * Function generation
   */
  fnGen: function fnGen(inner) {
    return 'function templateGenAST(tm) { var ' + this.mainVar + '= []; ' + this.fnGenerateText + ' ' + this.fnGenerateTag + ' ' + inner + ' return ' + this.mainVar + '; }';
  },
  /**
   * Starting point
   */
  stamping: function stamping(ast) {
    return this.fnGen(this.stampingAST(ast));
  },
  /**
   * Tag string creation
   */
  createTagString: function createTagString(name, data, raw, attribs, children) {
    return this.mainVar + '.push(createTag(' + '\'' + name + '\'' + ', ' + '\'' + data + '\'' + ', ' + '\'' + raw + '\'' + ', ' + attribs + ', ' + children + '));';
  },
  /**
   * Text string creation
   */
  createTextString: function createTextString(data, raw) {
    return this.mainVar + '.push(createText(' + data + ',' + '\'' + raw + '\'' + '));';
  },
  /**
   *  create data text
   */
  createDataText: function createDataText(value) {
    return '{type:\'text\', value:\'' + value + '\'}';
  },
  /**
   * create data variable
   */
  createDataVar: function createDataVar(name, value) {
    return '{type:\'var\', name:\'' + name + '\', value:\'' + value + '\'}';
  },
  /**
   *
   */
  whatTypeOfData: function whatTypeOfVar(dataItem) {
    if (dataItem.type === 'var') {
      return this.createDataVar(dataItem.name, dataItem.value);
    }
    return this.createDataText(dataItem.value);
  },
  /**
   *
   */
  createDataArray: function createDataArray(data) {
    var string = '[';
    for (var i = 0; i < data.length; i++) {
      string += this.whatTypeOfData(data[i]);
      if ((data.length - 1) !== i) {
        string += ',';
      }
    }
    string += ']';
    return string;
  },
  createAttributeWithData: function createAttributeWithData(attrib, data) {
    return attrib + ':' + '{data:' + data + '},';
  },
  /**
   * Creating data array
   */
  createData: function createData(data) {
    if (data.length === undefined) {
      return this.whatTypeOfData(data);
    }
    return this.createDataArray(data);
  },
  /**
   * creating attributes
   */
  createAttribute: function createAttribute(name, data) {
    return this.createAttributeWithData(name, this.createData(data));
  },
  /**
   * Traversing tag with children
   */
  traverseTagWithChildren: function traverseTagWithChildren(takeTag) {
    return traversingAST(takeTag.children);
    return this.traversingAST(takeTag.children).when(
      function traverseTagSuccess(ast) {

      }.bind(this),
      function brokenTagTraversing(reason) {
        throw new Error(reason);
      }
    )
  },
  traverseTagAttributes: function traverseTagAttributes(attribs) {
    var string;
    if (attribs !== undefined) {
      string = '{';
      for (var attrib in attribs) {
        if (attribs.hasOwnProperty(attrib)) {
          string += this.createAttribute(attrib, attribs[attrib].data);
        }
      }
      string += '}';
    }
    return string;
  },
  /**
   * Main function for tag traversing
   */
  _traverseTag: function traverseTag(tag) {
    return this.createTagString(tag.name, tag.data, tag.raw, this.traverseTagAttributes(tag.attribs), '[]');
    // if (takeTag.children && takeTag.children.length > 0) {
    //   return this.createTagString(tag.name, tag.data, tag.raw, attribs, []);
    //   // return this.traverseTagWithChildren(takeTag);
    // } else {
    //   return this.createTagString(tag.name, tag.data, tag.raw, attribs, tag.children);
    // }
  },
  _traverseText: function traverseText(text) {
    return this.createTextString(this.createData(text.data), text.raw);
  },
  /**
   * Collecting states from traversing tree
   */
  _collect: function collect(traverseMethod, value) {
    return traverseMethod.call(this, value);
  },
  /**
   * Recursive traverse method
   */
  stampingAST: function stampingAST(ast) {
    var traverseMethod, string = "",
      collect;
    for (var i = 0; i < ast.length; i++) {
      traverseMethod = this._whatMethodShouldYouUse(ast[i]);
      if (traverseMethod) {
        collect = this._collect(traverseMethod, ast[i]);
        if (collect !== undefined) {
          string += collect;
        }
      }
    }
    return string;
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
        return undefined;
        // return this._traverseModule;
      }
      return this._traverseTag;
    }
    if (this._isText(entity.type)) {
      return this._traverseText;
    }
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
   * Main function for finding traverse method for module
   */
  _traverseModule: function traverseModule(tag, scopeData) {
    var tagModule = this._moduleMatcher(tag);
    return this._loadModuleFunction(tagModule, tag, scopeData);
  }
};
