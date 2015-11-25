define('Core/tmpl/js/vdom', ['Core/tmpl/js/helpers/processExpressions', 'Core/tmpl/js/helpers/utils', 'Core/tmpl/js/helpers/seekingForVars', 'Core/tmpl/js/helpers/whatType', 'Core/tmpl/js/astModules/module', 'Core/tmpl/js/helpers/entityHelpers', 'Core/tmpl/js/astModules/if', 'Core/tmpl/js/astModules/for', 'Core/tmpl/js/astModules/else', 'Core/tmpl/js/astModules/partial', 'Core/tmpl/js/astModules/includeAMD', 'Core/tmpl/js/astModules/template'], function processingModule(processExpressions, utils, seekingForVars, whatType, moduleC, entityHelpers, ifM, forM, elseM, par, inc, tmp) {
   var vdom = {
      _modules: {
         'if': ifM,
         'for': forM,
         'else': elseM,
         'partial': par,
         'include': inc,
         'template': tmp
      },
      _attributeModules: {
         'if': ifM,
         'for': forM,
      },

      vdomUtils: {},
      vdomEvents: {},
      isVirtualNode: function isVirtualNode(entity) {
         return this.vdomUtils.isVNodeType(entity) || this.vdomUtils.isTextNodeType(entity) || this.vdomUtils.isControlVNodeType(entity);
      },
      vdomUtilsHandler: function vdomUtilsHandler(vdomUtils) {
         return {
            htmlNode: vdomUtils.htmlNode,
            textNode: vdomUtils.textNode,
            controlNode: vdomUtils.controlNode,
            isVNodeType: vdomUtils.isVNodeType,
            isTextNodeType: vdomUtils.isTextNodeType,
            isControlVNodeType: vdomUtils.isControlVNodeType
         }
      },
      vdomEventsHandler: function vdomEvents(vdomUtils) {
         return {
            methodEvent: vdomUtils.methodEvent,
            commandEvent: vdomUtils.commandEvent
         }
      },
      getVdom: function getVdom(ast, data, vdomUtils) {
         this.vdomUtils = this.vdomUtilsHandler(vdomUtils);
         this.vdomEvents = this.vdomEventsHandler(vdomUtils);
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
         if (entityHelpers.isControl(entity.type)) {
            return this._processControl;
         }
         if (entityHelpers.isText(entity.type)) {
            return this._processText;
         }
      },
      /**
       * Concating arrays of entities
       * @param  {Object} entity Tag, text
       * @return {Object}
       */
      _stopArrs: function stopArrs(entity) {
         var i;
         if (whatType(entity) === 'array') {
            for (i = 0; i < entity.length; i++) {
               return entity[i];
            }
         }
         return entity;
      },
      /**
       * Seek for methods
       * @param  {Object} entity Tag, text, module
       * @param  {Object} data   Data object
       * @return {Object}        Generated Object
       */
      _seek: function _seek(entity, data, prev, next) {
         var method = this._whatMethodShouldYouUse(entity);
         if (method) {
            entity.prev = prev;
            entity.next = next;
            return method.call(this, entity, data);
         }
      },
      _mockAst: function mockAst(entity, ast) {
         if (entity.length && entity.length > 0) {
            return utils.flattenArray(ast, entity);
         }
         ast.push(entity);
         return ast;
      },
      /**
       * Processing data types of entities
       * @param  {String} unTextData Value of data object
       * @param  {Object} data       Data
       * @return {String}
       */
      _processDataTypes: function processDataTypes(unTextData, data) {
         return seekingForVars.call(this, unTextData, data);
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
            if (textData.length === 1) {
               return processExpressions(textData[0], data);
            }
            for (i = 0; i < textData.length; i++) {
               string += processExpressions(textData[i], data);
            }
            return string;
         }
         return processExpressions(textData, data);
      },
      _checkForDeadAttributes: function checkForDeadAttributes(processed) {
         if (utils.isString(processed)) {
            return utils.removeAllSpaces(processed) !== "";
         }
         return true;
      },
      _processStyles: function processStyles(styles) {
         var arStyles = styles.split(';'), i, obStyles = {}, changer;
         for (i = 0; i < arStyles.length; i++) {
            if (arStyles[i] !== "") {
               changer = arStyles[i].trim().split(':');
               if (changer[1] !== undefined) {
                  obStyles[changer[0]] = changer[1].trim();
               }
            }
         }
         return obStyles;
      },
      /**
       * Process attributes
       * @param  {Object} attribs Tag attributes
       * @param  {Object} data    Data
       * @return {Object}
       */
      _processAttributes: function processAttributes(attribs, data) {
         var object = {},
            processed;
         if (attribs) {
            for (var attrib in attribs) {
               if (attribs.hasOwnProperty(attrib) && attribs[attrib]) {
                  processed = this._processData(attribs[attrib].data, data);
                  if (this._checkForDeadAttributes(processed)) {
                     if (utils.isProperty(attrib)) {
                        object[attrib] = processed;
                     } else if (utils.isStyle(attrib)) {
                        object.style = this._processStyles(processed);
                     } else {
                        if (!object.attributes) {
                           object.attributes = {};
                        }
                        object.attributes[attrib] = processed;
                     }
                  }
               }
            }
         }
         return object;
      },
      /**
       * Process Text entity
       * @param  {Object} text Text
       * @param  {Object} data Data
       * @return {String}
       */
      _processText: function processText(text, data) {
         var result = this._processData(text.data, data);
         if (whatType(result) === 'array') {
            for(var i=0; i<result.length; i++) {
               if (!this.isVirtualNode(result[i])) {
                  result[i] = this.vdomUtils.textNode(result[i]);
               }
            }
            return result;
         }
         if (this.isVirtualNode(result)) {
            return result;
         }
         return this.vdomUtils.textNode(result);
      },
      _processControl: function processControl(control, data) {
         return this.vdomUtils.controlNode(control.fn, data, data.key);
      },
      /**
       * Process Tag entity
       * @param  {Object} tag  Tag
       * @param  {Object} data Array
       * @return {String}
       */
      _processTag: function processTag(tag, data) {
         var attribs = this._processAttributes(tag.attribs, data);
         return this.vdomUtils.htmlNode(tag.name, attribs, this._process(tag.children, data), (attribs.attributes ? attribs.attributes.key : undefined));
      },
      _generateTag: function generateTag(tag, data) {
         var attribs = this._processAttributes(tag.attribs, data);
         return this.vdomUtils.htmlNode(tag.name, attribs, this._process(tag.children, data), (attribs.attributes ? attribs.attributes.key : undefined));
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
      _processTag: function generateTag(tag, data) {
         return this._checkForManageableAttributes(tag, data);
      },
      /**
       * Recursive function for Array generation
       * @param  {Array} ast  AST array
       * @param  {Object} data Data
       * @return {Array}
       */
      _process: function process(ast, data) {
         var array = [], st;
         for (var i = 0; i < ast.length; i++) {
            st = this._seek(ast[i], data, ast[i - 1], ast[i + 1]);
            if (st) {
               array = this._mockAst(st, array);
            }
         }
         return array;
      }
   };
   return vdom
});