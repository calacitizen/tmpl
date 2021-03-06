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
	    processing = __webpack_require__(21);
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
	    State = __webpack_require__(7),
	    moduleC = __webpack_require__(10),
	    entityHelpers = __webpack_require__(6);
	module.exports = {
	    _modules: {
	        'ws:include': __webpack_require__(19),
	        'ws:template': __webpack_require__(20),
	        'ws:partial': __webpack_require__(11)
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
	     * Atribute traverse in order to find variables
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
	            return (data = this._replaceAndCreateStatements(data, arrOfVarsClean));
	        }
	        return (data = entityHelpers.createDataText(data[0]));
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
	    _collect: function collect(traverseMethod, value, prev, next) {
	        return traverseMethod.call(this, value, prev, next);
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
	                collect = this._collect(traverseMethod, ast[i], ast[i-1], ast[i+1]);
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
	    _traverseTag: function traverseTag(tag, prev, next) {
	        var state,
	            attribs = this._traverseTagAttributes(tag.attribs),
	            takeTag = this._acceptTag(tag, attribs, prev, next);
	        if (takeTag.children && takeTag.children.length > 0) {
	            return this.traverseTagWithChildren(takeTag);
	        }
	        state = State.make();
	        state.keep(this._generatorFunctionForTags(takeTag))
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
	            type: "tag",
	            prev: tag.prev,
	            next: tag.next
	        };
	    },
	    _acceptTag: function acceptTag(tag, attribs, prev, next) {
	        return this._createTag({
	            name: tag.name,
	            data: tag.data,
	            raw: tag.raw,
	            attribs: attribs,
	            children:
	                tag.children,
	            prev: prev,
	            next: next
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

		//Parses through HTML text and returns an array of found elements
		//I admit, this function is rather large but splitting up had an noticeable impact on speed
		Parser.prototype.parseTags = function Parser$parseTags () {
			var bufferEnd = this._buffer.length - 1;
			while (Parser._reTags.test(this._buffer)) {
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
	    mapForLoop: function mapForLoop(array, mapFunction) {
	        var arrayLen = array.length;
	        var newArray = new Array(arrayLen);
	        for (var i = 0; i < arrayLen; i++) {
	            newArray[i] = mapFunction(array[i], i, array);
	        }
	        return newArray;
	    },
	    eachObject: function eachObject(object, modifier) {
	        for (var value in object) {
	            if (object.hasOwnProperty(value)) {
	                object[value] = modifier(object[value]);
	            }
	        }
	        return object;
	    },
	    inArray: function inArray(array, needle) {
	        for (var i = 0; i < array.length; i++) {
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
	        if ( typeof target !== 'object' ) {
	            target = {};
	        }
	        for (var property in source) {
	            if ( source.hasOwnProperty(property) ) {
	                var sourceProperty = source[ property ];
	                if ( typeof sourceProperty === 'object' ) {
	                    target[ property ] = merge( target[ property ], sourceProperty );
	                    continue;
	                }
	                target[ property ] = sourceProperty;
	            }
	        }
	        for (var a = 2, l = arguments.length; a < l; a++) {
	            this.merge(target, arguments[a]);
	        }
	        return target;
	    }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	    conditionalResolver = __webpack_require__(5),
	    entityHelpers = __webpack_require__(6);
	module.exports = {
	    checkStatementForInners: function checkStatementForInners(value, arrVars) {
	        var
	            isUseful = utils.inArray(arrVars, value),
	            expressionObj;
	        if (isUseful === true) {
	            if (utils.isNumber(value)) {
	                return entityHelpers.createDataText(entityHelpers.createNumberFromString(value));
	            }
	            if (utils.isImplicitVar(value)) {
	                return entityHelpers.createDataVar(value, undefined);
	            }
	            expressionObj = conditionalResolver(value);
	            if (expressionObj.condition !== undefined) {
	                return entityHelpers.createDataExpression(expressionObj.condition, expressionObj.valOne, expressionObj.valTwo);
	            }
	            if (utils.isFunction(value)) {
	                return entityHelpers.createDataVar(value, undefined);
	            }
	            throw new Error('Wrong expression: ' + value);
	        }
	        return entityHelpers.createDataText(value);
	    }
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function conditionResolver(string) {
	    var stArr = string.split(''),
	        singleQuote = "'",
	        quote = '"',
	        colon = ":",
	        questionMark = '?',
	        boolArr = [],
	        everyObj = {},
	        qWas = false,
	        quoteWas = false,
	        length = stArr.length;

	    function joinArray(array) {
	        return array.splice(0, array.length).join('').trim();
	    }

	    function isQuote(string) {
	        return string === singleQuote || string === quote;
	    }

	    function isQuestionMark(string) {
	        return string === questionMark;
	    }

	    function isColon(string) {
	        return string === colon;
	    }

	    function isCondition(string) {
	        return isQuestionMark(string) && qWas === false && quoteWas === false;
	    }

	    function isFirstPartOfDeal(string) {
	        return isColon(string) && qWas === true;
	    }

	    function isLast(iterator, length) {
	        return (iterator + 1) === length && qWas === true;
	    }

	    function resolveValueOfConditional(object, array) {
	        if (object.valOne === undefined) {
	            object.valOne = joinArray(array);
	        } else {
	            object.valTwo = joinArray(array);
	        }
	        return object;
	    }

	    function switchTheQuote(quote) {
	        if (quote === false) {
	            return true;
	        }
	        return false;
	    }

	    for (var i = 0; i < length; i++) {
	        if (isQuote(stArr[i])) {
	            quoteWas = switchTheQuote(quoteWas);
	        }
	        if (isCondition(stArr[i])) {
	            everyObj.condition = joinArray(boolArr);
	            qWas = true;
	        }
	        else if (isFirstPartOfDeal(stArr[i])) {
	            everyObj.valOne = joinArray(boolArr);
	        }
	        else {
	            boolArr.push(stArr[i]);
	        }
	        if (isLast(i, length)) {
	            everyObj = resolveValueOfConditional(everyObj, boolArr);
	        }
	    }
	    return everyObj;
	};

/***/ },
/* 6 */
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {var State = (function StateFunction() {
	    'use strict';

	    if (typeof setImmediate !== 'function') {
	        setImmediate = function setImmediate(func, fate) {
	            'use strict';
	            return setTimeout(function setTimeoutHandle() {
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8).setImmediate))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(9).nextTick;
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8).setImmediate, __webpack_require__(8).clearImmediate))

/***/ },
/* 9 */
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	    partial = __webpack_require__(11),
	    straightFromFile = __webpack_require__(17);
	module.exports = {
	    parse: function modulePars(tag) {
	        var name = utils.splitWs(tag.name.trim());
	        function resolveStatement() {
	            var moduleFunction;
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var State = __webpack_require__(7),
	    utils = __webpack_require__(3),
	    injectedDataForce = __webpack_require__(12);
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
	        function resolveTemplate(tag, state, tagData, template) {
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
	                attribs = this._traverseTagAttributes(tag.attribs),
	                template;
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
	            var scope = {},
	                rootVar = '__root';
	            scope = injectedDataForce.call(this, { children: tag.injectedData, attribs: tag.attribs }, data);
	            scope[rootVar] = scope;
	            return scope;
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function injectedDataForce(data, scopeData) {
	    var types = {
	            string: __webpack_require__(13),
	            array: __webpack_require__(14),
	            object: __webpack_require__(15),
	            number: __webpack_require__(16)
	        };
	    return types.object.call(this, types, data, scopeData);
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = function stringTag(types, tag, scopeData) {
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3);
	module.exports = function arrayTag(types, tag, scopeData) {
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
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	    entityHelpers = __webpack_require__(6);
	module.exports = function objectTag(types, injected, scopeData) {
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
	                    return typeFunction.call(this, types, injected[i], scopeData);
	                }
	                tObject[nameExists] = objectTag.call(this, types, injected[i].children, scopeData);
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var entityHelpers = __webpack_require__(6);
	module.exports = function stringTag(types, tag, scopeData) {
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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var State = __webpack_require__(7),
	    requireFile = __webpack_require__(18);
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
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;var utils = __webpack_require__(3),
	    State = __webpack_require__(7);

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
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var straightFromFile = __webpack_require__(17),
	    entityHelpers = __webpack_require__(6),
	    State = __webpack_require__(7);
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
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var State = __webpack_require__(7),
	    entityHelpers = __webpack_require__(6);
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
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	    seekingForVars = __webpack_require__(22),
	    whatType = __webpack_require__(27),
	    moduleC = __webpack_require__(10),
	    entityHelpers = __webpack_require__(6);
	module.exports = {
	    _modules: {
	        'if': __webpack_require__(28),
	        'for': __webpack_require__(29),
	        'else': __webpack_require__(30),
	        'partial': __webpack_require__(11),
	        'include': __webpack_require__(19),
	        'template': __webpack_require__(20)
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
	            for (var attrib in attribs) {
	                if (attribs.hasOwnProperty(attrib)) {
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
	     * @param  {Array} ast  AS T array
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
	    }
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var conditional = __webpack_require__(23),
	    utils = __webpack_require__(3),
	    entityHelpers = __webpack_require__(6),
	    resolveVariables = __webpack_require__(26);
	module.exports = function seekForVars(textData, scopeData) {

	    function expressionResolve(value, scopeData) {
	        if (value !== undefined) {
	            if (utils.isVar(value)) {
	                return resolveVariables(entityHelpers.createDataVar(value, undefined), scopeData);
	            }
	            return utils.removeAroundQuotes(value);
	        }
	        return;
	    }

	    function expression(textData) {
	        if (conditional(textData.expression, scopeData)) {
	            return expressionResolve(textData.valueOne, scopeData);
	        }
	        return expressionResolve(textData.valueTwo, scopeData);
	    }

	    if (textData.type === 'expression') {
	        return expression(textData);
	    }

	    if (textData.type === 'var') {
	        return resolveVariables(textData, scopeData);
	    }
	    return textData.value;
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var scopeHold = __webpack_require__(24),
	    utils = __webpack_require__(3);
	module.exports = function conditional(source, data) {
	    var
	        sourceStrings = {
	            operators: [{
	                name: ' lt ',
	                value: '<'
	            }, {
	                name: ' gt ',
	                value: '>'
	            }, {
	                name: ' le ',
	                value: '<='
	            }, {
	                name: ' ge ',
	                value: '>='
	            }]
	        },
	        reservedVarStrings = ["false", "true", "undefined", "null"],
	        source = replaceGreaterLess(source),
	        arrVars = lookUniqueVariables(source),
	        condition = readConditionalExpression(source, arrVars);

	    /**
	     * Replace greater and less for real directives
	     * @param  {String} source String with expression
	     * @return {String}        String with replaced directives
	     */
	    function replaceGreaterLess(source) {
	        var i;
	        for (i = 0; i < sourceStrings.operators.length; i++) {
	            source = source.replace(sourceStrings.operators[i].name, sourceStrings.operators[i].value);
	        }
	        return source;
	    }

	    /**
	     * Looking up for unique variables in expression
	     * @param  {String} expression String with expression
	     * @return {Array}            Array with unqiue variables
	     */
	    function lookUniqueVariables(expression) {
	        var variables = expression.match(/([A-z0-9'"]+)/g),
	            length = variables.length,
	            uniqueVariables = [],
	            index = 0,
	            variable;
	        while (index < length) {
	            variable = variables[index++];
	            if (uniqueVariables.indexOf(variable) < 0 && !utils.inArray(reservedVarStrings, variable)) {
	                if (utils.isVar(variable)) {
	                    uniqueVariables.push(variable);
	                }
	            }
	        }
	        return uniqueVariables;
	    }

	    /**
	     * Reading conditional expression
	     * @param  {String} expression      String with expression
	     * @param  {Array} uniqueVariables  Array with unique variables
	     * @return {Function}                 Function with resulting expression
	     */
	    function readConditionalExpression(expression, uniqueVariables) {
	        return Function.apply(null, uniqueVariables.concat("return " + expression));
	    }

	    return condition.apply(this, scopeHold(arrVars, data));
	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var checkStatements = __webpack_require__(25);
	module.exports = function scopeHold(arrVars, scope) {
	  var ms = [],
	      stepVar;
	  for (var i = 0; i < arrVars.length; i++) {
	    if (scope.hasOwnProperty(arrVars[i])) {
	      stepVar = checkStatements(arrVars[i], scope, arrVars);
	      if (stepVar.isVar === true) {
	        ms.push(stepVar.value);
	      }
	    }
	  }
	  return ms;
	}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	    resolveVariables = __webpack_require__(26);
	module.exports = function checkStatementForInners(value, scopeData, arrVars) {
	    var isVar = utils.inArray(arrVars, value);

	    /**
	     * Crate type for empty data tag
	     * @param  {Boolean} isVar
	     * @return {String}
	     */
	    function restrictType(isVar) {
	        if (isVar) {
	            return "var";
	        }
	        return "text";
	    }

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
	        return varOrNot(isVar, resolveVariables({ type: restrictType(isVar), name: value, value: undefined }, scopeData), value);
	    }

	    return varOrNot(isVar, value);
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3);
	module.exports = function resolveVariables(textData, scopeData) {
	    /**
	     * If function call, prepare arguments
	     * @param  {String} args
	     * @return {Array}        Array with function arguments
	     */
	    function prepareFargs(args) {
	        var argsArr = args.split(',');
	        if (argsArr.length > 0) {
	            argsArr = utils.mapForLoop(argsArr, function trimming(val) {
	                val = val.trim();
	                if (utils.isVar(val)) {
	                    return variable({name: val});
	                }
	                return utils.removeAroundQuotes(val).trim();
	            });
	        }
	        return argsArr;
	    }

	    /**
	     * Function lookup in variableSeparator
	     * @param  {String} f         Function string
	     * @param  {Array} compress  Scope data
	     * @param  {Array} scopeData Original Scope data
	     * @param  {String} variable  Variable nam,e
	     * @param  {number} i         Iterator
	     * @return {Array}           Array with data
	     */
	    function fLookUp(f, compress, scopeData, i) {
	        var fName = f[0],
	            args = prepareFargs(f[1]);
	        if (scopeData.hasOwnProperty(fName) && i === 0) {
	            compress = scopeData[fName].apply(scopeData, args);
	        } else {
	            if (compress) {
	                compress = compress[fName].apply(compress, args);
	            }
	        }
	        return compress;
	    }

	    /**
	     * First variable lookup
	     * @param  {Array} compress  new generated Scope data
	     * @param  {Array} scopeData Scope data
	     * @param  {Array} stScope   Array from variable string
	     * @param  {number} i         Iterator
	     * @return {Array}
	     */
	    function compressLookUp(compress, scopeData, stScope, i) {
	        var f = utils.isFunction(stScope[i]);
	        if (f) {
	            compress = fLookUp(f, compress, scopeData, i);
	        } else {
	            if (i === 0) {
	                compress = scopeData[stScope[i]];
	            } else {
	                if (compress) {
	                    compress = compress[stScope[i]];
	                }
	            }
	        }
	        return compress;
	    }

	    /**
	     * Searching for variables in stScope
	     * @param  {Array} scopeData Scope data
	     * @param  {Array} stScope   Array from variable string
	     * @return {Array}
	     */
	    function searching(scopeData, stScope) {
	        var compress, i;
	        for (i = 0; i < stScope.length; i++) {
	            compress = compressLookUp(compress, scopeData, stScope, i);
	        }
	        return compress;
	    }

	    /**
	     * Resolve variable value
	     * @param  {Object} textData Object with AST-data
	     * @return {Object|String|Array|number}          variable value
	     */
	    function variable(textData) {
	        var stScope = utils.splitVarsAndFunctions(textData.name);
	        return searching(scopeData, stScope);
	    }

	    return variable(textData);
	}


/***/ },
/* 27 */
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
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var conditional = __webpack_require__(23);
	module.exports = {
	    module: function ifModule(tag, data) {
	        var source;
	        if (tag.attribs.data.data === undefined) {
	            throw new Error('There is no data for "if" module to use');
	        }
	        source =  tag.attribs.data.data.value.trim();
	        function resolveStatement() {
	            if (conditional(source, data)) {
	                if (tag.children !== undefined) {
	                    return this._process(tag.children, data);
	                }
	            }
	            return;
	        }
	        return function ifModuleReturnable() {
	            if (tag.children !== undefined) {
	                return resolveStatement.call(this);
	            }
	        };
	    }
	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var checkStatements = __webpack_require__(25),
	    whatType = __webpack_require__(27),
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
	            mainData;

	        if (tag.attribs.data.data === undefined) {
	            throw new Error('There is no data for "for" module to use');
	        }

	        source = tag.attribs.data.data.value.trim();
	        forStampArguments = source.split(concreteSourceStrings.splittingKey);

	        if (forStampArguments.length < 2) {
	            throw new Error('Wrong arguments in for statement');
	        }
	        mainData = checkStatements(forStampArguments[1], data, [forStampArguments[1]]);

	        if (!mainData.value) {
	            throw new Error(mainData.name + ' variable is undefined');
	        }

	        firstArgument = forFindAllArguments(forStampArguments[0]);

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
	            data[firstArgument.value] = object[key];
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

	        function fArray(array, data) {
	            var children = [];
	            for (var i = 0; i < array.length; i++) {
	                children.push(this._process(utils.clone(tag.children), scrapeChildren(array, data, i, firstArgument)));
	            }
	            return children;
	        }

	        function fObject(object, data) {
	            var children = [];
	            for (var key in object) {
	                if (object.hasOwnProperty(key)) {
	                    children.push(this._process(utils.clone(tag.children), scrapeChildren(object, data, key, firstArgument)));
	                }
	            }
	            return children;
	        }

	        function resolveStatement(dataToIterate) {
	            var scopeArray = dataToIterate.value,
	                typeFunction = types[whatType(scopeArray)],
	                result;
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
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var conditional = __webpack_require__(23);
	module.exports = {
	    module: function elseModule(tag, data) {
	        var source;

	        if (tag.prev === undefined || tag.prev.name !== 'ws:if') {
	            throw new Error('There is no "if" for "else" module to use');
	        }

	        source =  tag.prev.attribs.data.trim();

	        function resolveStatement() {
	            if (!conditional(source, data)) {
	                if (tag.children !== undefined) {
	                    return this._process(tag.children, data);
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