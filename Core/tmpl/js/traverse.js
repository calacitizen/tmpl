define('Core/tmpl/js/traverse', ['Core/tmpl/js/jison/htmlparser', 'Core/tmpl/js/helpers/utils', 'Core/tmpl/js/helpers/skipVars', 'Core/tmpl/js/helpers/State', 'Core/tmpl/js/astModules/module', 'Core/tmpl/js/helpers/entityHelpers', 'Core/tmpl/js/astModules/includeAMD', 'Core/tmpl/js/astModules/template', 'Core/tmpl/js/astModules/partial', 'Core/tmpl/js/astModules/if'], function traverseLoader(htmlparser, utils, skipVars, State, moduleC, entityHelpers, inc, tmp, par, ifM) {
   var traverse = {
      _modules: {
         'ws:include': inc,
         'ws:template': tmp,
         'ws:partial': par
      },
      _regex: {
         forVariables: /\{\{ ?(.*?) ?\}\}/g
      },
      safeReplaceCaseReg: /\r|\n|\t|\/\*[\s\S]*?\*\//g,
      safeReplaceCasePlace: "",
      /**
       * Include promises stack
       * @type {Object}
       */
      includeStack: {},
      /**
       * Parsing html string to the directive state
       * @param  {String} tmpl     string html template
       * @param  {Function} handler function for handling parsing result
       * @return {Array}           html AST
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
       * Attribute traverse in order to find variables
       * @param  {Array}        array of attributes
       * @return {Array}        array of attributes with variables
       */
      _traverseTagAttributes: function traverseTagAttributes(attribs) {
         var dataAttributes = utils.clone(attribs);
         return utils.eachObject(dataAttributes, function traverseTagAttributesEach(attrib) {
            return this._traverseText({
               data: attrib
            });
         }.bind(this));
      },
      /**
       * Removing unnecessary stuff from strings
       * @param  {String} string   data string
       * @return {String}         clean data string
       */
      _replaceAllUncertainStuff: function replaceAllUncertainStuff(string) {
         return string.trim().replace(this.safeReplaceCaseReg, this.safeReplaceCasePlace);
      },
      /**
       * Searching for vars in string
       * @param  {Array} arrOfVars array of variables and text
       * @return {Array}           array of variables
       */
      _searchForVars: function searchForVars(arrOfVars) {
         return utils.mapForLoop(arrOfVars, function searchForVarsLoop(value) {
            return value.split(this._regex.forVariables).join('');
         }.bind(this));
      },
      /**
       * Replacing and creating statements for variables and text chunks
       * @param  {Array} data         array of incoming data
       * @param  {Array} arrOfVars    array with variables
       * @return {Array}              array with objects
       */
      _replaceAndCreateStatements: function replaceAndCreateStatements(data, arrOfVars) {
         var array = [], i, emptyString = "";
         for (i = 0; i < data.length; i++) {
            if (data[i] !== emptyString) {
               array.push(skipVars.checkStatementForInners(data[i], arrOfVars));
            }
         }
         return array;
      },
      _createDataObjectWorkWithProperty: function createDataObjectWorkWithProperty(data, arrOfVarsClean) {
         if (arrOfVarsClean) {
            return this._replaceAndCreateStatements(data, arrOfVarsClean);
         }
         return entityHelpers.createDataText(data[0]);
      },
      /**
       * Looking for variables in string data object
       * @param  {Object} strObjectData
       * @param  {Array} arrOfVarsClean Array of variables in data object
       * @return {Object}
       */
      _createDataObject: function createDataObject(strObjectData, arrOfVarsClean) {
         strObjectData.data = this._createDataObjectWorkWithProperty(strObjectData.data, arrOfVarsClean);
         return strObjectData;
      },
      /**
       * Preparing data-like string for structured tree
       * @param  {Object} str incoming data string
       * @return {Object}     data object { data: { type: "text", value: 'wadawd' } }
       */
      _replaceMatch: function replaceMatch(strObjectData) {
         var
            resString = this._replaceAllUncertainStuff(strObjectData.data),
            arrOfVars = resString.match(this._regex.forVariables),
            arrOfVarsClean;
         if (arrOfVars) {
            arrOfVarsClean = this._searchForVars(arrOfVars);
         }
         strObjectData.data = resString.split(this._regex.forVariables);
         return this._createDataObject(strObjectData, arrOfVarsClean);
      },
      /**
       *  Looking for variables in strings
       * @param  {String} statement   string statement
       * @return {Object}             data object { data: { type: "text", value: 'wadawd' } }
       */
      _lookForStatements: function lookForStatements(statement) {
         return this._replaceMatch(statement);
      },
      _handlingTag: function handlingTag(name) {
         if (this._modules[name]) {
            return this._traverseModule;
         }
         if (entityHelpers.isTagRequirable(name)) {
            return this._traverseOptionModule;
         }
         return this._traverseTag;
      },
      /**
       * Resolving method to handle tree childs
       * @param  {Object} entity  tag, text or module
       * @return {Function}       traverse method to use
       */
      _whatMethodShouldYouUse: function whatMethodShouldYouUse(entity) {
         if (entityHelpers.isTag(entity.type)) {
            return this._handlingTag(entity.name)
         }
         if (entityHelpers.isText(entity.type)) {
            return this._traverseText;
         }
      },

      /**
       * Perform action on main data array
       * @param  {Array} modAST         AST array
       * @param  {Object|Array} traverseObject object or array of objects with tag or text
       * @return {Array}                AST array
       */
      actionOnMainArray: function actionOnMainArray(modAST, traverseObject) {
         if (traverseObject !== undefined && traverseObject.length > 0) {
            for (var i = 0; i < traverseObject.length; i++) {
               modAST.push(traverseObject[i]);
            }
         }
         traverseObject = null;
         return modAST;
      },
      /**
       * Collecting states from traversing tree
       * @param  {Function} traverseMethod traverse function for entity
       * @param  {Object} value          Tag, text or module
       * @return {Object}                State promise
       */
      _collect: function collect(traverseMethod, value) {
         return traverseMethod.call(this, value);
      },

      /**
       * Traversing ast
       * @param  {Array} ast AST array
       * @return {Array}    array of State promises
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
       * @param  {Array} ast    [description]
       * @return {Object}       State promise
       */
      traverse: function traverse(ast, resolver) {
         if (resolver) {
            this.resolver = resolver;
         }
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
       * Generating tag and tag childs
       * @param  {Object} tag   tag
       * @param  {Array} inner children
       * @return {Object}      Tag
       */
      _generatorFunctionForTags: function generatorFunctionForTags(tag, inner) {
         tag.children = this.actionOnMainArray([], inner);
         return tag;
      },
      /**
       * Traversing tag with children
       * @param  {Object} tag
       * @return {Object}         State promise
       */
      traverseTagWithChildren: function traverseTagWithChildren(tag) {
         return this.traversingAST(tag.children).when(
            function traverseTagSuccess(ast) {
               return this._generatorFunctionForTags(tag, ast);
            }.bind(this),
            function brokenTagTraversing(reason) {
               throw new Error(reason);
            }
         )
      },
      /**
       * Main function for tag traversing
       * @param  {Object} tag
       * @return {Object}     State promise
       */
      _traverseTag: function traverseTag(tag) {
         var state,
            attribs = this._traverseTagAttributes(tag.attribs),
            takeTag = this._acceptTag(tag, attribs);
         if (takeTag.children && takeTag.children.length > 0) {
            return this.traverseTagWithChildren(takeTag);
         }
         state = State.make();
         state.keep(this._generatorFunctionForTags(takeTag));
         return state.promise;
      },
      _traverseOptionModule: function traverseOptionModule(tag) {
         return entityHelpers.loadModuleFunction.call(this, moduleC.parse, tag)
      },
      /**
       * Main function for finding traverse method for module
       * @param  {Object} tag
       * @return {Array}     Module function
       */
      _traverseModule: function traverseModule(tag) {
         var tagModule = entityHelpers.parserMatcher.call(this, tag);
         return entityHelpers.loadModuleFunction.call(this, tagModule, tag);
      },
      /**
       * Text node traversing
       * @param  {Object} text
       * @return {Object}       promise or text
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
       * Creating tag
       * @param  {String} name
       * @param  {Array|Object} data
       * @param  {String} raw
       * @param  {Object} attribs
       * @param  {Array} children
       * @return {Object}
       */
      _createTag: function createTag(tag) {
         return {
            name: tag.name,
            data: tag.data,
            raw: tag.raw,
            attribs: tag.attribs,
            children: tag.children,
            type: "tag"
         };
      },
      _acceptTag: function acceptTag(tag, attribs) {
         return this._createTag({
            name: tag.name,
            data: tag.data,
            raw: tag.raw,
            attribs: attribs,
            children: tag.children
         });
      },
      /**
       * Default handler for parsing
       * @param  {Error} error
       * @param  {Array} dom
       * @return
       */
      defaultHandler: function defaultHandler(error, dom) {
         if (error) {
            throw new Error(error);
         }
      }
   };
   return traverse;
});