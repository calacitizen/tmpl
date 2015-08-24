var utils = require('./helpers/utils'),
  scopeUtils = require('./helpers/scopeUtils'),
  whatType = require('./helpers/whatType'),
  entityHelpers = require('./helpers/entityHelpers');
module.exports = {
  _modules: {
    'if': require('./astModules/if'),
    'for': require('./astModules/for'),
    'partial': require('./astModules/partialParse')
  },
  getHTMLString: function getHTMLString(ast, data) {
    return this._process(ast, data);
  },
  /**
   * Main function for finding traverse method for module
   */
  _processModule: function traverseModule(tag, data) {
    var moduleFunction = entityHelpers.moduleMatcher.call(this, tag);
    return entityHelpers.loadModuleFunction.call(this, moduleFunction, tag, data);
  },
  /**
   * Resolving method to handle tree childs
   */
  _whatMethodShouldYouUse: function whatMethodShouldYouUse(entity) {
    if (entityHelpers.isTag(entity.type)) {
      if (this._modules[entity.name]) {
        return this._processModule;
      }
      return this._processTag;
    }
    if (entityHelpers.isText(entity.type)) {
      return this._processText;
    }
  },
  _stopArrs: function _stopArrs(entity) {
    var string = '';
    if (whatType(entity) === 'array') {
      for (var i = 0; i < entity.length; i++) {
        string += entity[i];
      }
      return string;
    }
    return entity;
  },
  _seek: function _seek(entity, data) {
    var method = this._whatMethodShouldYouUse(entity);
    if (method) {
      return this._stopArrs(method.call(this, entity, data));
    }
    return;
  },
  _processDataTypes: function processDataTypes(unTextData, data) {
    var textVar = scopeUtils.seekForVars(unTextData, data);
    return (textVar !== undefined) ? textVar : '';
  },
  _processData: function processData(textData, data) {
    var string = '';
    if (textData.length !== undefined) {
      for (var i = 0; i < textData.length; i++) {
        string += this._processDataTypes(textData[i], data);
      }
      return string;
    }
    return this._processDataTypes(textData, data);
  },
  _processAttributes: function processAttributes(attribs, data) {
    var string = '';
    if (attribs) {
      string += ' ';
      for (var attrib in attribs) {
        if (attribs.hasOwnProperty(attrib)) {
          string += (attrib + '="' + this._processData(attribs[attrib].data, data) + '"');
        }
      }
    }
    return string;
  },
  _processText: function processText(text, data) {
    return this._processData(text.data, data);
  },
  _processTag: function processTag(tag, data) {
    return '<' + tag.name + this._processAttributes(tag.attribs, data) + '>' + this._process(tag.children, data) + '</' + tag.name + '>';
  },
  _process: function process(ast, data) {
    var string = '', st;
    for (var i = 0; i < ast.length; i++) {
       st = this._seek(ast[i], data);
      if (st) {
        string += st;
      }
    }
    return string;
  },
};
