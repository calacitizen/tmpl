(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["tmpl"] = factory();
	else
		root["tmpl"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var traversing = __webpack_require__(1),
	   processing = __webpack_require__(20);
	module.exports = {
	   template: function template(html, resolver) {
	      var parsed = traversing.parse(html);
	      return {
	         handle: function handleTraverse(success, broke) {
	            traversing.traverse(parsed, resolver).when(success, broke);
	         }
	      };
	   },
	   html: function html(ast, data) {
	      return processing.getHTMLString(ast, data);
	   }
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var
	   htmlparser = __webpack_require__(2),
	   utils = __webpack_require__(3),
	   skipVars = __webpack_require__(4),
	   State = __webpack_require__(6),
	   moduleC = __webpack_require__(9),
	   entityHelpers = __webpack_require__(5);
	module.exports = {
	   _modules: {
	      'ws:include': __webpack_require__(18),
	      'ws:template': __webpack_require__(19),
	      'ws:partial': __webpack_require__(10)
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__filename, __dirname) {/***********************************************
	 Copyright 2010, 2011, Chris Winberry <chris@winberry.net>. All rights reserved.
	 Permission is hereby granted, free of charge, to any person obtaining a copy
	 of this software and associated documentation files (the "Software"), to
	 deal in the Software without restriction, including without limitation the
	 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	 sell copies of the Software, and to permit persons to whom the Software is
	 furnished to do so, subject to the following conditions:

	 The above copyright notice and this permission notice shall be included in
	 all copies or substantial portions of the Software.

	 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
	 IN THE SOFTWARE.
	 ***********************************************/
	/* v1.7.6 */

	(function () {

	    function runningInNode () {
	        return(
	        ("function") == "function"
	        &&
	        (typeof exports) == "object"
	        &&
	        (typeof module) == "object"
	        &&
	        (typeof __filename) == "string"
	        &&
	        (typeof __dirname) == "string"
	        );
	    }

	    if (!runningInNode()) {
	        if (!this.Tautologistics)
	            this.Tautologistics = {};
	        else if (this.Tautologistics.NodeHtmlParser)
	            return; //NodeHtmlParser already defined!
	        this.Tautologistics.NodeHtmlParser = {};
	        exports = this.Tautologistics.NodeHtmlParser;
	    }

	//Types of elements found in the DOM
	    var ElementType = {
	        Text: "text" //Plain text
	        , Directive: "directive" //Special tag <!...>
	        , Comment: "comment" //Special tag <!--...-->
	        , Script: "script" //Special tag <script>...</script>
	        , Style: "style" //Special tag <style>...</style>
	        , Tag: "tag" //Any tag that isn't special
	    }

	    function Parser (handler, options) {
	        this._options = options ? options : { };
	        if (this._options.includeLocation == undefined) {
	            this._options.includeLocation = false; //Do not track element position in document by default
	        }

	        this.validateHandler(handler);
	        this._handler = handler;
	        this.reset();
	    }

	    //**"Static"**//
	    //Regular expressions used for cleaning up and parsing (stateless)
	    Parser._reTrim = /(^\s+|\s+$)/g; //Trim leading/trailing whitespace
	    Parser._reTrimComment = /(^\!--|--$)/g; //Remove comment tag markup from comment contents
	    Parser._reWhitespace = /\s/g; //Used to find any whitespace to split on
	    Parser._reTagName = /^\s*(\/?)\s*([^\s\/]+)/; //Used to find the tag name for an element

	    //Regular expressions used for parsing (stateful)
	    Parser._reAttrib = //Find attributes in a tag
	        /([^=<>\"\'\s]+)\s*=\s*"([^"]*)"|([^=<>\"\'\s]+)\s*=\s*'([^']*)'|([^=<>\"\'\s]+)\s*=\s*([^'"\s]+)|([^=<>\"\'\s\/]+)/g;
	    Parser._reTags = /[\<\>]/g; //Find tag markers

	    //**Public**//
	    //Methods//
	    //Parses a complete HTML and pushes it to the handler
	    Parser.prototype.parseComplete = function Parser$parseComplete (data) {
	        this.reset();
	        this.parseChunk(data);
	        this.done();
	    }

	    //Parses a piece of an HTML document
	    Parser.prototype.parseChunk = function Parser$parseChunk (data) {
	        if (this._done)
	            this.handleError(new Error("Attempted to parse chunk after parsing already done"));
	        this._buffer += data; //FIXME: this can be a bottleneck
	        this.parseTags();
	    }

	    //Tells the parser that the HTML being parsed is complete
	    Parser.prototype.done = function Parser$done () {
	        if (this._done)
	            return;
	        this._done = true;

	        //Push any unparsed text into a final element in the element list
	        if (this._buffer.length) {
	            var rawData = this._buffer;
	            this._buffer = "";
	            var element = {
	                raw: rawData
	                , data: (this._parseState == ElementType.Text) ? rawData : rawData.replace(Parser._reTrim, "")
	                , type: this._parseState
	            };
	            if (this._parseState == ElementType.Tag || this._parseState == ElementType.Script || this._parseState == ElementType.Style)
	                element.name = this.parseTagName(element.data);
	            this.parseAttribs(element);
	            this._elements.push(element);
	        }

	        this.writeHandler();
	        this._handler.done();
	    }

	    //Resets the parser to a blank state, ready to parse a new HTML document
	    Parser.prototype.reset = function Parser$reset () {
	        this._buffer = "";
	        this._done = false;
	        this._elements = [];
	        this._elementsCurrent = 0;
	        this._current = 0;
	        this._next = 0;
	        this._location = {
	            row: 0
	            , col: 0
	            , charOffset: 0
	            , inBuffer: 0
	        };
	        this._parseState = ElementType.Text;
	        this._prevTagSep = '';
	        this._tagStack = [];
	        this._handler.reset();
	    }

	    //**Private**//
	    //Properties//
	    Parser.prototype._options = null; //Parser options for how to behave
	    Parser.prototype._handler = null; //Handler for parsed elements
	    Parser.prototype._buffer = null; //Buffer of unparsed data
	    Parser.prototype._done = false; //Flag indicating whether parsing is done
	    Parser.prototype._elements =  null; //Array of parsed elements
	    Parser.prototype._elementsCurrent = 0; //Pointer to last element in _elements that has been processed
	    Parser.prototype._current = 0; //Position in data that has already been parsed
	    Parser.prototype._next = 0; //Position in data of the next tag marker (<>)
	    Parser.prototype._location = null; //Position tracking for elements in a stream
	    Parser.prototype._parseState = ElementType.Text; //Current type of element being parsed
	    Parser.prototype._prevTagSep = ''; //Previous tag marker found
	    //Stack of element types previously encountered; keeps track of when
	    //parsing occurs inside a script/comment/style tag
	    Parser.prototype._tagStack = null;

	    //Methods//
	    //Takes an array of elements and parses any found attributes
	    Parser.prototype.parseTagAttribs = function Parser$parseTagAttribs (elements) {
	        var idxEnd = elements.length;
	        var idx = 0;

	        while (idx < idxEnd) {
	            var element = elements[idx++];
	            if (element.type == ElementType.Tag || element.type == ElementType.Script || element.type == ElementType.style)
	                this.parseAttribs(element);
	        }

	        return(elements);
	    }

	    //Takes an element and adds an "attribs" property for any element attributes found
	    Parser.prototype.parseAttribs = function Parser$parseAttribs (element) {
	        //Only parse attributes for tags
	        if (element.type != ElementType.Script && element.type != ElementType.Style && element.type != ElementType.Tag)
	            return;

	        var tagName = element.data.split(Parser._reWhitespace, 1)[0];
	        var attribRaw = element.data.substring(tagName.length);
	        if (attribRaw.length < 1)
	            return;

	        var match;
	        Parser._reAttrib.lastIndex = 0;
	        while (match = Parser._reAttrib.exec(attribRaw)) {
	            if (element.attribs == undefined)
	                element.attribs = {};

	            if (typeof match[1] == "string" && match[1].length) {
	                element.attribs[match[1]] = match[2];
	            } else if (typeof match[3] == "string" && match[3].length) {
	                element.attribs[match[3].toString()] = match[4].toString();
	            } else if (typeof match[5] == "string" && match[5].length) {
	                element.attribs[match[5]] = match[6];
	            } else if (typeof match[7] == "string" && match[7].length) {
	                element.attribs[match[7]] = match[7];
	            }
	        }
	    }

	    //Extracts the base tag name from the data value of an element
	    Parser.prototype.parseTagName = function Parser$parseTagName (data) {
	        if (data == null || data == "")
	            return("");
	        var match = Parser._reTagName.exec(data);
	        if (!match)
	            return("");
	        return((match[1] ? "/" : "") + match[2]);
	    }

	    function checkForEval(haystack) {
	        if (haystack.indexOf('{{') !== -1) {
	            if (haystack.indexOf('}}') !== -1) {
	                return true;
	            }
	            return false
	        }
	        return true;
	    }

	    function findUnnElements(begin, haystack, isTag) {
	        var wasQuote, wasDblQuote, quote, dblQuote;
	        if (isTag === 'tag') {
	            wasQuote = false;
	            wasDblQuote = false;
	            quote = "'";
	            dblQuote = '"';
	            for ( var i = begin; i < haystack.length; i++ ) {
	                if ( haystack.charAt(i) === dblQuote && wasQuote === false ) {
	                    wasDblQuote = (wasDblQuote === true) ? false : true;
	                }
	                if ( haystack.charAt(i) === quote && wasDblQuote === false ) {
	                    wasQuote = (wasQuote === true) ? false : true;
	                }
	            }
	            return !(wasDblQuote || wasQuote);
	        }
	        return checkForEval(haystack);
	    }
	    //Parses through HTML text and returns an array of found elements
	    //I admit, this function is rather large but splitting up had an noticeable impact on speed
	    Parser.prototype.parseTags = function Parser$parseTags () {
	        var bufferEnd = this._buffer.length - 1;
	        while (Parser._reTags.test(this._buffer)) {
	            if (findUnnElements(0, this._buffer.substring(this._current, Parser._reTags.lastIndex - 1), this._parseState)) {
	                this._next = Parser._reTags.lastIndex - 1;
	                var tagSep = this._buffer.charAt(this._next); //The currently found tag marker
	                var rawData = this._buffer.substring(this._current, this._next); //The next chunk of data to parse
	                //A new element to eventually be appended to the element list
	                var element = {
	                    raw: rawData
	                    , data: (this._parseState == ElementType.Text) ? rawData : rawData.replace(Parser._reTrim, "")
	                    , type: this._parseState
	                };
	                var elementName = this.parseTagName(element.data);
	                //This section inspects the current tag stack and modifies the current
	                //element if we're actually parsing a special area (script/comment/style tag)
	                if (this._tagStack.length) { //We're parsing inside a script/comment/style tag
	                    if (this._tagStack[this._tagStack.length - 1] == ElementType.Script) { //We're currently in a script tag
	                        if (elementName.toLowerCase() == "/script") //Actually, we're no longer in a script tag, so pop it off the stack
	                            this._tagStack.pop();
	                        else { //Not a closing script tag
	                            if (element.raw.indexOf("!--") != 0) { //Make sure we're not in a comment
	                                //All data from here to script close is now a text element
	                                element.type = ElementType.Text;
	                                //If the previous element is text, append the current text to it
	                                if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Text) {
	                                    var prevElement = this._elements[this._elements.length - 1];
	                                    prevElement.raw = prevElement.data = prevElement.raw + this._prevTagSep + element.raw;
	                                    element.raw = element.data = ""; //This causes the current element to not be added to the element list
	                                }
	                            }
	                        }
	                    }
	                    else if (this._tagStack[this._tagStack.length - 1] == ElementType.Style) { //We're currently in a style tag
	                        if (elementName.toLowerCase() == "/style") //Actually, we're no longer in a style tag, so pop it off the stack
	                            this._tagStack.pop();
	                        else {
	                            if (element.raw.indexOf("!--") != 0) { //Make sure we're not in a comment
	                                //All data from here to style close is now a text element
	                                element.type = ElementType.Text;
	                                //If the previous element is text, append the current text to it
	                                if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Text) {
	                                    var prevElement = this._elements[this._elements.length - 1];
	                                    if (element.raw != "") {
	                                        prevElement.raw = prevElement.data = prevElement.raw + this._prevTagSep + element.raw;
	                                        element.raw = element.data = ""; //This causes the current element to not be added to the element list
	                                    } else { //Element is empty, so just append the last tag marker found
	                                        prevElement.raw = prevElement.data = prevElement.raw + this._prevTagSep;
	                                    }
	                                } else { //The previous element was not text
	                                    if (element.raw != "") {
	                                        element.raw = element.data = element.raw;
	                                    }
	                                }
	                            }
	                        }
	                    }
	                    else if (this._tagStack[this._tagStack.length - 1] == ElementType.Comment) { //We're currently in a comment tag
	                        var rawLen = element.raw.length;
	                        if (element.raw.charAt(rawLen - 2) == "-" && element.raw.charAt(rawLen - 1) == "-" && tagSep == ">") {
	                            //Actually, we're no longer in a style tag, so pop it off the stack
	                            this._tagStack.pop();
	                            //If the previous element is a comment, append the current text to it
	                            if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Comment) {
	                                var prevElement = this._elements[this._elements.length - 1];
	                                prevElement.raw = prevElement.data = (prevElement.raw + element.raw).replace(Parser._reTrimComment, "");
	                                element.raw = element.data = ""; //This causes the current element to not be added to the element list
	                                element.type = ElementType.Text;
	                            }
	                            else //Previous element not a comment
	                                element.type = ElementType.Comment; //Change the current element's type to a comment
	                        }
	                        else { //Still in a comment tag
	                            element.type = ElementType.Comment;
	                            //If the previous element is a comment, append the current text to it
	                            if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Comment) {
	                                var prevElement = this._elements[this._elements.length - 1];
	                                prevElement.raw = prevElement.data = prevElement.raw + element.raw + tagSep;
	                                element.raw = element.data = ""; //This causes the current element to not be added to the element list
	                                element.type = ElementType.Text;
	                            }
	                            else
	                                element.raw = element.data = element.raw + tagSep;
	                        }
	                    }
	                }

	                //Processing of non-special tags
	                if (element.type == ElementType.Tag) {
	                    element.name = elementName;
	                    var elementNameCI = elementName.toLowerCase();

	                    if (element.raw.indexOf("!--") == 0) { //This tag is really comment
	                        element.type = ElementType.Comment;
	                        delete element["name"];
	                        var rawLen = element.raw.length;
	                        //Check if the comment is terminated in the current element
	                        if (element.raw.charAt(rawLen - 1) == "-" && element.raw.charAt(rawLen - 2) == "-" && tagSep == ">")
	                            element.raw = element.data = element.raw.replace(Parser._reTrimComment, "");
	                        else { //It's not so push the comment onto the tag stack
	                            element.raw += tagSep;
	                            this._tagStack.push(ElementType.Comment);
	                        }
	                    }
	                    else if (element.raw.indexOf("!") == 0 || element.raw.indexOf("?") == 0) {
	                        element.type = ElementType.Directive;
	                        //TODO: what about CDATA?
	                    }
	                    else if (elementNameCI == "script") {
	                        element.type = ElementType.Script;
	                        //Special tag, push onto the tag stack if not terminated
	                        if (element.data.charAt(element.data.length - 1) != "/")
	                            this._tagStack.push(ElementType.Script);
	                    }
	                    else if (elementNameCI == "/script")
	                        element.type = ElementType.Script;
	                    else if (elementNameCI == "style") {
	                        element.type = ElementType.Style;
	                        //Special tag, push onto the tag stack if not terminated
	                        if (element.data.charAt(element.data.length - 1) != "/")
	                            this._tagStack.push(ElementType.Style);
	                    }
	                    else if (elementNameCI == "/style")
	                        element.type = ElementType.Style;
	                    if (element.name && element.name.charAt(0) == "/")
	                        element.data = element.name;
	                }

	                //Add all tags and non-empty text elements to the element list
	                if (element.raw != "" || element.type != ElementType.Text) {
	                    if (this._options.includeLocation && !element.location) {
	                        element.location = this.getLocation(element.type == ElementType.Tag);
	                    }
	                    this.parseAttribs(element);
	                    this._elements.push(element);
	                    //If tag self-terminates, add an explicit, separate closing tag
	                    if (
	                        element.type != ElementType.Text
	                        &&
	                        element.type != ElementType.Comment
	                        &&
	                        element.type != ElementType.Directive
	                        &&
	                        element.data.charAt(element.data.length - 1) == "/"
	                    )
	                        this._elements.push({
	                            raw: "/" + element.name
	                            , data: "/" + element.name
	                            , name: "/" + element.name
	                            , type: element.type
	                        });
	                }
	                this._parseState = (tagSep == "<") ? ElementType.Tag : ElementType.Text;
	                this._current = this._next + 1;
	                this._prevTagSep = tagSep;
	            }
	        }

	        if (this._options.includeLocation) {
	            this.getLocation();
	            this._location.row += this._location.inBuffer;
	            this._location.inBuffer = 0;
	            this._location.charOffset = 0;
	        }
	        this._buffer = (this._current <= bufferEnd) ? this._buffer.substring(this._current) : "";
	        this._current = 0;

	        this.writeHandler();
	    }

	    Parser.prototype.getLocation = function Parser$getLocation (startTag) {
	        var c,
	            l = this._location,
	            end = this._current - (startTag ? 1 : 0),
	            chunk = startTag && l.charOffset == 0 && this._current == 0;

	        for (; l.charOffset < end; l.charOffset++) {
	            c = this._buffer.charAt(l.charOffset);
	            if (c == '\n') {
	                l.inBuffer++;
	                l.col = 0;
	            } else if (c != '\r') {
	                l.col++;
	            }
	        }
	        return {
	            line: l.row + l.inBuffer + 1
	            , col: l.col + (chunk ? 0: 1)
	        };
	    }

	    //Checks the handler to make it is an object with the right "interface"
	    Parser.prototype.validateHandler = function Parser$validateHandler (handler) {
	        if ((typeof handler) != "object")
	            throw new Error("Handler is not an object");
	        if ((typeof handler.reset) != "function")
	            throw new Error("Handler method 'reset' is invalid");
	        if ((typeof handler.done) != "function")
	            throw new Error("Handler method 'done' is invalid");
	        if ((typeof handler.writeTag) != "function")
	            throw new Error("Handler method 'writeTag' is invalid");
	        if ((typeof handler.writeText) != "function")
	            throw new Error("Handler method 'writeText' is invalid");
	        if ((typeof handler.writeComment) != "function")
	            throw new Error("Handler method 'writeComment' is invalid");
	        if ((typeof handler.writeDirective) != "function")
	            throw new Error("Handler method 'writeDirective' is invalid");
	    }

	    //Writes parsed elements out to the handler
	    Parser.prototype.writeHandler = function Parser$writeHandler (forceFlush) {
	        forceFlush = !!forceFlush;
	        if (this._tagStack.length && !forceFlush)
	            return;
	        while (this._elements.length) {
	            var element = this._elements.shift();
	            switch (element.type) {
	                case ElementType.Comment:
	                    this._handler.writeComment(element);
	                    break;
	                case ElementType.Directive:
	                    this._handler.writeDirective(element);
	                    break;
	                case ElementType.Text:
	                    this._handler.writeText(element);
	                    break;
	                default:
	                    this._handler.writeTag(element);
	                    break;
	            }
	        }
	    }

	    Parser.prototype.handleError = function Parser$handleError (error) {
	        if ((typeof this._handler.error) == "function")
	            this._handler.error(error);
	        else
	            throw error;
	    }

	//TODO: make this a trully streamable handler
	    function RssHandler (callback) {
	        RssHandler.super_.call(this, callback, { ignoreWhitespace: true, verbose: false, enforceEmptyTags: false });
	    }
	    inherits(RssHandler, DefaultHandler);

	    RssHandler.prototype.done = function RssHandler$done () {
	        var feed = { };
	        var feedRoot;

	        var found = DomUtils.getElementsByTagName(function (value) { return(value == "rss" || value == "feed"); }, this.dom, false);
	        if (found.length) {
	            feedRoot = found[0];
	        }
	        if (feedRoot) {
	            if (feedRoot.name == "rss") {
	                feed.type = "rss";
	                feedRoot = feedRoot.children[0]; //<channel/>
	                feed.id = "";
	                try {
	                    feed.title = DomUtils.getElementsByTagName("title", feedRoot.children, false)[0].children[0].data;
	                } catch (ex) { }
	                try {
	                    feed.link = DomUtils.getElementsByTagName("link", feedRoot.children, false)[0].children[0].data;
	                } catch (ex) { }
	                try {
	                    feed.description = DomUtils.getElementsByTagName("description", feedRoot.children, false)[0].children[0].data;
	                } catch (ex) { }
	                try {
	                    feed.updated = new Date(DomUtils.getElementsByTagName("lastBuildDate", feedRoot.children, false)[0].children[0].data);
	                } catch (ex) { }
	                try {
	                    feed.author = DomUtils.getElementsByTagName("managingEditor", feedRoot.children, false)[0].children[0].data;
	                } catch (ex) { }
	                feed.items = [];
	                DomUtils.getElementsByTagName("item", feedRoot.children).forEach(function (item, index, list) {
	                    var entry = {};
	                    try {
	                        entry.id = DomUtils.getElementsByTagName("guid", item.children, false)[0].children[0].data;
	                    } catch (ex) { }
	                    try {
	                        entry.title = DomUtils.getElementsByTagName("title", item.children, false)[0].children[0].data;
	                    } catch (ex) { }
	                    try {
	                        entry.link = DomUtils.getElementsByTagName("link", item.children, false)[0].children[0].data;
	                    } catch (ex) { }
	                    try {
	                        entry.description = DomUtils.getElementsByTagName("description", item.children, false)[0].children[0].data;
	                    } catch (ex) { }
	                    try {
	                        entry.pubDate = new Date(DomUtils.getElementsByTagName("pubDate", item.children, false)[0].children[0].data);
	                    } catch (ex) { }
	                    feed.items.push(entry);
	                });
	            } else {
	                feed.type = "atom";
	                try {
	                    feed.id = DomUtils.getElementsByTagName("id", feedRoot.children, false)[0].children[0].data;
	                } catch (ex) { }
	                try {
	                    feed.title = DomUtils.getElementsByTagName("title", feedRoot.children, false)[0].children[0].data;
	                } catch (ex) { }
	                try {
	                    feed.link = DomUtils.getElementsByTagName("link", feedRoot.children, false)[0].attribs.href;
	                } catch (ex) { }
	                try {
	                    feed.description = DomUtils.getElementsByTagName("subtitle", feedRoot.children, false)[0].children[0].data;
	                } catch (ex) { }
	                try {
	                    feed.updated = new Date(DomUtils.getElementsByTagName("updated", feedRoot.children, false)[0].children[0].data);
	                } catch (ex) { }
	                try {
	                    feed.author = DomUtils.getElementsByTagName("email", feedRoot.children, true)[0].children[0].data;
	                } catch (ex) { }
	                feed.items = [];
	                DomUtils.getElementsByTagName("entry", feedRoot.children).forEach(function (item, index, list) {
	                    var entry = {};
	                    try {
	                        entry.id = DomUtils.getElementsByTagName("id", item.children, false)[0].children[0].data;
	                    } catch (ex) { }
	                    try {
	                        entry.title = DomUtils.getElementsByTagName("title", item.children, false)[0].children[0].data;
	                    } catch (ex) { }
	                    try {
	                        entry.link = DomUtils.getElementsByTagName("link", item.children, false)[0].attribs.href;
	                    } catch (ex) { }
	                    try {
	                        entry.description = DomUtils.getElementsByTagName("summary", item.children, false)[0].children[0].data;
	                    } catch (ex) { }
	                    try {
	                        entry.pubDate = new Date(DomUtils.getElementsByTagName("updated", item.children, false)[0].children[0].data);
	                    } catch (ex) { }
	                    feed.items.push(entry);
	                });
	            }

	            this.dom = feed;
	        }
	        RssHandler.super_.prototype.done.call(this);
	    }

	///////////////////////////////////////////////////

	    function DefaultHandler (callback, options) {
	        this.reset();
	        this._options = options ? options : { };
	        if (this._options.ignoreWhitespace == undefined)
	            this._options.ignoreWhitespace = false; //Keep whitespace-only text nodes
	        if (this._options.verbose == undefined)
	            this._options.verbose = true; //Keep data property for tags and raw property for all
	        if (this._options.enforceEmptyTags == undefined)
	            this._options.enforceEmptyTags = true; //Don't allow children for HTML tags defined as empty in spec
	        if ((typeof callback) == "function")
	            this._callback = callback;
	    }

	    //**"Static"**//
	    //HTML Tags that shouldn't contain child nodes
	    DefaultHandler._emptyTags = {
	        area: 1
	        , base: 1
	        , basefont: 1
	        , br: 1
	        , col: 1
	        , frame: 1
	        , hr: 1
	        , img: 1
	        , input: 1
	        , isindex: 1
	        , link: 1
	        , meta: 1
	        , param: 1
	        , embed: 1
	    }
	    //Regex to detect whitespace only text nodes
	    DefaultHandler.reWhitespace = /^\s*$/;

	    //**Public**//
	    //Properties//
	    DefaultHandler.prototype.dom = null; //The hierarchical object containing the parsed HTML
	    //Methods//
	    //Resets the handler back to starting state
	    DefaultHandler.prototype.reset = function DefaultHandler$reset() {
	        this.dom = [];
	        this._done = false;
	        this._tagStack = [];
	        this._tagStack.last = function DefaultHandler$_tagStack$last () {
	            return(this.length ? this[this.length - 1] : null);
	        }
	    }
	    //Signals the handler that parsing is done
	    DefaultHandler.prototype.done = function DefaultHandler$done () {
	        this._done = true;
	        this.handleCallback(null);
	    }
	    DefaultHandler.prototype.writeTag = function DefaultHandler$writeTag (element) {
	        this.handleElement(element);
	    }
	    DefaultHandler.prototype.writeText = function DefaultHandler$writeText (element) {
	        if (this._options.ignoreWhitespace)
	            if (DefaultHandler.reWhitespace.test(element.data))
	                return;
	        this.handleElement(element);
	    }
	    DefaultHandler.prototype.writeComment = function DefaultHandler$writeComment (element) {
	        this.handleElement(element);
	    }
	    DefaultHandler.prototype.writeDirective = function DefaultHandler$writeDirective (element) {
	        this.handleElement(element);
	    }
	    DefaultHandler.prototype.error = function DefaultHandler$error (error) {
	        this.handleCallback(error);
	    }

	    //**Private**//
	    //Properties//
	    DefaultHandler.prototype._options = null; //Handler options for how to behave
	    DefaultHandler.prototype._callback = null; //Callback to respond to when parsing done
	    DefaultHandler.prototype._done = false; //Flag indicating whether handler has been notified of parsing completed
	    DefaultHandler.prototype._tagStack = null; //List of parents to the currently element being processed
	    //Methods//
	    DefaultHandler.prototype.handleCallback = function DefaultHandler$handleCallback (error) {
	        if ((typeof this._callback) != "function")
	            if (error)
	                throw error;
	            else
	                return;
	        this._callback(error, this.dom);
	    }

	    DefaultHandler.prototype.isEmptyTag = function(element) {
	        var name = element.name.toLowerCase();
	        if (name.charAt(0) == '/') {
	            name = name.substring(1);
	        }
	        return this._options.enforceEmptyTags && !!DefaultHandler._emptyTags[name];
	    };

	    DefaultHandler.prototype.handleElement = function DefaultHandler$handleElement (element) {
	        if (this._done)
	            this.handleCallback(new Error("Writing to the handler after done() called is not allowed without a reset()"));
	        if (!this._options.verbose) {
	//			element.raw = null; //FIXME: Not clean
	            //FIXME: Serious performance problem using delete
	            delete element.raw;
	            if (element.type == "tag" || element.type == "script" || element.type == "style")
	                delete element.data;
	        }
	        if (!this._tagStack.last()) { //There are no parent elements
	            //If the element can be a container, add it to the tag stack and the top level list
	            if (element.type != ElementType.Text && element.type != ElementType.Comment && element.type != ElementType.Directive) {
	                if (element.name.charAt(0) != "/") { //Ignore closing tags that obviously don't have an opening tag
	                    this.dom.push(element);
	                    if (!this.isEmptyTag(element)) { //Don't add tags to the tag stack that can't have children
	                        this._tagStack.push(element);
	                    }
	                }
	            }
	            else //Otherwise just add to the top level list
	                this.dom.push(element);
	        }
	        else { //There are parent elements
	            //If the element can be a container, add it as a child of the element
	            //on top of the tag stack and then add it to the tag stack
	            if (element.type != ElementType.Text && element.type != ElementType.Comment && element.type != ElementType.Directive) {
	                if (element.name.charAt(0) == "/") {
	                    //This is a closing tag, scan the tagStack to find the matching opening tag
	                    //and pop the stack up to the opening tag's parent
	                    var baseName = element.name.substring(1);
	                    if (!this.isEmptyTag(element)) {
	                        var pos = this._tagStack.length - 1;
	                        while (pos > -1 && this._tagStack[pos--].name != baseName) { }
	                        if (pos > -1 || this._tagStack[0].name == baseName)
	                            while (pos < this._tagStack.length - 1)
	                                this._tagStack.pop();
	                    }
	                }
	                else { //This is not a closing tag
	                    if (!this._tagStack.last().children)
	                        this._tagStack.last().children = [];
	                    this._tagStack.last().children.push(element);
	                    if (!this.isEmptyTag(element)) //Don't add tags to the tag stack that can't have children
	                        this._tagStack.push(element);
	                }
	            }
	            else { //This is not a container element
	                if (!this._tagStack.last().children)
	                    this._tagStack.last().children = [];
	                this._tagStack.last().children.push(element);
	            }
	        }
	    }

	    var DomUtils = {
	        testElement: function DomUtils$testElement (options, element) {
	            if (!element) {
	                return false;
	            }

	            for (var key in options) {
	                if (key == "tag_name") {
	                    if (element.type != "tag" && element.type != "script" && element.type != "style") {
	                        return false;
	                    }
	                    if (!options["tag_name"](element.name)) {
	                        return false;
	                    }
	                } else if (key == "tag_type") {
	                    if (!options["tag_type"](element.type)) {
	                        return false;
	                    }
	                } else if (key == "tag_contains") {
	                    if (element.type != "text" && element.type != "comment" && element.type != "directive") {
	                        return false;
	                    }
	                    if (!options["tag_contains"](element.data)) {
	                        return false;
	                    }
	                } else {
	                    if (!element.attribs || !options[key](element.attribs[key])) {
	                        return false;
	                    }
	                }
	            }

	            return true;
	        }

	        , getElements: function DomUtils$getElements (options, currentElement, recurse, limit) {
	            recurse = (recurse === undefined || recurse === null) || !!recurse;
	            limit = isNaN(parseInt(limit)) ? -1 : parseInt(limit);

	            if (!currentElement) {
	                return([]);
	            }

	            var found = [];
	            var elementList;

	            function getTest (checkVal) {
	                return(function (value) { return(value == checkVal); });
	            }
	            for (var key in options) {
	                if ((typeof options[key]) != "function") {
	                    options[key] = getTest(options[key]);
	                }
	            }

	            if (DomUtils.testElement(options, currentElement)) {
	                found.push(currentElement);
	            }

	            if (limit >= 0 && found.length >= limit) {
	                return(found);
	            }

	            if (recurse && currentElement.children) {
	                elementList = currentElement.children;
	            } else if (currentElement instanceof Array) {
	                elementList = currentElement;
	            } else {
	                return(found);
	            }

	            for (var i = 0; i < elementList.length; i++) {
	                found = found.concat(DomUtils.getElements(options, elementList[i], recurse, limit));
	                if (limit >= 0 && found.length >= limit) {
	                    break;
	                }
	            }

	            return(found);
	        }

	        , getElementById: function DomUtils$getElementById (id, currentElement, recurse) {
	            var result = DomUtils.getElements({ id: id }, currentElement, recurse, 1);
	            return(result.length ? result[0] : null);
	        }

	        , getElementsByTagName: function DomUtils$getElementsByTagName (name, currentElement, recurse, limit) {
	            return(DomUtils.getElements({ tag_name: name }, currentElement, recurse, limit));
	        }

	        , getElementsByTagType: function DomUtils$getElementsByTagType (type, currentElement, recurse, limit) {
	            return(DomUtils.getElements({ tag_type: type }, currentElement, recurse, limit));
	        }
	    }

	    function inherits (ctor, superCtor) {
	        var tempCtor = function(){};
	        tempCtor.prototype = superCtor.prototype;
	        ctor.super_ = superCtor;
	        ctor.prototype = new tempCtor();
	        ctor.prototype.constructor = ctor;
	    }

	    exports.Parser = Parser;

	    exports.DefaultHandler = DefaultHandler;

	    exports.RssHandler = RssHandler;

	    exports.ElementType = ElementType;

	    exports.DomUtils = DomUtils;

	})();

	/* WEBPACK VAR INJECTION */}.call(exports, "/index.js", "/"))

/***/ },
/* 3 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = {
	   reduceArray: function reduceArray(array, callback) {
	      var len = array.length >>> 0, k = 0, value;
	      while (k < len && ! k in array) {
	         k++;
	      }
	      if (k >= len) {
	         throw new TypeError('Reduce of empty array with no initial value');
	      }
	      value = array[k];
	      for (; k <= len; k++) {
	         if (k in array) {
	            value = callback(value, array[k], k, array);
	         }
	      }
	      return value;
	   },
	   mapForLoop: function mapForLoop(array, mapFunction) {
	      var arrayLen = array.length,
	         newArray = new Array(arrayLen),
	         i;
	      for (i = 0; i < arrayLen; i++) {
	         newArray[i] = mapFunction(array[i], i, array);
	      }
	      return newArray;
	   },
	   eachObject: function eachObject(object, modifier) {
	      var value;
	      for (value in object) {
	         if (object.hasOwnProperty(value)) {
	            object[value] = modifier(object[value], value);
	         }
	      }
	      return object;
	   },
	   inArray: function inArray(array, needle) {
	      var i;
	      for (i = 0; i < array.length; i++) {
	         if (array[i] === needle) {
	            return true;
	         }
	      }
	      return false;
	   },
	   isNode: function isNode() {
	      return Object.prototype.toString.call(global.process) === '[object process]';
	   },
	   isImplicitVar: function isImplicitVar(string) {
	      return /^([A-z0-9\.]+)$/.test(string.trim());
	   },
	   isFunction: function isFunction(string) {
	      var f = string.split(/\(([^\(]*)\)/);
	      if (f.length === 1) {
	         return false;
	      }
	      return f;
	   },
	   isNumber: function isNumber(string) {
	      return /^((?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?)$/.test(string.trim());
	   },
	   isVar: function isVar(string) {
	      return !/['"].*?['"]/.test(string) && isNaN(parseInt(string));
	   },
	   getFirstLetter: function getFirstLetter(string) {
	      return string.charAt(0);
	   },
	   isUpperCase: function isUpperCase(firstLetter) {
	      return firstLetter === firstLetter.toUpperCase();
	   },
	   isWsIncluded: function isWsIncluded() {
	      return (typeof $ws !== 'undefined');
	   },
	   splitVarsAndFunctions: function splitVarsAndFunctions(s) {
	      var depth = 0, seg = 0, rv = [];
	      s.replace(/[^().]*([)]*)([(]*)(.)?/g,
	         function (m, cls, opn, com, off, s) {
	            depth += opn.length - cls.length;
	            var newseg = off + m.length;
	            if (!depth && com) {
	               rv.push(s.substring(seg, newseg - 1));
	               seg = newseg;
	            }
	            return m;
	         }
	      );
	      rv.push(s.substring(seg));
	      return rv;
	   },
	   isVarFromScope: function isVarFromScope(varArray, scope) {
	      var f;
	      if (varArray.length > 0) {
	         f = this.isFunction(varArray[0]);
	         if (f) {
	            return scope.hasOwnProperty(f[0]);
	         }
	         return scope.hasOwnProperty(varArray[0]);
	      }
	      return false;
	   },
	   splitVarString: function splitVarString(string) {
	      return string.split('.');
	   },
	   removeAroundQuotes: function removingQuotes(string) {
	      return string.trim().replace(/^['"](.*)['"]$/, '$1');
	   },
	   removeAllSpaces: function removeAllSpaces(string) {
	      return string.replace(/\s/g, "");
	   },
	   splitWs: function splitWs(string) {
	      var ws;
	      if (string !== undefined) {
	         ws = string.split('ws:');
	         return ws[1];
	      }
	      return undefined;
	   },
	   clone: function clone(src) {
	      function mixin(dest, source, copyFunc) {
	         var name, s, i, empty = {};
	         for (name in source) {
	            s = source[name];
	            if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
	               dest[name] = copyFunc ? copyFunc(s) : s;
	            }
	         }
	         return dest;
	      }

	      if (!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]") {
	         return src;
	      }
	      if (src.nodeType && "cloneNode" in src) {
	         return src.cloneNode(true);
	      }
	      if (src instanceof Date) {
	         return new Date(src.getTime());
	      }
	      if (src instanceof RegExp) {
	         return new RegExp(src);
	      }
	      var r, i, l;
	      if (src instanceof Array) {
	         r = [];
	         for (i = 0, l = src.length; i < l; ++i) {
	            if (i in src) {
	               r.push(clone(src[i]));
	            }
	         }
	      } else {
	         r = src.constructor ? new src.constructor() : {};
	      }
	      return mixin(r, src, clone);
	   },
	   merge: function merge(target, source) {
	      var property, a, sourceProperty, l;
	      if (typeof target !== 'object') {
	         target = {};
	      }
	      for (property in source) {
	         if (source.hasOwnProperty(property)) {
	            sourceProperty = source[property];
	            if (typeof sourceProperty === 'object') {
	               target[property] = merge(target[property], sourceProperty);
	               continue;
	            }
	            target[property] = sourceProperty;
	         }
	      }
	      for (a = 2, l = arguments.length; a < l; a++) {
	         this.merge(target, arguments[a]);
	      }
	      return target;
	   }
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	   entityHelpers = __webpack_require__(5);
	module.exports = {
	   checkStatementForInners: function checkStatementForInners(value, arrVars) {
	      var isUseful = utils.inArray(arrVars, value);
	      if (isUseful === true) {
	         return entityHelpers.createDataVar(value, undefined);
	      }
	      return entityHelpers.createDataText(value);
	   }
	};



/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3);
	module.exports = {
	   /**
	    * is entity - tag
	    * @param  {String}  type
	    * @return {Boolean}
	    */
	   isTag: function isTag(type) {
	      return type === 'tag';
	   },
	   /**
	    * is entity - text
	    * @param  {String}  type
	    * @return {Boolean}
	    */
	   isText: function isText(type) {
	      return type === 'text';
	   },
	   /**
	    * Match module by name
	    * @param  {Object} tag
	    * @return {Function}
	    */
	   parserMatcher: function parserMatcher(tag) {
	      return (this._modules[tag.name] !== undefined) ? this._modules[tag.name].parse : false;
	   },
	   /**
	    * Match module by name
	    * @param  {Object} name
	    * @return {Function}
	    */
	   attributeParserMatcherByName: function attributeParserMatcherByName(name) {
	      return (name !== undefined) ? this._attributeModules[name].module : false;
	   },
	   /**
	    * Match parse by name
	    * @param  {Object} tag
	    * @return {Function}
	    */
	   moduleMatcher: function moduleMatcher(tag) {
	      var moduleName = utils.splitWs(tag.name);
	      return (this._modules[moduleName] !== undefined) ? this._modules[moduleName].module : false;
	   },
	   /**
	    * Load module and execute function
	    * @param  {Function} moduleFunction
	    * @param  {Object} tag
	    * @param  {Object} data
	    * @return {Array}
	    */
	   loadModuleFunction: function loadModuleFunction(moduleFunction, tag, data) {
	      var tagModule = moduleFunction(tag, data);
	      return tagModule.call(this);
	   },
	   /**
	    * is entity tag - include
	    * @param  {String}  name
	    * @return {Boolean}
	    */
	   isTagInclude: function isTagInclude(name) {
	      return name === 'ws-include';
	   },
	   isTagRequirable: function isTagRequreable(name) {
	      var wsName = utils.splitWs(name);
	      if (wsName) {
	         return utils.isUpperCase(utils.getFirstLetter(wsName));
	      }
	      return false;
	   },
	   isTagRequirableBool: function isTagRequreableBool(name) {
	      return utils.isUpperCase(utils.getFirstLetter(name));
	   },
	   /**
	    * is expression
	    * @param  {String}  string
	    * @return {Boolean}
	    */
	   isExpression: function isExpression(string) {
	      return string.split('?').length > 1;
	   },
	   /**
	    * Create data request
	    * @param name
	    * @returns {{type: string, name: *}}
	    */
	   createDataRequest: function createDataRequest(name) {
	      return {
	         type: 'request',
	         name: name
	      };
	   },
	   /**
	    * Create data object for variable
	    * @param  {String} name  lexical name of variable
	    * @param  {Undefined} value
	    * @return {Object}       data object
	    */
	   createDataVar: function createDataVar(name, value) {
	      return {
	         type: 'var',
	         name: name,
	         value: value
	      };
	   },
	   /**
	    * Creating text chuncks
	    * @param  {String} value
	    * @return {Object}       Object
	    */
	   createDataText: function createDataText(value) {
	      return {
	         type: 'text',
	         value: value
	      };
	   },
	   /**
	    * Creating expression chuncks
	    * @param  {String} value
	    * @return {Object}       Object
	    */
	   createDataExpression: function createDataExpression(expression, valueOne, valueTwo) {
	      return {
	         type: 'expression',
	         expression: expression.trim(),
	         valueOne: valueOne,
	         valueTwo: valueTwo
	      };
	   },
	   createNumberFromString: function createNumberFromString(value) {
	      return Number(value);
	   },
	   parseAttributesForData: function parseAttributesForData(attrs, data) {
	      var attr, obj = {};
	      function processDataSequence(attributesData, data) {
	         var string = '', attrData = attributesData.data, i;
	         if (attrData.length) {
	            if (attrData.length === 1) {
	               return this._processDataTypes(attrData[0], data);
	            }
	            for (i = 0; i < attrData.length; i++) {
	               string += this._processDataTypes(attrData[i], data);
	            }
	            return string;
	         }
	         return this._processDataTypes(attrData, data);
	      }
	      if (attrs !== undefined) {
	         for (attr in attrs) {
	            if (attrs.hasOwnProperty(attr) && attr !== 'template') {
	               obj[attr] = processDataSequence.call(this, attrs[attr], data);
	            }
	         }
	      }
	      return obj;
	   }
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {var State = (function StateFunction() {
	   'use strict';

	   if (typeof setImmediate !== 'function') {
	      setImmediate = function setImmediate(func, fate) {
	         'use strict';
	         return setTimeout(function setTimeoutHandler() {
	            func(fate);
	         }, 0);
	      };
	   }

	   function enlighten(queue, fate) {
	      queue.forEach(function queueForEach(func) {
	         setImmediate(func, fate);
	      });
	   }

	   return {
	      make: function make() {
	         var breakers = [], // .when's broken queue
	            fate, // The promise's ultimate value
	            keepers = [], // .when's kept queue
	            status = 'pending'; // 'broken', 'kept', or 'pending'

	         function enqueue(
	            resolution, // 'keep' or 'break'
	            func, // A function that was registered with .when
	            state // A state that provides the resolution functions
	         ) {
	            var queue = resolution === 'keep' ? keepers : breakers;
	            queue[queue.length] = typeof func !== 'function'

	               ? state[resolution]: function enqueueResolution(value) {
	               //try {
	               var result = func(value);
	               if (result && result.is_promise === true) {
	                  result.when(state.keep, state.break);
	               } else {
	                  state.keep(result);
	               }
	               ////} catch (e) {
	               //    throw new Error(e);
	               //    state.break(e);
	               //}
	            };
	         }

	         function herald(state, value, queue) {
	            if (status !== 'pending') {
	               throw "overpromise";
	            }
	         }

	         function herald(state, value, queue) {
	            if (status !== 'pending') {
	               throw "overpromise";
	            }
	            fate = value;
	            status = state;
	            enlighten(queue, fate);
	            keepers.length = 0;
	            breakers.length = 0;
	         }
	         return {
	            'break': function breakPromise(value) {
	               herald('broken', value, breakers);
	            },
	            keep: function keep(value) {
	               herald('kept', value, keepers);
	            },
	            promise: {
	               is_promise: true,
	               when: function when(kept, broken) {
	                  var state = make();
	                  switch (status) {
	                     case 'pending':
	                        enqueue('keep', kept, state);
	                        enqueue('break', broken, state);
	                        break;
	                     case 'kept':
	                        enqueue('keep', kept, state);
	                        enlighten(keepers, fate);
	                        break;
	                     case 'broken':
	                        enqueue('break', broken, state);
	                        enlighten(breakers, fate);
	                        break;
	                  }
	                  return state.promise;
	               }
	            }
	         };
	      },
	      every: function every(array) {
	         var remaining = array.length,
	            results = [],
	            state = State.make();

	         if (!remaining) {
	            state.break(array);
	         } else {
	            array.forEach(function everyPromiseEach(promise, i) {
	               promise.when(function everyProiseWhen(value) {
	                  results[i] = value;
	                  remaining -= 1;
	                  if (remaining === 0) {
	                     state.keep(results);
	                  }
	               }, function everyProiseWhenBroke(reason) {
	                  remaining = NaN;
	                  state.break(reason);
	               });
	            });
	         }
	         return state.promise;
	      },
	      first: function first(array) {
	         var found = false,
	            remaining = array.length,
	            state = State.make();

	         function check() {
	            remaining -= 1;
	            if (remaining === 0 && !found) {
	               state.break();
	            }
	         }

	         if (remaining === 0) {
	            state.break(array);
	         } else {
	            array.forEach(function firstPromiseEach(promise) {
	               promise.when(function firstProiseWhen(value) {
	                  if (!found) {
	                     found = true;
	                     state.keep(value);
	                  }
	                  check();
	               }, check);
	            });
	         }
	         return state.promise;
	      },
	      any: function any(array) {
	         var remaining = array.length,
	            results = [],
	            state = State.make();

	         function check() {
	            remaining -= 1;
	            if (remaining === 0) {
	               state.keep(results);
	            }
	         }

	         if (!remaining) {
	            state.keep(results);
	         } else {
	            array.forEach(function anyPromiseEach(promise, i) {
	               promise.when(function anyProiseWhen(value) {
	                  results[i] = value;
	                  check();
	               }, check);
	            });
	         }
	         return state.promise;
	      },
	      kept: function kept(value) {
	         var state = State.make();
	         state.keep(value);
	         return state.promise;
	      },
	      broken: function broken(reason) {
	         var state = State.make();
	         state.break(reason);
	         return state.promise;
	      }
	   };
	}());

	module.exports = State;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).setImmediate))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(8).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).setImmediate, __webpack_require__(7).clearImmediate))

