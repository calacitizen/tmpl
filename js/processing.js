var utils = require('./helpers/utils'),
  seekingForVars = require('./helpers/seekingForVars'),
  whatType = require('./helpers/whatType'),
  entityHelpers = require('./helpers/entityHelpers');
module.exports = {
  _modules: {
    'if': require('./astModules/if'),
    'for': require('./astModules/for'),
    'partial': require('./astModules/partialParse')
  },
  /**
   * Getting html string
   * @param  {Array} ast  AST array of entities
   * @param  {Object} data Data
   * @return {String}      Generated html-string
   */
  getHTMLString: function getHTMLString(ast, data) {
    return this._process(ast, data);
  },
  /**
   * Main function for finding process method for module
   * @param  {Object} tag  Tag
   * @param  {Object} data Data object
   * @return {Object}      Entity: tag or text
   */
  _processModule: function traverseModule(tag, data) {
    var moduleFunction = entityHelpers.moduleMatcher.call(this, tag);
    return entityHelpers.loadModuleFunction.call(this, moduleFunction, tag, data);
  },
  /**
   * Resolving method to handle tree childs
   * @param  {Object} entity Tag, text, module
   * @return {Function}        Process function
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
  /**
   * Concating arrays of entities
   * @param  {Object} entity Tag, text
   * @return {String}
   */
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
  /**
   * Seek for methods
   * @param  {Object} entity Tag, text, module
   * @param  {Object} data   Data object
   * @return {String}        Generated string
   */
  _seek: function _seek(entity, data) {
    var method = this._whatMethodShouldYouUse(entity);
    if (method) {
      return this._stopArrs(method.call(this, entity, data));
    }
    return;
  },
  /**
   * Processing data types of entities
   * @param  {String} unTextData Value of data object
   * @param  {Object} data       Data
   * @return {String}
   */
  _processDataTypes: function processDataTypes(unTextData, data) {
    var textVar = seekingForVars(unTextData, data);
    return (textVar !== undefined && textVar !== null) ? textVar : '';
  },
  /**
   * Processing entity data objects
   * @param  {Array} textData Array of data
   * @param  {Object} data     Data
   * @return {String}
   */
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
  /**
   * Process attributes
   * @param  {Object} attribs Tag attributes
   * @param  {Object} data    Data
   * @return {String}
   */
  _processAttributes: function processAttributes(attribs, data) {
    var string = '',
        processed;
    if (attribs) {
      string += ' ';
      for (var attrib in attribs) {
        if (attribs.hasOwnProperty(attrib)) {
          processed = this._processData(attribs[attrib].data, data);
          if (utils.removeAllSpaces(processed) !== "") {
            string += (attrib + '="' + processed + '"');
          }
          console.log(attrib, attribs[attrib], processed);
        }
      }
    }
    return string;
  },
  /**
   * Process Text entity
   * @param  {Object} text Text
   * @param  {Object} data Data
   * @return {String}
   */
  _processText: function processText(text, data) {
    return this._processData(text.data, data);
  },
  /**
   * Process Tag entity
   * @param  {Object} tag  Tag
   * @param  {Object} data Array
   * @return {String}
   */
  _processTag: function processTag(tag, data) {
    return '<' + tag.name + this._processAttributes(tag.attribs, data) + '>' + this._process(tag.children, data) + '</' + tag.name + '>';
  },
  /**
   * Recursive function for string generation
   * @param  {Array} ast  AST array
   * @param  {Object} data Data
   * @return {String}
   */
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
  // _processNon: function _processNon(ast, data) {
  //   var stack = [];
  //   stack.push(ast);
  //   while (stack.length) {
  //       for (var j in stack[0]) {
  //           if (typeof stack[0][j] === 'object') {
  //               stack.push(stack[0][j]);
  //               if (stack[0][j].raw !== undefined) {
  //                 console.log(stack[0][j]);
  //               }
  //           }
  //       }
  //       stack.shift();
  //   }
  // }
};
