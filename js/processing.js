var utils = require('./helpers/utils'),
   seekingForVars = require('./helpers/seekingForVars'),
   whatType = require('./helpers/whatType'),
   moduleC = require('./astModules/module'),
   decorators = {},
   entityHelpers = require('./helpers/entityHelpers');
module.exports = {
   _modules: {
      'if': require('./astModules/if'),
      'for': require('./astModules/for'),
      'else': require('./astModules/else'),
      'partial': require('./astModules/partial'),
      'include': require('./astModules/include'),
      'template': require('./astModules/template')
   },
   _attributeModules: {
      'if': require('./astModules/if'),
      'for': require('./astModules/for'),
      'else': require('./astModules/else')
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
   _processOptionModule: function processOptionModule(tag, data) {
      return entityHelpers.loadModuleFunction.call(this, moduleC.module, tag, data);
   },
   /**
    * Main function for finding process method for module
    * @param  {Object} tag  Tag
    * @param  {Object} data Data object
    * @return {Object}      Entity: tag or text
    */
   _processModule: function processModule(tag, data) {
      var moduleFunction = entityHelpers.moduleMatcher.call(this, tag);
      return entityHelpers.loadModuleFunction.call(this, moduleFunction, tag, data);
   },
   _handlingTag: function handlingTag(name) {
      if (this._modules[utils.splitWs(name)]) {
         return this._processModule;
      }
      if (entityHelpers.isTagRequirable(name)) {
         return this._processOptionModule;
      }
      return this._processTag;
   },
   /**
    * Resolving method to handle tree childs
    * @param  {Object} entity Tag, text, module
    * @return {Function}        Process function
    */
   _whatMethodShouldYouUse: function whatMethodShouldYouUse(entity) {
      if (entityHelpers.isTag(entity.type)) {
         return this._handlingTag(entity.name);
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
   _stopArrs: function stopArrs(entity) {
      var string = '', i;
      if (whatType(entity) === 'array') {
         for (i = 0; i < entity.length; i++) {
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
   _seek: function _seek(entity, data, prev, next) {
      var method = this._whatMethodShouldYouUse(entity);
      entity.prev = prev;
      entity.next = next;
      if (method) {
         return this._stopArrs(method.call(this, entity, data));
      }
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
      var string = '', i;
      if (textData.length) {
         for (i = 0; i < textData.length; i++) {
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
         processed,
         attrib;
      if (attribs) {
         for (attrib in attribs) {
            if (attribs.hasOwnProperty(attrib) && attribs[attrib]) {
               processed = this._processData(attribs[attrib].data, data);
               if (utils.removeAllSpaces(processed) !== "") {
                  string += ' ' + (attrib + '="' + processed + '"');
               }
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
   _generateTag: function generateTag(tag, data) {
      return '<' + tag.name + this._processAttributes(tag.attribs, data) + '>' + this._process(tag.children, data) + '</' + tag.name + '>';
   },
   _processManageableAttributes: function processManageableAttributes(attribs) {
      var constructArray = [], attrib;
      for (attrib in attribs) {
         if (this._attributeModules.hasOwnProperty(attrib) && attribs[attrib]) {
            if (attrib === 'if') {
               constructArray.unshift({ module: attrib, value: utils.clone(attribs[attrib]) });
            } else {
               constructArray.push({ module: attrib, value: utils.clone(attribs[attrib]) });
            }
         }
      }
      return constructArray;
   },
   _useManageableAttributes: function useManageableAttributes(tag, data) {
      var constructArray = this._processManageableAttributes(tag.attribs);
      if (!!constructArray.length) {
         return entityHelpers.loadModuleFunction.call(this, entityHelpers.attributeParserMatcherByName.call(this, constructArray.shift().module), tag, data);
      }
      return this._generateTag(tag, data);
   },
   _checkForManageableAttributes: function checkForManageableAttributes(tag, data) {
      if (tag.attribs) {
         return this._useManageableAttributes(tag, data);
      }
      return this._generateTag(tag, data);
   },
   /**
    * Process Tag entity
    * @param  {Object} tag  Tag
    * @param  {Object} data Array
    * @return {String}
    */
   _processTag: function processTag(tag, data) {
      return this._checkForManageableAttributes(tag, data);
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
         st = this._seek(ast[i], data, ast[i-1], ast[i+1]);
         if (st) {
            string += st;
         }
      }
      return string;
   }
};