/***/ },
/* 8 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            currentQueue[queueIndex].run();
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	   partial = __webpack_require__(10),
	   straightFromFile = __webpack_require__(16);
	module.exports = {
	   parse: function modulePars(tag) {
	      var name = utils.splitWs(tag.name.trim());
	      function resolveStatement() {
	         if (!this.includeStack[name]) {
	            this.includeStack[name] = straightFromFile.call(this, name);
	         }
	         if (tag.attribs === undefined) {
	            tag.attribs = {};
	         }
	         tag.attribs.template = name;
	         return partial.parse(tag).call(this);
	      }
	      return function moduleParseResolve() {
	         return resolveStatement.call(this);
	      };
	   },
	   module: function moduleParsing(tag, data) {
	      return partial.module(tag, data);
	   }
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var State = __webpack_require__(6),
	   utils = __webpack_require__(3),
	   injectedDataForce = __webpack_require__(11);
	module.exports = {
	   parse: function partialParse(tag) {
	      var tagData = tag.children;
	      function resolveInjectedData(state, tag, injectingData) {
	         if (injectingData) {
	            this.traversingAST(injectingData).when(
	               function dataTraversing(tagDataAst) {
	                  tag.injectedData = tagDataAst;
	                  state.keep(tag);
	               }.bind(this)
	            );
	         } else {
	            state.keep(tag);
	         }
	         return state;
	      }
	      function resolveInjectedTemplate(tag, state, tagData) {
	         var template = tag.attribs.template.data;
	         tag.injectedTemplate = template[0];
	         state = resolveInjectedData.call(this, state, tag, tagData);
	         return state.promise;
	      }
	      function resolveTemplate(tag, state, tagData) {
	         var template = tag.attribs.template.data.value.trim();
	         if (this.includeStack[template] === undefined) {
	            throw new Error('Requiring tag for "' + template + '" is not found!');
	         }
	         this.includeStack[template].when(
	            function partialInclude(modAST) {
	               if (modAST) {
	                  tag.children = modAST;
	                  state = resolveInjectedData.call(this, state, tag, tagData);
	               } else {
	                  state.break('Requiring tag for "' + template + '" is not found!');
	               }
	            }.bind(this),
	            function brokenPartial(reason) {
	               throw new Error(reason);
	            }
	         );
	         return state.promise;
	      }
	      function resolveStatement() {
	         var state = State.make(),
	            attribs = this._traverseTagAttributes(tag.attribs);
	         if (attribs.template === undefined) {
	            throw new Error("No template tag for partial " + tag.name);
	         }
	         tag.attribs = attribs;
	         if (attribs.template.data.length > 0) {
	            return resolveInjectedTemplate.call(this, tag, state, tagData);
	         }
	         return resolveTemplate.call(this, tag, state, tagData);
	      }
	      return function partialResolve() {
	         return resolveStatement.call(this);
	      };
	   },
	   module: function partialModule(tag, data) {
	      function prepareScope(tag, data) {
	         return injectedDataForce.call(this, { children: tag.injectedData, attribs: tag.attribs }, data);
	      }
	      function resolveStatement() {
	         var assignModuleVar;
	         if (tag.injectedTemplate) {
	            assignModuleVar = tag.injectedTemplate.name.trim();
	            return this._process(data[assignModuleVar], prepareScope.call(this, tag, data));
	         }
	         return this._process(tag.children, prepareScope.call(this, tag, data));
	      }
	      return function partialResolve() {
	         return resolveStatement.call(this);
	      };
	   }
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function injectedDataForce(data, scopeData) {
	   var types = {
	      string: __webpack_require__(12),
	      array: __webpack_require__(13),
	      object: __webpack_require__(14),
	      number: __webpack_require__(15)
	   };
	   return types.object.call(this, data, types, scopeData);
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function stringTag(tag, types, scopeData) {
	   var children, string = '', i;
	   if (tag.children) {
	      children = tag.children;
	      for (i = 0; i < children.length; i++) {
	         if (children[i].type === "text") {
	            string += this._processData(children[i].data, scopeData);
	         }
	      }
	   }
	   return string;
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3);
	module.exports = function arrayTag(tag, types, scopeData) {
	   var children, array = [], nameExists, typeFunction, i;
	   if (tag.children) {
	      children = tag.children;
	      for (i = 0; i < children.length; i++) {
	         nameExists = utils.splitWs(children[i].name);
	         if (nameExists) {
	            if (children[i].children) {
	               typeFunction = types[nameExists];
	               if (typeFunction) {
	                  array.push(typeFunction.call(this, types, children[i], scopeData));
	               } else {
	                  throw new Error(children[i].name + ' property can\'t be in the root of ws:array tag');
	               }
	            }
	         }
	      }
	   }
	   return array;
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	   entityHelpers = __webpack_require__(5);
	module.exports = function objectTag(injected, types, scopeData) {
	   var tObject = {}, typeFunction, nameExists, i, objectForMerge = {}, htmlArray = [];
	   function isEntityUsefulOrHTML(nameExists) {
	      return nameExists && !this._modules.hasOwnProperty(nameExists) && !entityHelpers.isTagRequirableBool(nameExists);
	   }
	   objectForMerge = entityHelpers.parseAttributesForData.call(this, injected.attribs, scopeData);
	   if (injected.children) {
	      injected = injected.children;
	   }
	   for (i = 0; i < injected.length; i++) {
	      nameExists = utils.splitWs(injected[i].name);
	      if (isEntityUsefulOrHTML.call(this, nameExists)) {
	         if (injected[i].children) {
	            typeFunction = types[nameExists];
	            if (typeFunction) {
	               return typeFunction.call(this, injected[i], types, scopeData);
	            }
	            tObject[nameExists] = types.object.call(this, injected[i].children, types, scopeData);
	         }
	      } else {
	         htmlArray.push(injected[i]);
	      }
	   }
	   if (objectForMerge !== undefined) {
	      tObject = utils.merge(tObject, objectForMerge);
	   }
	   if (htmlArray.length > 0) {
	      return htmlArray;
	   }
	   return tObject;
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var entityHelpers = __webpack_require__(5);
	module.exports = function stringTag(tag, types, scopeData) {
	   var children, i;
	   if (tag.children) {
	      children = tag.children;
	      for (i = 0; i < children.length; i++) {
	         if (children[i].type === "text") {
	            return entityHelpers.createNumberFromString(children[i].data.value);
	         }
	      }
	   }
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var State = __webpack_require__(6),
	   requireFile = __webpack_require__(17);
	module.exports = function straightFromFile(name) {
	   var stateMark = State.make();
	   requireFile.call(this, name).when(
	      function includeTraverse(templateData) {
	         this.traversingAST(templateData).when(
	            function includeTraverseState(modAST) {
	               stateMark.keep(modAST);
	            }.bind(this),
	            function brokenTraverse(reason) {
	               throw new Error(reason);
	            }
	         );
	      }.bind(this),
	      function (reason) {
	         throw new Error(reason);
	      }
	   );
	   return stateMark.promise;
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;var utils = __webpack_require__(3),
	   State = __webpack_require__(6);

	module.exports = function requireFile(url) {
	   var isNode = utils.isNode(),
	      resolver = function resolver(templatePath, ext) {
	         return templatePath + '.' + ext;
	      },
	      pathResolver = (this.resolver !== undefined) ? this.resolver : resolver,
	      path = pathResolver(url, 'tmpl');

	   /**
	    * If not node environment -> create empty requirejs module
	    *
	    */
	   if (isNode === false) {
	      !(__WEBPACK_AMD_DEFINE_RESULT__ = function restrainFs() {
	         return {};
	      }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	   }

	   /**
	    * Create XMLHttpRequest
	    * @param  {String} url
	    * @return {Object}     XMLHttpRequest
	    */
	   function createRequest(url) {
	      var request = new XMLHttpRequest();
	      request.open('GET', url);
	      request.send();
	      return request;
	   }

	   /**
	    * Read file with help of FileSystemApi
	    * @param  {String} url
	    * @return {Object}     State promise
	    */
	   function readFileFs(url) {
	      var fs,
	         state = State.make();
	      try {
	         fs = requirejs('fs');
	      } catch (e) {
	         throw new Error("There is no requirejs for node included");
	      }
	      fs.readFile(url, function readFileCallback(err, data) {
	         if (err) {
	            state.break(err);
	         } else {
	            state.keep(this.parse(data));
	         }
	      }.bind(this));
	      return state.promise;
	   }

	   /**
	    * Read file with XMLHttpRequest
	    * @param  {String} url
	    * @return {Object}     State Promise
	    */
	   function readFileXMLHttpRequest(url) {
	      var state = State.make(),
	         req = createRequest(url);
	      req.onreadystatechange = function requestHandler() {
	         if (req.readyState === 4 && req.status === 200) {
	            state.keep(this.parse(req.responseText));
	         }
	      }.bind(this);
	      return state.promise;
	   }

	   if (isNode) {
	      return readFileFs.call(this, path);
	   }

	   return readFileXMLHttpRequest.call(this, path);
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var straightFromFile = __webpack_require__(16),
	   entityHelpers = __webpack_require__(5),
	   State = __webpack_require__(6);
	module.exports = {
	   parse: function requireOrRetire(tag) {
	      var name = tag.attribs.name.trim(),
	         template = tag.attribs.template.trim();
	      function resolveStatement() {
	         var st = State.make();
	         this.includeStack[name] = straightFromFile.call(this, template);
	         st.keep(entityHelpers.createDataRequest(name));
	         return st.promise;
	      }
	      return function includeResolve() {
	         return resolveStatement.call(this);
	      };
	   }
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var State = __webpack_require__(6),
	   entityHelpers = __webpack_require__(5);
	module.exports = {
	   parse: function templateParse(tag) {
	      var name;
	      try {
	         name = tag.attribs.name.trim();
	      } catch (e) {
	         throw new Error("Something wrong with name attribute in ws-template tag");
	      }
	      if (tag.children === undefined || tag.children.length === 0) {
	         throw new Error("There is got to be a children in ws-template tag");
	      }
	      function templateAST() {
	         var unState = State.make();
	         this.traversingAST(tag.children).when(
	            function partialTraversing(modAST) {
	               unState.keep(modAST);
	            },
	            function brokenTraverse(reason) {
	               throw new Error(reason);
	            }
	         );
	         return unState.promise;
	      }
	      function resolveStatement() {
	         var requestState = State.make();
	         this.includeStack[name] = templateAST.call(this);
	         requestState.keep(entityHelpers.createDataRequest(name));
	         return requestState.promise;
	      }
	      return function templateResolve() {
	         return resolveStatement.call(this);
	      };
	   }
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	   seekingForVars = __webpack_require__(21),
	   whatType = __webpack_require__(24),
	   moduleC = __webpack_require__(9),
	   decorators = {},
	   entityHelpers = __webpack_require__(5);
	module.exports = {
	   _modules: {
	      'if': __webpack_require__(25),
	      'for': __webpack_require__(27),
	      'else': __webpack_require__(29),
	      'partial': __webpack_require__(10),
	      'include': __webpack_require__(18),
	      'template': __webpack_require__(19)
	   },
	   _attributeModules: {
	      'if': __webpack_require__(25),
	      'for': __webpack_require__(27),
	      'else': __webpack_require__(29)
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
	      var constructArray = [];
	      for (var attrib in attribs) {
	         if (this._attributeModules.hasOwnProperty(attrib) && attribs[attrib]) {
	            constructArray.push({ module: attrib, value: utils.clone(attribs[attrib]) });
	         }
	      }
	      return constructArray;
	   },
	   _useManageableAttributes: function useManageableAttributes(tag, data) {
	      var constructArray = this._processManageableAttributes(tag.attribs);
	      if (!!constructArray.length) {
	         return utils.reduceArray(constructArray, function reduceToTag(value) {
	            return entityHelpers.loadModuleFunction.call(this, entityHelpers.attributeParserMatcherByName.call(this, value.module), tag, data);
	         }.bind(this));
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


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	   jsResolver = __webpack_require__(22),
	   decorators = __webpack_require__(23);
	module.exports = function seekForVars(textData, scopeData) {
	   function resolveVariable(variable, data) {
	      return jsResolver.parse(variable)(data, decorators);
	   }
	   var res;
	   if (textData.type === 'expression') {
	      res = resolveVariable(textData.expression, scopeData);
	      textData.value = res;
	      return res;
	   }
	   if (textData.type === 'var') {
	      res = resolveVariable(textData.name, scopeData);
	      textData.value = res;
	      return res;
	   }
	   return textData.value;
	};


/***/ },
/* 22 */
/***/ function(module, exports) {

	/* parser generated by jison 0.4.15 */
	/*
	  Returns a Parser object of the following structure:

	  Parser: {
	    yy: {}
	  }

	  Parser.prototype: {
	    yy: {},
	    trace: function(),
	    symbols_: {associative list: name ==> number},
	    terminals_: {associative list: number ==> name},
	    productions_: [...],
	    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
	    table: [...],
	    defaultActions: {...},
	    parseError: function(str, hash),
	    parse: function(input),

	    lexer: {
	        EOF: 1,
	        parseError: function(str, hash),
	        setInput: function(input),
	        input: function(),
	        unput: function(str),
	        more: function(),
	        less: function(n),
	        pastInput: function(),
	        upcomingInput: function(),
	        showPosition: function(),
	        test_match: function(regex_match_array, rule_index),
	        next: function(),
	        lex: function(),
	        begin: function(condition),
	        popState: function(),
	        _currentRules: function(),
	        topState: function(),
	        pushState: function(condition),

	        options: {
	            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
	            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
	            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
	        },

	        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
	        rules: [...],
	        conditions: {associative list: name ==> set},
	    }
	  }


	  token location info (@$, _$, etc.): {
	    first_line: n,
	    last_line: n,
	    first_column: n,
	    last_column: n,
	    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
	  }


	  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
	    text:        (matched text)
	    token:       (the produced terminal token, if any)
	    line:        (yylineno)
	  }
	  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
	    loc:         (yylloc)
	    expected:    (string describing the set of expected tokens)
	    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
	  }
	*/
	var parser = (function(){
	var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[8,10,17,21,22,27,30,35,58,59,64,65,66,67,68,110,123,124,125,126,127],$V1=[1,9],$V2=[1,11],$V3=[1,32],$V4=[1,33],$V5=[1,29],$V6=[1,44],$V7=[1,45],$V8=[1,50],$V9=[1,51],$Va=[1,48],$Vb=[1,49],$Vc=[1,52],$Vd=[1,53],$Ve=[1,54],$Vf=[1,46],$Vg=[1,55],$Vh=[1,56],$Vi=[1,57],$Vj=[1,58],$Vk=[1,59],$Vl=[2,8,13,27,30,45,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,110,112],$Vm=[2,20],$Vn=[2,8,13],$Vo=[2,8,13,106,112],$Vp=[2,8,13,102,106,112],$Vq=[2,8,13,86,87,88,89,102,106,112],$Vr=[2,8,13,79,80,81,82,86,87,88,89,102,106,112],$Vs=[2,8,13,66,67,79,80,81,82,86,87,88,89,102,106,112],$Vt=[2,8,13,27,30,45,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,112],$Vu=[2,51],$Vv=[2,8,13,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,112],$Vw=[1,86],$Vx=[1,83],$Vy=[1,84],$Vz=[1,89],$VA=[1,90],$VB=[1,95],$VC=[2,8,13,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,112],$VD=[2,8,11,13,27,28,30,31,36,45,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,110,112],$VE=[1,123],$VF=[1,127],$VG=[1,135],$VH=[1,137],$VI=[1,141],$VJ=[1,139],$VK=[1,140],$VL=[1,138],$VM=[2,8,13,27,28,30,45,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,110,112],$VN=[2,168],$VO=[13,27,30,45,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,112],$VP=[1,180],$VQ=[1,182],$VR=[2,24],$VS=[1,183],$VT=[1,184],$VU=[13,28,31],$VV=[2,8,11,13,27,28,30,31,36,45,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,106,110,112],$VW=[1,187],$VX=[2,8,11,13,27,28,30,31,36,45,58,59,66,67,70,71,72,86,87,88,89,102,106,110,112],$VY=[1,192],$VZ=[1,193],$V_=[1,194],$V$=[1,195],$V01=[2,8,11,13,27,28,30,31,36,45,58,59,66,67,79,80,81,82,86,87,88,89,102,106,110,112],$V11=[1,198],$V21=[1,199],$V31=[1,200],$V41=[2,8,11,13,28,31,36,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,110,112],$V51=[1,210],$V61=[10,13,21,22,27,30,31,35,58,59,64,65,66,67,68,110,123,124,125,126,127],$V71=[13,31],$V81=[2,17],$V91=[13,36],$Va1=[2,8,13,27,28,30,31,36,45,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,110,112],$Vb1=[1,223],$Vc1=[27,30,45,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,112],$Vd1=[2,184],$Ve1=[2,183];
	var parser = {trace: function trace() { },
	yy: {},
	symbols_: {"error":2,"Statement":3,"EmptyStatement":4,"ExpressionStatement":5,"LabelledStatement":6,"StatementList":7,";":8,"ExpressionNoBF":9,"IDENTIFIER":10,":":11,"FormalParameterList":12,",":13,"FunctionBody":14,"SourceElements":15,"Program":16,"EOF":17,"SourceElement":18,"PrimaryExpression":19,"PrimaryExpressionNoBrace":20,"THIS":21,"ROOT":22,"Literal":23,"ArrayLiteral":24,"ObjectLiteral":25,"DecoratorChain":26,"(":27,")":28,"Expression":29,"[":30,"]":31,"Elision":32,"ElementList":33,"AssignmentExpression":34,"{":35,"}":36,"PropertyNameAndValueList":37,"PropertyAssignment":38,"PropertyName":39,"IdentifierName":40,"StringLiteral":41,"NumericLiteral":42,"PropertySetParameterList":43,"MemberExpression":44,".":45,"MemberExpressionNoBF":46,"DecoratorCalls":47,"NewExpression":48,"NewExpressionNoBF":49,"CallExpression":50,"Arguments":51,"CallExpressionNoBF":52,"ReservedWord":53,"ArgumentList":54,"LeftHandSideExpression":55,"LeftHandSideExpressionNoBF":56,"PostfixExpression":57,"++":58,"--":59,"PostfixExpressionNoBF":60,"UnaryExpression":61,"UnaryExpr":62,"UnaryExpressionNoBF":63,"BR++":64,"BR--":65,"+":66,"-":67,"!":68,"MultiplicativeExpression":69,"*":70,"/":71,"%":72,"MultiplicativeExpressionNoBF":73,"AdditiveExpression":74,"AdditiveExpressionNoBF":75,"ShiftExpression":76,"ShiftExpressionNoBF":77,"RelationalExpression":78,"<":79,">":80,"<=":81,">=":82,"RelationalExpressionNoIn":83,"RelationalExpressionNoBF":84,"EqualityExpression":85,"==":86,"!=":87,"===":88,"!==":89,"EqualityExpressionNoIn":90,"EqualityExpressionNoBF":91,"BitwiseANDExpression":92,"BitwiseANDExpressionNoIn":93,"BitwiseANDExpressionNoBF":94,"BitwiseXORExpression":95,"BitwiseXORExpressionNoIn":96,"BitwiseXORExpressionNoBF":97,"BitwiseORExpression":98,"BitwiseORExpressionNoIn":99,"BitwiseORExpressionNoBF":100,"LogicalANDExpression":101,"&&":102,"LogicalANDExpressionNoIn":103,"LogicalANDExpressionNoBF":104,"LogicalORExpression":105,"||":106,"LogicalORExpressionNoIn":107,"LogicalORExpressionNoBF":108,"DecoratorChainEntity":109,"|":110,"ConditionalExpression":111,"?":112,"ConditionalExpressionNoIn":113,"AssignmentExpressionNoIn":114,"ConditionalExpressionNoBF":115,"ConditionalExpressionCast":116,"ConditionalExpressionCastNoIn":117,"ConditionalExpressionCastNoBF":118,"AssignmentExpressionNoBF":119,"ExpressionNoIn":120,"NullLiteral":121,"BooleanLiteral":122,"NULL":123,"TRUE":124,"FALSE":125,"NUMERIC_LITERAL":126,"STRING_LITERAL":127,"VOID":128,"$accept":0,"$end":1},
	terminals_: {2:"error",8:";",10:"IDENTIFIER",11:":",13:",",17:"EOF",21:"THIS",22:"ROOT",27:"(",28:")",30:"[",31:"]",35:"{",36:"}",45:".",58:"++",59:"--",64:"BR++",65:"BR--",66:"+",67:"-",68:"!",70:"*",71:"/",72:"%",79:"<",80:">",81:"<=",82:">=",86:"==",87:"!=",88:"===",89:"!==",102:"&&",106:"||",110:"|",112:"?",123:"NULL",124:"TRUE",125:"FALSE",126:"NUMERIC_LITERAL",127:"STRING_LITERAL",128:"VOID"},
	productions_: [0,[3,1],[3,1],[3,1],[7,2],[7,0],[4,1],[5,2],[5,2],[6,3],[12,1],[12,3],[14,1],[16,2],[15,2],[15,0],[18,1],[19,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,3],[20,3],[24,2],[24,3],[24,3],[24,4],[24,5],[33,1],[33,2],[33,3],[33,4],[32,1],[32,2],[25,2],[25,3],[25,4],[37,1],[37,3],[38,3],[39,1],[39,1],[39,1],[43,1],[44,1],[44,4],[44,3],[46,1],[46,4],[46,3],[46,1],[48,1],[49,1],[50,2],[50,4],[50,3],[50,2],[50,4],[50,3],[50,4],[50,3],[52,2],[52,2],[52,4],[52,3],[52,4],[52,3],[40,1],[40,1],[51,2],[51,3],[54,1],[54,3],[55,1],[55,1],[56,1],[56,1],[57,1],[57,2],[57,2],[60,1],[60,2],[60,2],[61,1],[61,1],[63,1],[63,1],[62,2],[62,2],[62,2],[62,2],[62,2],[62,2],[62,2],[69,1],[69,3],[69,3],[69,3],[73,1],[73,3],[73,3],[73,3],[74,1],[74,3],[74,3],[75,1],[75,3],[75,3],[76,1],[77,1],[77,1],[78,1],[78,3],[78,3],[78,3],[78,3],[83,1],[83,3],[83,3],[83,3],[83,3],[84,1],[84,3],[84,3],[84,3],[84,3],[85,1],[85,3],[85,3],[85,3],[85,3],[90,1],[90,3],[90,3],[90,3],[90,3],[91,1],[91,3],[91,3],[91,3],[91,3],[92,1],[93,1],[94,1],[95,1],[96,1],[97,1],[98,1],[99,1],[100,1],[101,1],[101,3],[103,1],[103,3],[104,1],[104,3],[105,1],[105,3],[107,1],[107,3],[108,1],[108,3],[47,2],[47,2],[47,2],[47,4],[47,4],[47,1],[26,1],[26,2],[109,2],[109,4],[109,4],[111,1],[111,5],[113,1],[113,5],[115,1],[115,5],[115,5],[115,5],[115,5],[116,1],[116,3],[117,1],[117,3],[118,1],[118,3],[34,1],[34,1],[114,1],[114,1],[119,1],[119,1],[29,1],[29,3],[120,1],[120,3],[9,1],[9,3],[23,1],[23,1],[23,1],[23,1],[121,1],[122,1],[122,1],[42,1],[41,1],[53,1],[53,1],[53,1],[53,1],[53,1]],
	performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
	/* this == yyval */

	var $0 = $$.length - 1;
	switch (yystate) {
	case 4: case 14: case 33:

	            this.$ = $$[$0-1].concat($$[$0]);
	        
	break;
	case 5: case 73:

	            this.$ = [];
	        
	break;
	case 6:

	            this.$ = EmptyStatementNode();
	        
	break;
	case 7: case 8:

	            this.$ = ExpressionStatementNode($$[$0-1]);
	        
	break;
	case 9:

	            this.$ = LabeledStatementNode($$[$0-2], $$[$0]);
	        
	break;
	case 10: case 32:

	            this.$ = [$$[$0]];
	        
	break;
	case 11:

	            this.$ = $$[$0-2].concat(new IdentifierNode($$[$0]));

	break;
	case 13:

	            this.$ = (function() { return new Function('data', 'decorators', 'vdomUtils', 'return ' + $$[$0-1] + ';' ) })();
	            return this.$;
	        
	break;
	case 15:

	            this.$ = "";
	        
	break;
	case 18:

	            this.$ = ThisExpressionNode();
	        
	break;
	case 19:

	            this.$ = 'data';
	        
	break;
	case 20:

	            this.$ = 'data.' + $$[$0];
	        
	break;
	case 25: case 26:

	            this.$ = $$[$0-2] + $$[$0-1] + $$[$0];
	        
	break;
	case 27:

	            this.$ = ArrayExpressionNode([]);
	        
	break;
	case 28: case 29:

	            this.$ = ArrayExpressionNode($$[$0-1]);
	        
	break;
	case 30:

	            this.$ = ArrayExpressionNode($$[$0-2].concat(null));
	        
	break;
	case 31:

	            this.$ = ArrayExpressionNode($$[$0-3].concat($$[$0-1]));
	        
	break;
	case 34: case 42:

	            this.$ = $$[$0-2].concat($$[$0]);
	        
	break;
	case 35:

	            this.$ = $$[$0-3].concat($$[$0-1]).concat($$[$0]);
	        
	break;
	case 36:

	            this.$ = [null, null];
	        
	break;
	case 37:

	            this.$ = $$[$0-1].concat(null);
	        
	break;
	case 38:

	            this.$ = ObjectExpressionNode();
	        
	break;
	case 39:

	            this.$ = ObjectExpressionNode($$[$0-1]);
	        
	break;
	case 40:

	            this.$ = ObjectExpressionNode($$[$0-2]);
	        
	break;
	case 41: case 47: case 71: case 72: case 75:

	            this.$ = $$[$0];
	        
	break;
	case 43:

	            this.$ = $$[$0-2] + ':' + $$[$0] + ',';
	        
	break;
	case 49: case 52: case 58: case 61: case 63: case 67: case 69:

	            this.$ = MemberExpressionNode($$[$0-3], $$[$0-1], true);
	        
	break;
	case 50: case 53: case 62: case 64: case 68:

	            this.$ = MemberExpressionNode($$[$0-2], $$[$0], false);
	        
	break;
	case 57: case 60: case 65: case 66:

	            this.$ = CallExpressionNode($$[$0-1], $$[$0]);
	        
	break;
	case 59: case 70:

	           this.$ = MemberExpressionNode($$[$0-2], $$[$0], false);
	        
	break;
	case 74:

	            this.$ = $$[$0-1];
	        
	break;
	case 76:

	            this.$ = $$[$0-2] + ',' + $$[$0];
	        
	break;
	case 82: case 85:

	            this.$ = UpdateExpressionNode("++", $$[$0-1], false);
	        
	break;
	case 83: case 86:

	            this.$ = UpdateExpressionNode("--", $$[$0-1], false);
	        
	break;
	case 91:

	            _$[$0-1].first_line = _$[$0-1].last_line;
	            _$[$0-1].first_column = _$[$0-1].last_column - 2;
	            this.$ = UpdateExpressionNode("++", $$[$0], true);
	        
	break;
	case 92:

	            _$[$0-1].first_line = _$[$0-1].last_line;
	            _$[$0-1].first_column = _$[$0-1].last_column - 2;
	            this.$ = UpdateExpressionNode("--", $$[$0], true);
	        
	break;
	case 93:

	            this.$ = UpdateExpressionNode("++", $$[$0], true);
	        
	break;
	case 94:

	            this.$ = UpdateExpressionNode("--", $$[$0], true);
	        
	break;
	case 95:

	            this.$ = UnaryExpressionNode("+", true, $$[$0]);
	        
	break;
	case 96:

	            this.$ = UnaryExpressionNode("-", true, $$[$0]);
	        
	break;
	case 97:

	            this.$ = UnaryExpressionNode("!", true, $$[$0]);
	        
	break;
	case 99: case 103:

	            this.$ = BinaryExpressionNode("*", $$[$0-2], $$[$0]);
	        
	break;
	case 100: case 104:

	            this.$ = BinaryExpressionNode("/", $$[$0-2], $$[$0]);
	        
	break;
	case 101: case 105:

	            this.$ = BinaryExpressionNode("%", $$[$0-2], $$[$0]);
	        
	break;
	case 107: case 110:

	            this.$ = BinaryExpressionNode("+", $$[$0-2], $$[$0]);
	        
	break;
	case 108: case 111:

	            this.$ = BinaryExpressionNode("-", $$[$0-2], $$[$0]);
	        
	break;
	case 116: case 121: case 126:

	            this.$ = BinaryExpressionNode("<", $$[$0-2], $$[$0]);
	        
	break;
	case 117: case 122: case 127:

	            this.$ = BinaryExpressionNode(">", $$[$0-2], $$[$0]);
	        
	break;
	case 118: case 123: case 128:

	            this.$ = BinaryExpressionNode("<=", $$[$0-2], $$[$0]);
	        
	break;
	case 119: case 124: case 129:

	            this.$ = BinaryExpressionNode(">=", $$[$0-2], $$[$0]);
	        
	break;
	case 131: case 136: case 141:

	            this.$ = BinaryExpressionNode("==", $$[$0-2], $$[$0]);
	        
	break;
	case 132: case 137: case 142:

	            this.$ = BinaryExpressionNode("!=", $$[$0-2], $$[$0]);
	        
	break;
	case 133: case 138: case 143:

	            this.$ = BinaryExpressionNode("===", $$[$0-2], $$[$0]);
	        
	break;
	case 134: case 139: case 144:

	            this.$ = BinaryExpressionNode("!==", $$[$0-2], $$[$0]);
	        
	break;
	case 155: case 157: case 159:

	                this.$ = LogicalExpressionNode("&&", $$[$0-2], $$[$0]);
	            
	break;
	case 161: case 163: case 165:

	                this.$ = LogicalExpressionNode("||", $$[$0-2], $$[$0]);
	            
	break;
	case 166: case 167: case 168:

	            this.$ = DecoratorCallNode($$[$0], $$[$0-1]);
	        
	break;
	case 169:

	            this.$ = DecoratorCallNode($$[$0-1], $$[$0-2]);
	        
	break;
	case 170:

	            this.$ = DecoratorCallNode($$[$0], $$[$0-2]);
	        
	break;
	case 171:

	            this.$ = DecoratorCallNode($$[$0]);
	        
	break;
	case 172:

	            this.$ = DecoratorChainContext($$[$0]);
	        
	break;
	case 173:

	            this.$ = DecoratorChainContext($$[$0], $$[$0-1]);
	        
	break;
	case 174:

	            this.$ = DecoratorChainCallNode($$[$0]);
	        
	break;
	case 175:

	            this.$ = DecoratorChainCallNode($$[$0-2], $$[$0])
	        
	break;
	case 176:

	            this.$ = DecoratorChainCallNode($$[$0-3], $$[$0-1])
	        
	break;
	case 178: case 180: case 182:

	            this.$ = ConditionalExpressionNode($$[$0-4], $$[$0-2], $$[$0]);
	        
	break;
	case 183: case 184: case 185:

	        this.$ = ConditionalExpressionNode($$[$0-4], $$[$0-2], $$[$0]);
	      
	break;
	case 187: case 189: case 191:

	            this.$ = ConditionalExpressionNode($$[$0-2], $$[$0]);
	        
	break;
	case 199: case 201: case 203:

	            if ($$[$0-2].type === "SequenceExpression") {
	                $$[$0-2].expressions.concat($$[$0]);
	                this.$ = $$[$0-2];
	            } else {
	                this.$ = new SequenceExpressionNode([$$[$0-2], $$[$0]]);
	            }
	        
	break;
	case 208:

	            this.$ = LiteralNode(null);
	        
	break;
	case 209:

	            this.$ = LiteralNode(true);
	        
	break;
	case 210:

	            this.$ = LiteralNode(false);
	        
	break;
	case 211:

	            this.$ = LiteralNode(parseNumericLiteral($$[$0]));
	        
	break;
	case 212:

	            this.$ = LiteralNode($$[$0]);
	        
	break;
	}
	},
	table: [o($V0,[2,15],{16:1,15:2}),{1:[3]},{3:5,4:6,5:7,6:8,8:$V1,9:10,10:$V2,17:[1,3],18:4,20:26,21:$V3,22:$V4,23:34,24:35,25:36,26:30,27:$V5,30:$V6,35:$V7,41:43,42:42,46:27,47:24,49:60,52:28,56:47,58:$V8,59:$V9,60:38,62:39,63:31,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,73:25,75:23,77:22,84:21,91:20,94:19,97:18,100:17,104:16,108:15,109:37,110:$Vf,115:13,118:14,119:12,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{1:[2,13]},o($V0,[2,14]),o($V0,[2,16]),o($V0,[2,1]),o($V0,[2,2]),o($V0,[2,3]),o($V0,[2,6]),{2:[1,62],8:[1,61],13:[1,63]},o($Vl,$Vm,{11:[1,64]}),o($Vn,[2,202]),o($Vn,[2,196]),o($Vn,[2,197]),o($Vn,[2,181],{106:[1,66],112:[1,65]}),o($Vo,[2,164],{102:[1,67]}),o($Vp,[2,158]),o($Vp,[2,153]),o($Vp,[2,150]),o($Vp,[2,147],{86:[1,68],87:[1,69],88:[1,70],89:[1,71]}),o($Vq,[2,140],{79:[1,72],80:[1,73],81:[1,74],82:[1,75]}),o($Vr,[2,125]),o($Vr,[2,113],{66:[1,76],67:[1,77]}),o($Vl,[2,114]),o($Vs,[2,109],{70:[1,78],71:[1,79],72:[1,80]}),o($Vt,$Vu,{109:37,26:81,110:$Vf}),o($Vv,[2,56],{109:37,26:82,51:85,27:$Vw,30:$Vx,45:$Vy,110:$Vf}),o($Vv,[2,80],{109:37,26:87,51:88,27:$Vw,30:$Vz,45:$VA,110:$Vf}),{10:$VB,19:118,20:92,21:$V3,22:$V4,23:34,24:35,25:36,26:96,27:$V5,29:93,30:$V6,34:97,35:$V7,41:43,42:42,44:117,46:94,47:98,48:115,50:116,52:91,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($Vt,[2,171],{109:119,110:$Vf}),o($VC,[2,102]),o($VD,[2,18]),o($VD,[2,19]),o($VD,[2,21]),o($VD,[2,22]),o($VD,[2,23]),o($VD,[2,172]),o($VC,[2,89]),o($VC,[2,90]),o($VD,[2,204]),o($VD,[2,205]),o($VD,[2,206]),o($VD,[2,207]),{10:$VB,13:$VE,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,31:[1,120],32:121,33:122,34:124,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VG,21:$VH,36:[1,128],37:129,38:130,39:131,40:132,41:133,42:134,53:136,123:$VI,124:$VJ,125:$VK,126:$Vj,127:$Vk,128:$VL},{10:[1,142]},o($VC,[2,84],{58:[1,143],59:[1,144]}),{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:145,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:146,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:147,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:148,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:149,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:150,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:151,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($VD,[2,208]),o($VD,[2,209]),o($VD,[2,210]),o($VD,[2,211]),o($VD,[2,212]),o($Vv,[2,79]),o($V0,[2,7]),o($V0,[2,8]),{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,34:152,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{3:153,4:6,5:7,6:8,8:$V1,9:10,10:$V2,20:26,21:$V3,22:$V4,23:34,24:35,25:36,26:30,27:$V5,30:$V6,35:$V7,41:43,42:42,46:27,47:24,49:60,52:28,56:47,58:$V8,59:$V9,60:38,62:39,63:31,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,73:25,75:23,77:22,84:21,91:20,94:19,97:18,100:17,104:16,108:15,109:37,110:$Vf,115:13,118:14,119:12,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:155,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,34:154,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:156,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:157,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:158,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:159,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:160,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:161,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:162,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:163,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:164,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:165,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:166,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:167,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:168,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:169,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:170,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($Vt,[2,166],{109:119,110:$Vf}),o($Vt,[2,167],{109:119,110:$Vf}),{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,29:171,30:$V6,34:97,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VG,21:$VH,40:172,53:136,123:$VI,124:$VJ,125:$VK,128:$VL},o($VM,[2,65]),{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,28:[1,173],30:$V6,34:175,35:$V7,41:43,42:42,44:117,48:115,50:116,54:174,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($Vt,$VN,{109:119,110:$Vf}),o($VM,[2,66]),{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,29:176,30:$V6,34:97,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VG,21:$VH,40:177,53:136,123:$VI,124:$VJ,125:$VK,128:$VL},{26:178,27:$Vw,28:[1,179],30:$Vz,45:$VA,51:88,109:37,110:$Vf},o($VO,$Vu,{109:37,26:81,28:$VP,110:$Vf}),{13:$VQ,28:[1,181]},{26:82,27:$Vw,30:$Vx,45:$Vy,51:85,109:37,110:$Vf},o($VD,$Vm),o([13,27,28,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,112],$VR,{109:119,30:$VS,45:$VT,110:$Vf}),o($VU,[2,198]),o([27,30,45,110],[2,54]),o($VD,[2,192]),o($VD,[2,193]),o([2,8,11,13,27,28,30,31,36,45,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,110],[2,177],{106:[1,186],112:[1,185]}),o($VV,[2,160],{102:$VW}),o($VD,[2,154]),o($VD,[2,151]),o($VD,[2,148]),o([2,8,11,13,27,28,30,31,36,45,58,59,66,67,70,71,72,79,80,81,82,102,106,110,112],[2,145],{86:[1,188],87:[1,189],88:[1,190],89:[1,191]}),o($VX,[2,130],{79:$VY,80:$VZ,81:$V_,82:$V$}),o($VD,[2,115]),o([2,8,11,13,27,28,30,31,36,45,58,59,70,71,72,79,80,81,82,86,87,88,89,102,106,110,112],[2,112],{66:[1,196],67:[1,197]}),o($V01,[2,106],{70:$V11,71:$V21,72:$V31}),o($VD,[2,98]),o($VD,[2,87]),o($VD,[2,88]),o([2,8,11,13,27,28,30,31,36,45,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,110,112],[2,81],{58:[1,201],59:[1,202]}),o($VD,[2,77]),o($V41,[2,78],{51:203,27:$Vw,30:[1,204],45:[1,205]}),o($V41,[2,55],{51:206,27:$Vw,30:[1,207],45:[1,208]}),o($VD,[2,48]),o($VD,[2,173]),o($VD,[2,27]),{10:$VB,13:$V51,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,31:[1,209],34:211,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{13:[1,213],31:[1,212]},o($V61,[2,36]),o($V71,[2,32]),o([2,8,11,13,27,28,31,36,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,112],$VR,{109:119,30:$VS,45:$VT,110:$Vf}),o($VD,$V81),{10:$VB,19:118,20:214,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,29:93,30:$V6,34:97,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($VD,[2,38]),{13:[1,216],36:[1,215]},o($V91,[2,41]),{11:[1,217]},{11:[2,44]},{11:[2,45]},{11:[2,46]},o($VD,[2,71]),o($VD,[2,72]),o($VD,[2,213]),o($VD,[2,214]),o($VD,[2,215]),o($VD,[2,216]),o($VD,[2,217]),o($Va1,[2,174],{11:[1,218]}),o($VC,[2,85]),o($VC,[2,86]),o($VD,[2,91]),o($VD,[2,92]),o($VD,[2,93]),o($VD,[2,94]),o($VD,[2,95]),o($VD,[2,96]),o($VD,[2,97]),o($Vn,[2,203]),o($V0,[2,9]),o($Vn,[2,191],{11:[1,219]}),o($Vt,$V81,{11:[1,220]}),o($Vo,[2,165],{102:$VW}),o($Vp,[2,159]),o($Vq,[2,141],{79:$VY,80:$VZ,81:$V_,82:$V$}),o($Vq,[2,142],{79:$VY,80:$VZ,81:$V_,82:$V$}),o($Vq,[2,143],{79:$VY,80:$VZ,81:$V_,82:$V$}),o($Vq,[2,144],{79:$VY,80:$VZ,81:$V_,82:$V$}),o($Vr,[2,126]),o($Vr,[2,127]),o($Vr,[2,128]),o($Vr,[2,129]),o($Vs,[2,110],{70:$V11,71:$V21,72:$V31}),o($Vs,[2,111],{70:$V11,71:$V21,72:$V31}),o($VC,[2,103]),o($VC,[2,104]),o($VC,[2,105]),{13:$VQ,31:[1,221]},o($Vl,[2,53]),o($VD,[2,73]),{13:$Vb1,28:[1,222]},o($VD,[2,75]),{13:$VQ,31:[1,224]},o($VM,[2,68]),o([27,30,45],$VN,{109:119,28:[1,225],110:$Vf}),{26:226,109:37,110:$Vf},o($VD,[2,25]),o($VD,[2,26]),{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,34:227,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,29:228,30:$V6,34:97,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VG,21:$VH,40:229,53:136,123:$VI,124:$VJ,125:$VK,128:$VL},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,34:230,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:231,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:232,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:233,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:234,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:235,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:236,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:237,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:238,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:239,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:240,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:241,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:242,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:243,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:244,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:245,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,109:37,110:$Vf,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($VD,[2,82]),o($VD,[2,83]),o($VD,[2,60]),{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,29:246,30:$V6,34:97,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VG,21:$VH,40:247,53:136,123:$VI,124:$VJ,125:$VK,128:$VL},o($VD,[2,57]),{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,29:248,30:$V6,34:97,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VG,21:$VH,40:249,53:136,123:$VI,124:$VJ,125:$VK,128:$VL},o($VD,[2,28]),o($V61,[2,37]),o($V71,[2,33]),o($VD,[2,29]),{10:$VB,13:$VE,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,31:[1,250],32:251,34:252,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($VO,$V81,{28:$VP}),o($VD,[2,39]),{10:$VG,21:$VH,36:[1,253],38:254,39:131,40:132,41:133,42:134,53:136,123:$VI,124:$VJ,125:$VK,126:$Vj,127:$Vk,128:$VL},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,34:255,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,34:175,35:$V7,41:43,42:42,44:117,48:115,50:116,54:256,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:258,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,34:257,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},{10:$VB,19:118,20:259,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,34:260,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($Vl,[2,52]),o($VD,[2,74]),{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,34:261,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($VM,[2,67]),o($Vl,[2,169]),o($Vt,[2,170],{109:119,110:$Vf}),o($VU,[2,199]),{13:$VQ,31:[1,262]},o($VD,[2,64]),o($Va1,[2,187],{11:[1,263]}),o($VV,[2,161],{102:$VW}),o($VD,[2,155]),o($VX,[2,131],{79:$VY,80:$VZ,81:$V_,82:$V$}),o($VX,[2,132],{79:$VY,80:$VZ,81:$V_,82:$V$}),o($VX,[2,133],{79:$VY,80:$VZ,81:$V_,82:$V$}),o($VX,[2,134],{79:$VY,80:$VZ,81:$V_,82:$V$}),o($VD,[2,116]),o($VD,[2,117]),o($VD,[2,118]),o($VD,[2,119]),o($V01,[2,107],{70:$V11,71:$V21,72:$V31}),o($V01,[2,108],{70:$V11,71:$V21,72:$V31}),o($VD,[2,99]),o($VD,[2,100]),o($VD,[2,101]),{13:$VQ,31:[1,264]},o($VD,[2,62]),{13:$VQ,31:[1,265]},o($VD,[2,59]),o($VD,[2,30]),{10:$VB,13:$V51,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,31:[1,266],34:267,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($V71,[2,34]),o($VD,[2,40]),o($V91,[2,42]),o($V91,[2,43]),o([2,8,11,27,28,30,31,36,45,58,59,66,67,70,71,72,79,80,81,82,86,87,88,89,102,106,110,112],[2,175],{13:$Vb1}),o($Vn,[2,182]),o($Vc1,$V81,{2:$Vd1,8:$Vd1,13:$Vd1}),o($Vc1,$V81,{2:$Ve1,8:$Ve1,13:$Ve1}),o($Vn,[2,185]),o($VD,[2,76]),o($VD,[2,63]),{10:$VB,19:118,20:126,21:$V3,22:$V4,23:34,24:35,25:36,26:125,27:$VF,30:$V6,34:268,35:$V7,41:43,42:42,44:117,48:115,50:116,55:114,57:112,58:$V8,59:$V9,61:111,62:113,64:$Va,65:$Vb,66:$Vc,67:$Vd,68:$Ve,69:110,74:109,76:108,78:107,85:106,92:105,95:104,98:103,101:102,105:101,109:37,110:$Vf,111:99,116:100,121:40,122:41,123:$Vg,124:$Vh,125:$Vi,126:$Vj,127:$Vk},o($VD,[2,61]),o($VD,[2,58]),o($VD,[2,31]),o($V71,[2,35]),o($VD,[2,178])],
	defaultActions: {3:[2,13],132:[2,44],133:[2,45],134:[2,46]},
	parseError: function parseError(str, hash) {
	    if (hash.recoverable) {
	        this.trace(str);
	    } else {
	        throw new Error(str);
	    }
	},
	parse: function parse(input) {
	    var self = this,
	        stack = [0],
	        tstack = [], // token stack
	        vstack = [null], // semantic value stack
	        lstack = [], // location stack
	        table = this.table,
	        yytext = '',
	        yylineno = 0,
	        yyleng = 0,
	        recovering = 0,
	        TERROR = 2,
	        EOF = 1;

	    var args = lstack.slice.call(arguments, 1);

	    //this.reductionCount = this.shiftCount = 0;

	    var lexer = Object.create(this.lexer);
	    var sharedState = { yy: {} };
	    // copy state
	    for (var k in this.yy) {
	      if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
	        sharedState.yy[k] = this.yy[k];
	      }
	    }

	    lexer.setInput(input, sharedState.yy);
	    sharedState.yy.lexer = lexer;
	    sharedState.yy.parser = this;
	    if (typeof lexer.yylloc == 'undefined') {
	        lexer.yylloc = {};
	    }
	    var yyloc = lexer.yylloc;
	    lstack.push(yyloc);

	    var ranges = lexer.options && lexer.options.ranges;

	    if (typeof sharedState.yy.parseError === 'function') {
	        this.parseError = sharedState.yy.parseError;
	    } else {
	        this.parseError = Object.getPrototypeOf(this).parseError;
	    }

	    function popStack (n) {
	        stack.length = stack.length - 2 * n;
	        vstack.length = vstack.length - n;
	        lstack.length = lstack.length - n;
	    }

	_token_stack:
	    function lex() {
	        var token;
	        token = lexer.lex() || EOF;
	        // if token isn't its numeric value, convert
	        if (typeof token !== 'number') {
	            token = self.symbols_[token] || token;
	        }
	        return token;
	    }

	    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
	    while (true) {
	        // retreive state number from top of stack
	        state = stack[stack.length - 1];

	        // use default actions if available
	        if (this.defaultActions[state]) {
	            action = this.defaultActions[state];
	        } else {
	            if (symbol === null || typeof symbol == 'undefined') {
	                symbol = lex();
	            }
	            // read action for current state and first input
	            action = table[state] && table[state][symbol];
	        }

	_handle_error:
	        // handle parse error
	        if (typeof action === 'undefined' || !action.length || !action[0]) {
	            var error_rule_depth;
	            var errStr = '';

	            // Return the rule stack depth where the nearest error rule can be found.
	            // Return FALSE when no error recovery rule was found.
	            function locateNearestErrorRecoveryRule(state) {
	                var stack_probe = stack.length - 1;
	                var depth = 0;

	                // try to recover from error
	                for(;;) {
	                    // check for error recovery rule in this state
	                    if ((TERROR.toString()) in table[state]) {
	                        return depth;
	                    }
	                    if (state === 0 || stack_probe < 2) {
	                        return false; // No suitable error recovery rule available.
	                    }
	                    stack_probe -= 2; // popStack(1): [symbol, action]
	                    state = stack[stack_probe];
	                    ++depth;
	                }
	            }

	            if (!recovering) {
	                // first see if there's any chance at hitting an error recovery rule:
	                error_rule_depth = locateNearestErrorRecoveryRule(state);

	                // Report error
	                expected = [];
	                for (p in table[state]) {
	                    if (this.terminals_[p] && p > TERROR) {
	                        expected.push("'"+this.terminals_[p]+"'");
	                    }
	                }
	                if (lexer.showPosition) {
	                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol)+ "'";
	                } else {
	                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
	                                  (symbol == EOF ? "end of input" :
	                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
	                }
	                this.parseError(errStr, {
	                    text: lexer.match,
	                    token: this.terminals_[symbol] || symbol,
	                    line: lexer.yylineno,
	                    loc: yyloc,
	                    expected: expected,
	                    recoverable: (error_rule_depth !== false)
	                });
	            } else if (preErrorSymbol !== EOF) {
	                error_rule_depth = locateNearestErrorRecoveryRule(state);
	            }

	            // just recovered from another error
	            if (recovering == 3) {
	                if (symbol === EOF || preErrorSymbol === EOF) {
	                    throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
	                }

	                // discard current lookahead and grab another
	                yyleng = lexer.yyleng;
	                yytext = lexer.yytext;
	                yylineno = lexer.yylineno;
	                yyloc = lexer.yylloc;
	                symbol = lex();
	            }

	            // try to recover from error
	            if (error_rule_depth === false) {
	                throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
	            }
	            popStack(error_rule_depth);

	            preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
	            symbol = TERROR;         // insert generic error symbol as new lookahead
	            state = stack[stack.length-1];
	            action = table[state] && table[state][TERROR];
	            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
	        }

	        // this shouldn't happen, unless resolve defaults are off
	        if (action[0] instanceof Array && action.length > 1) {
	            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
	        }

	        switch (action[0]) {
	            case 1: // shift
	                //this.shiftCount++;

	                stack.push(symbol);
	                vstack.push(lexer.yytext);
	                lstack.push(lexer.yylloc);
	                stack.push(action[1]); // push state
	                symbol = null;
	                if (!preErrorSymbol) { // normal execution/no error
	                    yyleng = lexer.yyleng;
	                    yytext = lexer.yytext;
	                    yylineno = lexer.yylineno;
	                    yyloc = lexer.yylloc;
	                    if (recovering > 0) {
	                        recovering--;
	                    }
	                } else {
	                    // error just occurred, resume old lookahead f/ before error
	                    symbol = preErrorSymbol;
	                    preErrorSymbol = null;
	                }
	                break;

	            case 2:
	                // reduce
	                //this.reductionCount++;

	                len = this.productions_[action[1]][1];

	                // perform semantic action
	                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
	                // default location, uses first token for firsts, last for lasts
	                yyval._$ = {
	                    first_line: lstack[lstack.length-(len||1)].first_line,
	                    last_line: lstack[lstack.length-1].last_line,
	                    first_column: lstack[lstack.length-(len||1)].first_column,
	                    last_column: lstack[lstack.length-1].last_column
	                };
	                if (ranges) {
	                  yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];
	                }
	                r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));

	                if (typeof r !== 'undefined') {
	                    return r;
	                }

	                // pop off stack
	                if (len) {
	                    stack = stack.slice(0,-1*len*2);
	                    vstack = vstack.slice(0, -1*len);
	                    lstack = lstack.slice(0, -1*len);
	                }

	                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
	                vstack.push(yyval.$);
	                lstack.push(yyval._$);
	                // goto new state = table[STATE][NONTERMINAL]
	                newState = table[stack[stack.length-2]][stack[stack.length-1]];
	                stack.push(newState);
	                break;

	            case 3:
	                // accept
	                return true;
	        }

	    }

	    return true;
	}};


	function parseNumericLiteral(literal) {
		if (literal.charAt(0) === "0") {
			if (literal.charAt(1).toLowerCase() === "x") {
				return parseInt(literal, 16);
			} else {
				return parseInt(literal, 8);
			}
		} else {
			return Number(literal);
		}
	}

	parser.parseError = function(str, hash) {
	//		alert(JSON.stringify(hash) + "\n\n\n" + parser.newLine + "\n" + parser.wasNewLine + "\n\n" + hash.expected.indexOf("';'"));
		if (!((hash.expected && hash.expected.indexOf("';'") >= 0) && (hash.token === "}" || hash.token === "EOF" || hash.token === "BR++" || hash.token === "BR--" || parser.newLine || parser.wasNewLine))) {
			throw new SyntaxError(str);
		}
	};
	/* End Parser Customization Methods */

	/* Begin AST Node Constructors */
	function EmptyStatementNode(statement) {
	}

	function ExpressionStatementNode(expression) {
		return expression;
	}

	function LabeledStatementNode(label, body) {
		return label + ':' + body;
	}

	function ThisExpressionNode() {
		return 'this';
	}

	function ArrayExpressionNode(elements) {
	    return '[' + elements + ']';
	}

	function ObjectExpressionNode(properties) {
		return '{' + properties + '}';
	}

	function SequenceExpressionNode(expressions) {
		this.type = "SequenceExpression";
		this.expressions = expressions;
	}

	function UnaryExpressionNode(operator, prefix, argument) {
		return operator + argument;
	}

	function BinaryExpressionNode(operator, left, right) {
		return left + operator + right;
	}

	function UpdateExpressionNode(operator, argument, prefix) {
	    if (prefix) {
	        return operator + argument;
	    }
		return argument + operator;
	}

	function LogicalExpressionNode(operator, left, right) {
		return left + operator + right;
	}

	function ConditionalExpressionNode(test, consequent, alternate) {
	    if (alternate === undefined) {
	        return test + '?' + consequent + ':' + undefined;
	    }
		return test + '?' + consequent + ':' + alternate;
	}

	function CallExpressionNode(callee, args) {
		return callee + '(' + args + ')';
	}

	function MemberExpressionNode(object, property, computed) {
		if (computed) {
		    return '((' + object + ' && typeof ' + object + '.get === "function" && typeof ' + object + '.set === "function") ? ' +  object + '.get(' + property + ') : ' + object + '[' + property + '])';
		}
		return '((' + object + ' && typeof ' + object + '.get === "function" && typeof ' + object + '.set === "function") ? ' + object + '.get("' + property + '") : ' +  object + '.' + property + ')';
	}

	function DecoratorChainCallNode(identifier, argumentsDecorator) {
	    if (argumentsDecorator === undefined) {
	        return function DecoratorChainCallNodeUser(__context) { return 'decorators.' + identifier + '(' + __context + ')'; };
	    }
	    return function DecoratorChainCallNodeUser(__context) { return 'decorators.' + identifier + '(' + __context + ',' + argumentsDecorator + ')'; };
	}

	function DecoratorChainContext(fn, entity) {
	    return function DecoratorChainContextCreator(__context) { return fn(entity !== undefined ? entity(__context) : __context); };
	}

	function DecoratorCallNode(decorator, caller) {
	    return decorator(caller);
	}

	function IdentifierNode(name) {
		return name;
	}

	function LiteralNode(value) {
		return value;
	}
	/* End AST Node Constructors *//* generated by jison-lex 0.3.4 */
	var lexer = (function(){
	var lexer = ({

	EOF:1,

	parseError:function parseError(str, hash) {
	        if (this.yy.parser) {
	            this.yy.parser.parseError(str, hash);
	        } else {
	            throw new Error(str);
	        }
	    },

	// resets the lexer, sets new input
	setInput:function (input, yy) {
	        this.yy = yy || this.yy || {};
	        this._input = input;
	        this._more = this._backtrack = this.done = false;
	        this.yylineno = this.yyleng = 0;
	        this.yytext = this.matched = this.match = '';
	        this.conditionStack = ['INITIAL'];
	        this.yylloc = {
	            first_line: 1,
	            first_column: 0,
	            last_line: 1,
	            last_column: 0
	        };
	        if (this.options.ranges) {
	            this.yylloc.range = [0,0];
	        }
	        this.offset = 0;
	        return this;
	    },

	// consumes and returns one char from the input
	input:function () {
	        var ch = this._input[0];
	        this.yytext += ch;
	        this.yyleng++;
	        this.offset++;
	        this.match += ch;
	        this.matched += ch;
	        var lines = ch.match(/(?:\r\n?|\n).*/g);
	        if (lines) {
	            this.yylineno++;
	            this.yylloc.last_line++;
	        } else {
	            this.yylloc.last_column++;
	        }
	        if (this.options.ranges) {
	            this.yylloc.range[1]++;
	        }

	        this._input = this._input.slice(1);
	        return ch;
	    },

	// unshifts one char (or a string) into the input
	unput:function (ch) {
	        var len = ch.length;
	        var lines = ch.split(/(?:\r\n?|\n)/g);

	        this._input = ch + this._input;
	        this.yytext = this.yytext.substr(0, this.yytext.length - len);
	        //this.yyleng -= len;
	        this.offset -= len;
	        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
	        this.match = this.match.substr(0, this.match.length - 1);
	        this.matched = this.matched.substr(0, this.matched.length - 1);

	        if (lines.length - 1) {
	            this.yylineno -= lines.length - 1;
	        }
	        var r = this.yylloc.range;

	        this.yylloc = {
	            first_line: this.yylloc.first_line,
	            last_line: this.yylineno + 1,
	            first_column: this.yylloc.first_column,
	            last_column: lines ?
	                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
	                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
	              this.yylloc.first_column - len
	        };

	        if (this.options.ranges) {
	            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
	        }
	        this.yyleng = this.yytext.length;
	        return this;
	    },

	// When called from action, caches matched text and appends it on next action
	more:function () {
	        this._more = true;
	        return this;
	    },

	// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
	reject:function () {
	        if (this.options.backtrack_lexer) {
	            this._backtrack = true;
	        } else {
	            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
	                text: "",
	                token: null,
	                line: this.yylineno
	            });

	        }
	        return this;
	    },

	// retain first n characters of the match
	less:function (n) {
	        this.unput(this.match.slice(n));
	    },

	// displays already matched input, i.e. for error messages
	pastInput:function () {
	        var past = this.matched.substr(0, this.matched.length - this.match.length);
	        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
	    },

	// displays upcoming input, i.e. for error messages
	upcomingInput:function () {
	        var next = this.match;
	        if (next.length < 20) {
	            next += this._input.substr(0, 20-next.length);
	        }
	        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
	    },

	// displays the character position where the lexing error occurred, i.e. for error messages
	showPosition:function () {
	        var pre = this.pastInput();
	        var c = new Array(pre.length + 1).join("-");
	        return pre + this.upcomingInput() + "\n" + c + "^";
	    },

	// test the lexed token: return FALSE when not a match, otherwise return token
	test_match:function (match, indexed_rule) {
	        var token,
	            lines,
	            backup;

	        if (this.options.backtrack_lexer) {
	            // save context
	            backup = {
	                yylineno: this.yylineno,
	                yylloc: {
	                    first_line: this.yylloc.first_line,
	                    last_line: this.last_line,
	                    first_column: this.yylloc.first_column,
	                    last_column: this.yylloc.last_column
	                },
	                yytext: this.yytext,
	                match: this.match,
	                matches: this.matches,
	                matched: this.matched,
	                yyleng: this.yyleng,
	                offset: this.offset,
	                _more: this._more,
	                _input: this._input,
	                yy: this.yy,
	                conditionStack: this.conditionStack.slice(0),
	                done: this.done
	            };
	            if (this.options.ranges) {
	                backup.yylloc.range = this.yylloc.range.slice(0);
	            }
	        }

	        lines = match[0].match(/(?:\r\n?|\n).*/g);
	        if (lines) {
	            this.yylineno += lines.length;
	        }
	        this.yylloc = {
	            first_line: this.yylloc.last_line,
	            last_line: this.yylineno + 1,
	            first_column: this.yylloc.last_column,
	            last_column: lines ?
	                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
	                         this.yylloc.last_column + match[0].length
	        };
	        this.yytext += match[0];
	        this.match += match[0];
	        this.matches = match;
	        this.yyleng = this.yytext.length;
	        if (this.options.ranges) {
	            this.yylloc.range = [this.offset, this.offset += this.yyleng];
	        }
	        this._more = false;
	        this._backtrack = false;
	        this._input = this._input.slice(match[0].length);
	        this.matched += match[0];
	        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
	        if (this.done && this._input) {
	            this.done = false;
	        }
	        if (token) {
	            return token;
	        } else if (this._backtrack) {
	            // recover context
	            for (var k in backup) {
	                this[k] = backup[k];
	            }
	            return false; // rule action called reject() implying the next rule should be tested instead.
	        }
	        return false;
	    },

	// return next match in input
	next:function () {
	        if (this.done) {
	            return this.EOF;
	        }
	        if (!this._input) {
	            this.done = true;
	        }

	        var token,
	            match,
	            tempMatch,
	            index;
	        if (!this._more) {
	            this.yytext = '';
	            this.match = '';
	        }
	        var rules = this._currentRules();
	        for (var i = 0; i < rules.length; i++) {
	            tempMatch = this._input.match(this.rules[rules[i]]);
	            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
	                match = tempMatch;
	                index = i;
	                if (this.options.backtrack_lexer) {
	                    token = this.test_match(tempMatch, rules[i]);
	                    if (token !== false) {
	                        return token;
	                    } else if (this._backtrack) {
	                        match = false;
	                        continue; // rule action called reject() implying a rule MISmatch.
	                    } else {
	                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
	                        return false;
	                    }
	                } else if (!this.options.flex) {
	                    break;
	                }
	            }
	        }
	        if (match) {
	            token = this.test_match(match, rules[index]);
	            if (token !== false) {
	                return token;
	            }
	            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
	            return false;
	        }
	        if (this._input === "") {
	            return this.EOF;
	        } else {
	            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
	                text: "",
	                token: null,
	                line: this.yylineno
	            });
	        }
	    },

	// return next match that has a token
	lex:function lex() {
	        var r = this.next();
	        if (r) {
	            return r;
	        } else {
	            return this.lex();
	        }
	    },

	// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
	begin:function begin(condition) {
	        this.conditionStack.push(condition);
	    },

	// pop the previously active lexer condition state off the condition stack
	popState:function popState() {
	        var n = this.conditionStack.length - 1;
	        if (n > 0) {
	            return this.conditionStack.pop();
	        } else {
	            return this.conditionStack[0];
	        }
	    },

	// produce the lexer rule set which is active for the currently active lexer condition state
	_currentRules:function _currentRules() {
	        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
	            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
	        } else {
	            return this.conditions["INITIAL"].rules;
	        }
	    },

	// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
	topState:function topState(n) {
	        n = this.conditionStack.length - 1 - Math.abs(n || 0);
	        if (n >= 0) {
	            return this.conditionStack[n];
	        } else {
	            return "INITIAL";
	        }
	    },

	// alias for begin(condition)
	pushState:function pushState(condition) {
	        this.begin(condition);
	    },

	// return the number of states currently on the stack
	stateStackSize:function stateStackSize() {
	        return this.conditionStack.length;
	    },
	options: {},
	performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
	var YYSTATE=YY_START;
	switch($avoiding_name_collisions) {
	case 0:parser.restricted = false; return "STRING_LITERAL";
	break;
	case 1:parser.restricted = false; return "THIS";
	break;
	case 2:parser.restricted = false; return "TRUE";
	break;
	case 3:parser.restricted = false; return "FALSE";
	break;
	case 4:parser.restricted = false; return "NULL";
	break;
	case 5:parser.restricted = false; return "ROOT";
	break;
	case 6:parser.restricted = false; return "IDENTIFIER";
	break;
	case 7:parser.restricted = false; return "NUMERIC_LITERAL";
	break;
	case 8:parser.restricted = false; return "NUMERIC_LITERAL";
	break;
	case 9:parser.restricted = false; return "NUMERIC_LITERAL";
	break;
	case 10:parser.restricted = false; return "{";
	break;
	case 11:/* skip whitespace */
	break;
	case 12:return "}";
	break;
	case 13:parser.restricted = false; return "(";
	break;
	case 14:return ")";
	break;
	case 15:parser.restricted = false; return "[";
	break;
	case 16:return "]";
	break;
	case 17:return ".";
	break;
	case 18:parser.restricted = false; return ";";
	break;
	case 19:return ",";
	break;
	case 20:return "?";
	break;
	case 21:return ":";
	break;
	case 22:return "===";
	break;
	case 23:return "==";
	break;
	case 24:return "!==";
	break;
	case 25:return "!=";
	break;
	case 26:parser.restricted = false; return "!";
	break;
	case 27:return "||";
	break;
	case 28:return "|";
	break;
	case 29:return "<=";
	break;
	case 30:return "<";
	break;
	case 31:return ">=";
	break;
	case 32:return ">";
	break;
	case 33:parser.restricted = false; return "++";
	break;
	case 34:return "+";
	break;
	case 35:parser.restricted = false; return "--";
	break;
	case 36:return "-";
	break;
	case 37:return "*";
	break;
	case 38:return "/";
	break;
	case 39:return "%";
	break;
	case 40:return "&&";
	break;
	case 41:return "EOF";
	break;
	case 42:return "ERROR";
	break;
	}
	},
	rules: [/^(?:(("(([^\"\\\n\r]+)|(\\((([\'\"\\bfnrtv])|([^\'\"\\bfnrtv0-9xu]))|((?:[1-7][0-7]{0,2}|[0-7]{2,3}))|([x]([0-9a-fA-F]){2})|([u]([0-9a-fA-F]){4})))|(\\(\r\n|\r|\n)))*")|('(([^\'\\\n\r]+)|(\\((([\'\"\\bfnrtv])|([^\'\"\\bfnrtv0-9xu]))|((?:[1-7][0-7]{0,2}|[0-7]{2,3}))|([x]([0-9a-fA-F]){2})|([u]([0-9a-fA-F]){4})))|(\\(\r\n|\r|\n)))*')))/,/^(?:this\b)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:null\b)/,/^(?:__root\b)/,/^(?:((([\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc])|[$_a-zA-Z]|(\\[u]([0-9a-fA-F]){4}))((([\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc])|[$_a-zA-Z]|(\\[u]([0-9a-fA-F]){4}))|([\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc0-9\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19d9\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1dc0-\u1de6\u1dfc-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f])|[0-9])*))/,/^(?:((([0]|(([1-9])([0-9]+)*))\.([0-9]+)*(([eE])([+-]?[0-9]+))?)|(\.([0-9]+)(([eE])([+-]?[0-9]+))?)|(([0]|(([1-9])([0-9]+)*))(([eE])([+-]?[0-9]+))?)))/,/^(?:([0][xX]([0-9a-fA-F])+))/,/^(?:([0]([0-7])+))/,/^(?:\{)/,/^(?:\s+)/,/^(?:\})/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:;)/,/^(?:,)/,/^(?:\?)/,/^(?::)/,/^(?:===)/,/^(?:==)/,/^(?:!==)/,/^(?:!=)/,/^(?:!)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:<=)/,/^(?:<)/,/^(?:>=)/,/^(?:>)/,/^(?:\+\+)/,/^(?:\+)/,/^(?:--)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:&&)/,/^(?:$)/,/^(?:.)/],
	conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42],"inclusive":true}}
	});
	/* Begin Lexer Customization Methods */
	var _originalLexMethod = lexer.lex;

	lexer.lex = function() {
		parser.wasNewLine = parser.newLine;
		parser.newLine = false;

		return _originalLexMethod.call(this);
	};
	/* End Lexer Customization Methods */;
	return lexer;
	})();
	parser.lexer = lexer;
	function Parser () {
	  this.yy = {};
	}
	Parser.prototype = parser;parser.Parser = Parser;
	return new Parser;
	})();

	module.exports = parser;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3);
	function embraceChain(array, ev) {
	   if (array) {
	      array.push(ev);
	      return array;
	   }
	   return [ev];
	}
	function createEv(type, fArgs, name) {
	   return {
	      type: type,
	      args: fArgs,
	      name: name
	   };
	}
	var slice = Array.prototype.slice;

	module.exports = {
	   ucFirst: function ucFirst(string) {
	      return string.replace(/^\w/, function (match) {
	         return match.toUpperCase();
	      });
	   },
	   toUpperCase: function toUpperCase(string) {
	      return string.toUpperCase();
	   },
	   toString: function toString(entity) {
	      return entity.toString();
	   },
	   split: function split(string, delimeter) {
	      return string.split(delimeter);
	   },
	   strftime: function strftime(time, type) {
	      if (time) {
	         return time.strftime(type);
	      }
	   },
	   trim: function trim(string) {
	      return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	   },
	   parseInt: function trim(entity, count) {
	      return parseInt(entity, count);
	   },
	   substr: function substr(string, start, length) {
	      return string.substr(start, length);
	   },
	   replace: function replace(string, pattern, newPattern) {
	      return string.replace(pattern, newPattern);
	   },
	   removeParentheses: function removeParentheses(string) {
	      return string.replace(/[()]/g, '');
	   },
	   command: function command(array, name) {
	      return embraceChain(array, createEv("command", slice.call(arguments, 2), name));
	   },
	   preventDefault: function preventDefault(array) {
	      return embraceChain(array, createEv("preventDefault"));
	   },
	   stopPropagation: function stopPropagation(array) {
	      return embraceChain(array, createEv("stopPropagation"));
	   },
	   method: function method(array, name) {
	      return embraceChain(array, createEv("method", slice.call(arguments, 2), name));
	   }
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = function checkType(value) {

	   var type = function checkTypeInside(o) {

	      if (o === null) {
	         return 'null';
	      }

	      if (o && (o.nodeType === 1 || o.nodeType === 9)) {
	         return 'element';
	      }

	      var s = Object.prototype.toString.call(o);
	      var type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

	      if (type === 'number') {
	         if (isNaN(o)) {
	            return 'nan';
	         }
	         if (!isFinite(o)) {
	            return 'infinity';
	         }
	      }

	      return type;
	   };

	   var types = [
	      'Null',
	      'Undefined',
	      'Object',
	      'Array',
	      'String',
	      'Number',
	      'Boolean',
	      'Function',
	      'RegExp',
	      'Element',
	      'NaN',
	      'Infinite'
	   ];

	   var generateMethod = function(t) {
	      type['is' + t] = function(o) {
	         return type(o) === t.toLowerCase();
	      };
	   };

	   for (var i = 0; i < types.length; i++) {
	      generateMethod(types[i]);
	   }

	   return type(value);

	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var jsResolver = __webpack_require__(22),
	   utils = __webpack_require__(3),
	   challenge = __webpack_require__(26),
	   decorators = __webpack_require__(23);
	module.exports = {
	   module: function ifModule(tag, data) {
	      function resolveStatement(source) {
	         var res = jsResolver.parse(source.value)(data, decorators), processed, clonedData;
	         if (source.fromAttr) {
	            clonedData = utils.clone(tag.attribs.if.data[0]);
	            clonedData.value = res;
	            tag.attribs.if = undefined;
	            if (res) {
	               processed = this._process([tag], data);
	               tag.attribs.if = { data: [clonedData] };
	               return processed;
	            }
	            tag.attribs.if = { data: [clonedData] };
	         } else {
	            tag.attribs.data.data[0].value = res;
	            if (res) {
	               if (tag.children !== undefined) {
	                  return this._process(tag.children, data);
	               }
	            }
	         }
	         return;
	      }
	      return function ifModuleReturnable() {
	         if (tag.children !== undefined) {
	            return resolveStatement.call(this, challenge(tag, 'if'));
	         }
	      };
	   }
	};


/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = function challenge(tag, property, isText) {
	   var source;
	   try {
	      if (tag.attribs.hasOwnProperty(property)) {
	         source = {
	            fromAttr: true,
	            value: isText ? tag.attribs[property].data.value.trim() : tag.attribs[property].data[0].name.trim()
	         };
	      } else {
	         source = {
	            fromAttr: false,
	            value: isText ? tag.attribs.data.data.value.trim() : tag.attribs.data.data[0].name.trim()
	         };
	      }
	   } catch (err) {
	      throw new Error('There is no data for "' + property + '" module to use');
	   }
	   return source;
	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var checkStatements = __webpack_require__(28),
	   whatType = __webpack_require__(24),
	   challenge = __webpack_require__(26),
	   utils = __webpack_require__(3);
	module.exports = {
	   module: function forModule(tag, data) {
	      var
	         source,
	         types = {
	            'array': fArray,
	            'object': fObject
	         },
	         concreteSourceStrings = {
	            splittingKey: ' in ',
	            key: ' as '
	         },
	         forStampArguments,
	         firstArgument,
	         statelessTag,
	         mainData;
	      source = challenge(tag, 'for', true);
	      forStampArguments = source.value.split(concreteSourceStrings.splittingKey);

	      if (forStampArguments.length < 2) {
	         throw new Error('Wrong arguments in for statement');
	      }
	      mainData = checkStatements(forStampArguments[1], data, [forStampArguments[1]]);

	      if (!mainData.value) {
	         throw new Error(mainData.name + ' variable is undefined');
	      }

	      firstArgument = forFindAllArguments(forStampArguments[0]);
	      statelessTag = { attribs: tag.attribs, children: tag.children, name: tag.name, raw: tag.raw, type: tag.type };
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
	         if (utils.isWsIncluded() && ($ws.helpers.instanceOfModule(object, 'SBIS3.CONTROLS.Record') || $ws.helpers.instanceOfModule(object, 'SBIS3.CONTROLS.DataSet'))) {
	            data[firstArgument.value] = object;
	         } else {
	            data[firstArgument.value] = object[key];
	         }
	         if (firstArgument.key) {
	            data[firstArgument.key] = key;
	         }
	         return data;
	      }

	      function cleanData(firstArgument) {
	         data[firstArgument.value] = undefined;
	         if (firstArgument.key) {
	            data[firstArgument.key] = undefined;
	         }
	         return data;
	      }

	      function fDataSet(dataset, data) {
	         var children = [], i = 0;
	         dataset.each(function fDataSetCallBack(entity) {
	            children.push(this._process(utils.clone((source.fromAttr ? [statelessTag] : statelessTag.children)), scrapeChildren(entity, data, i++, firstArgument)));
	         }.bind(this));
	         return children;
	      }

	      function fArray(array, data) {
	         var children = [], i;
	         for (i = 0; i < array.length; i++) {
	            children.push(this._process(utils.clone((source.fromAttr ? [statelessTag] : statelessTag.children)), scrapeChildren(array, data, i, firstArgument)));
	         }
	         return children;
	      }

	      function fObject(object, data) {
	         var children = [], key;
	         for (key in object) {
	            if (object.hasOwnProperty(key)) {
	               children.push(this._process(utils.clone((source.fromAttr ? [statelessTag] : statelessTag.children)), scrapeChildren(object, data, key, firstArgument)));
	            }
	         }
	         return children;
	      }

	      function resolveStatement(dataToIterate) {
	         var scopeArray = dataToIterate.value,
	            type = whatType(scopeArray),
	            typeFunction,
	            result;

	         if (source.fromAttr) {
	            statelessTag.attribs.for = undefined;
	         }

	         if (type === 'object') {
	            if (utils.isWsIncluded()) {
	               $ws.helpers.instanceOfModule(scopeArray, 'SBIS3.CONTROLS.DataSet');
	               typeFunction = fDataSet;
	            } else {
	               typeFunction = types[type];
	            }
	         } else {
	            typeFunction = types[type];
	         }

	         if (typeFunction === undefined) {
	            throw new Error('Wrong type in for statement arguments');
	         }
	         result = typeFunction.call(this, scopeArray, data);
	         data = cleanData(firstArgument);
	         return result;
	      }

	      return function forModuleReturnable() {
	         if (tag.children !== undefined) {
	            return resolveStatement.call(this, mainData);
	         }
	      };
	   }
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	   jsResolver = __webpack_require__(22),
	   decorators = __webpack_require__(23);
	module.exports = function checkStatementForInners(value, scopeData, arrVars) {
	   var isVar = utils.inArray(arrVars, value);
	   /**
	    * Variable or node
	    * @param  {Boolean} isVar
	    * @param  {[type]}  value
	    * @param  {String}  name
	    * @return {Object}
	    */
	   function varOrNot(isVar, value, name) {
	      if (isVar) {
	         return {
	            isVar: isVar,
	            name: name,
	            value: value
	         };
	      }
	      return {
	         isVar: isVar,
	         value: value
	      };
	   }

	   if (isVar === true) {
	      return varOrNot(isVar, jsResolver.parse(value)(scopeData, decorators), value);
	   }

	   return varOrNot(isVar, value);
	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var jsResolver = __webpack_require__(22),
	   decorators = __webpack_require__(23);
	module.exports = {
	   module: function elseModule(tag, data) {
	      var source, elseSource, captureElse = false;
	      if (tag.prev === undefined || (tag.prev.name !== 'ws:if' && tag.prev.name !== 'ws:else')) {
	         throw new Error('There is no "if" for "else" module to use');
	      }
	      try {
	         source = tag.prev.attribs.data.data[0].value;
	      } catch (err) {
	         throw new Error('There is no data for "else" module to use');
	      }
	      if (tag.attribs !== undefined) {
	         try {
	            elseSource = jsResolver.parse(tag.attribs.data.data[0].name.trim())(data, decorators);
	            tag.attribs.data.data[0].value = elseSource;
	            captureElse = true;
	         } catch (err) {
	            throw new Error('There is no data for "else" module to use for excluding place "elseif"');
	         }
	      }
	      function resolveStatement() {
	         if (captureElse) {
	            if (!source) {
	               if (elseSource) {
	                  if (tag.children !== undefined) {
	                     return this._process(tag.children, data);
	                  }
	               }
	            }
	         } else {
	            if (!source) {
	               if (tag.children !== undefined) {
	                  return this._process(tag.children, data);
	               }
	            }
	         }
	         return;
	      }

	      return function elseModuleReturnable() {
	         if (tag.children !== undefined) {
	            return resolveStatement.call(this);
	         }
	      };
	   }
	};

/***/ }
/******/ ])
});
;