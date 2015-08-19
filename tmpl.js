(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
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

	var Traverse = __webpack_require__(1),
	    functionalStrategy = __webpack_require__(15);
	module.exports = {
	  parse: Traverse.parse,
	  traverse: function traverse(ast, data) {
	    return {
	      handle: function (success, broke) {
	        Traverse.traverse(ast, data).when(success, broke);
	      }
	    }
	  },
	  getHTML: functionalStrategy
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var
	  htmlparser = __webpack_require__(2),
	  utils = __webpack_require__(3),
	  scopeUtils = __webpack_require__(4),
	  State = __webpack_require__(5);
	module.exports = {
	  _astTypes: ['tag', 'text', 'directive', 'comment', 'style', 'script'],
	  _modules: {
	    'if': __webpack_require__(8),
	    'for': __webpack_require__(12),
	    'include': __webpack_require__(13),
	    'partial': __webpack_require__(14)
	  },
	  _regex: {
	    forVariables: /\{\{ ?(.*?) ?\}\}/g
	  },
	  safeReplaceCaseReg: /\r|\n|\t|\/\*[\s\S]*?\*\//g,
	  safeReplaceCasePlace: "",
	  _includeStack: {},
	  _tagStack: [],
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
	  _replaceAndCreateStatements: function replaceAndCreateStatements(data, scopeData, arrOfVars) {
	    return utils.mapForLoop(data, function searchInScope(value) {
	      ssCheck = scopeUtils.checkStatementForInners(value, scopeData, arrOfVars);
	      if (ssCheck.isVar) {
	        return this._createDataVar(value, ssCheck.value);
	      }
	      return this._createDataText(value);
	    }.bind(this));
	  },
	  /**
	   * Preparing string for structured tree
	   */
	  _replaceMatch: function replaceMatch(str, scopeData) {
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
	      resultingObject.data = this._replaceAndCreateStatements(resultingObject.data, scopeData, arrOfVarsClean);
	    } else {
	      resultingObject.data = this._createDataText(resultingObject.data[0]);
	    }
	    return resultingObject;
	  },
	  /**
	   * Looking for variables in strings
	   */
	  _lookForStatements: function lookForStatements(statement, scopeData) {
	    return this._replaceMatch(statement, scopeData);
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
	  _collect: function collect(traverseMethod, value, scopeData) {
	    var ps = traverseMethod.call(this, value, scopeData);
	    if (this.isTagInclude(value.name)) {
	      this._includeStack[value.attribs.name] = ps;
	    } else {
	      return ps;
	    }
	  },
	  /**
	   * Recursive traverse method
	   */
	  traversingAST: function traversingAST(ast, scopeData) {
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
	  traverse: function (ast, data, config) {
	    return this.traversingAST(ast, data).when(
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
	  },
	  /**
	   * Text node traversing
	   */
	  _traverseText: function traverseText(text, scopeData) {
	    var text = utils.clone(text),
	      state = State.make();
	    if (text.hasOwnProperty('type')) {
	      state.keep(this._lookForStatements(text, scopeData));
	      return state.promise;
	    }
	    return this._lookForStatements(text, scopeData);
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
	    for (value in object) {
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
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3);
	module.exports = {
	  checkStatementForInners: function checkStatementForInners(value, scopeData, arrVars) {
	    var
	      variableSeparator = '.',
	      stScope = value.split(variableSeparator),
	      isVar = utils.inArray(arrVars, value),
	      compress;

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

	    if (stScope.length > 1) {
	      for (var i = 0; i < stScope.length; i++) {
	        if (scopeData.hasOwnProperty(stScope[i]) && i === 0) {
	          compress = scopeData[stScope[i]];
	        } else {
	          if (compress && compress.hasOwnProperty(stScope[i])) {
	            compress = compress[stScope[i]];
	          }
	        }
	      }
	      return varOrNot(isVar, compress, value);
	    }

	    if (isVar === true) {
	      return varOrNot(isVar, scopeData[value], value);
	    }

	    return varOrNot(isVar, value);
	  }
	}


/***/ },
/* 5 */
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
	          try {
	            var result = func(value);
	            if (result && result.is_promise === true) {
	              result.when(state.keep, state.break);
	            } else {
	              state.keep(result);
	            }
	          } catch (e) {
	            state.break(e);
	          }
	        };
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).setImmediate))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(7).nextTick;
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).setImmediate, __webpack_require__(6).clearImmediate))

/***/ },
/* 7 */
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var checkSource = __webpack_require__(9),
	  scopeHold = __webpack_require__(11),
	  State = __webpack_require__(5);
	module.exports = {
	  module: function ifModule(tag, data) {
	    var
	      concreteSourceStrings = {
	        operators: [{ name: ' lt ', value: '<' }, { name: ' gt ', value: '>' }, { name: ' le ', value: '<=' }, { name: ' ge ',  value: '>=' }]
	      },
	      source = replaceGreaterLess(tag.attribs.data.trim()),
	      arrVars = lookUniqueVariables(source),
	      condition = readConditionalExpression(source, arrVars);

	    function replaceGreaterLess(source) {
	      for (var i = 0; i < concreteSourceStrings.operators.length; i++) {
	        source = source.replace(concreteSourceStrings.operators[i].name, concreteSourceStrings.operators[i].value);
	      }
	      return source;
	    }

	    function lookUniqueVariables(expression) {
	      var variables = expression.match(/([A-z]+)/g),
	        length = variables.length,
	        uniqueVariables = [],
	        index = 0;
	      while (index < length) {
	        var variable = variables[index++];
	        if (uniqueVariables.indexOf(variable) < 0) {
	          uniqueVariables.push(variable);
	        }
	      }
	      return uniqueVariables;
	    }

	    function readConditionalExpression(expression, uniqueVariables) {
	      return Function.apply(null, uniqueVariables.concat("return " + expression));
	    }

	    function resolveStatement(condition) {
	      var state = State.make();
	      if (condition) {
	        if (tag.children !== undefined) {
	          this.traversingAST(tag.children, data).when(function ifObjectTraverse(modAST) {
	            state.keep(modAST);
	          }, function brokenIf(reason) {
	            throw new Error(reason);
	          });
	        }
	      } else {
	        state.keep(undefined)
	      }
	      return state.promise;
	    }

	    return function ifModuleReturnable() {
	      if (tag.children !== undefined) {
	        return resolveStatement.call(this, condition.apply(this, scopeHold(arrVars, data)));
	      }
	    }
	  }
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var whatType = __webpack_require__(10);
	module.exports = function checkSource(variableString, scopeData) {
	  console.log(variableString);

	  var varianleSeparator = '.',
	      valueArray = variableString.split(varianleSeparator),
	      type;

	  function checkSourceIns(iterator, array, value) {
	     var type = whatType(value);
	     if (array.length > (iterator + 1) && type !== 'object') {
	       if (type !== 'array' && array[iterator+1] !== 'length') {
	         throw new Error('У значения ' + array[iterator] + ' нет свойства: ' + array[iterator + 1]);
	       }
	     }
	     return type;
	  }

	  for (var i = 0; i < valueArray.length; i++) {
	    if (i === 0) {
	      chase = scopeData[valueArray[i]];
	    } else {
	      chase = chase[valueArray[i]];
	    }
	    type = checkSourceIns(i, valueArray, chase);
	  }

	  return type;
	}


/***/ },
/* 10 */
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var scopeUtils = __webpack_require__(4);
	module.exports = function scopeHold(arrVars, scope) {
	  var ms = [],
	      variableSeparator = '.',
	      stepVar;
	  for (var i = 0; i < arrVars.length; i++) {
	    if (scope.hasOwnProperty(arrVars[i])) {
	      stepVar = scopeUtils.checkStatementForInners(arrVars[i], scope, arrVars);
	      if (stepVar.isVar === true) {
	        ms.push(stepVar.value);
	      }
	    }
	  }
	  return ms;
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var checkSource = __webpack_require__(9),
	  scopeUtils = __webpack_require__(4),
	  whatType = __webpack_require__(10),
	  utils = __webpack_require__(3),
	  State = __webpack_require__(5);
	module.exports = {
	  module: function forModule(tag, data) {
	    var
	      source = tag.attribs.data.trim(),
	      types = {
	        'array': fArray,
	        'object': fObject
	      },
	      concreteSourceStrings = {
	        splittingKey: ' in ',
	        key: ' as '
	      },
	      forStampArguments = source.split(concreteSourceStrings.splittingKey),
	      firstArgument,
	      mainData;

	    if (forStampArguments.length < 2) {
	      throw new Error('Wrong arguments in for statement');
	    }

	    mainData = scopeUtils.checkStatementForInners(forStampArguments[1], data, [forStampArguments[1]]);

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

	    function fArray(array, data) {
	      var children = [];
	      for (var i = 0; i < array.length; i++) {
	        children.push(this.traversingAST(utils.clone(tag.children), scrapeChildren(array, data, i, firstArgument)));
	      }
	      return State.every(children);
	    }

	    function fObject(object, data) {
	      var children = [];
	      for (var key in object) {
	        if (object.hasOwnProperty(key)) {
	          children.push(this.traversingAST(utils.clone(tag.children), scrapeChildren(object, data, key, firstArgument)));
	        }
	      }
	      return State.every(children);
	    }

	    function resolveStatement(dataToIterate) {
	      var scopeArray = dataToIterate.value,
	        scopeData = utils.clone(data),
	        typeFunction = types[whatType(scopeArray)],
	        ps;
	      if (typeFunction === undefined) {
	        throw new Error('Wrong type in for statement arguments');
	      }
	      ps = types[whatType(scopeArray)].call(this, scopeArray, scopeData);
	      ps.when(function resolveStatementFor(data) {
	        return this.actionOnMainArray([], data);
	      }.bind(this), function brokenFor(reason) {
	        throw new Error(reason);
	      });
	      return ps;
	    }

	    return function forModuleReturnable() {
	      if (tag.children !== undefined) {
	        return resolveStatement.call(this, mainData);
	      }
	    }
	  }
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;var State = __webpack_require__(5),
	    utils = __webpack_require__(3);
	module.exports = {
	  module: function requireOrRetire(tag, data, cb) {
	    var assignModuleVar = tag.attribs.name.trim(),
	      template = tag.attribs.template.trim(),
	      templatePath = template + '.tmpl',
	      templateBody, req, text, ast,
	      isNode = utils.isNode();

	      if (isNode === false) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function restrainFs() {
	          return {};
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	      }

	    function createRequest(url) {
	      var request = new XMLHttpRequest();
	      request.open('GET', url);
	      request.send();
	      return request;
	    }

	    function readFile(url) {
	      var fs,
	        state = State.make();
	      try {
	        fs = requirejs('fs');
	      } catch (e) {
	        throw new Error("There is no requirejs for node included");
	      }
	      fs.readFile('./' + url, function readFileCallback(err, data) {
	        if (err) {
	          state.break(err);
	        } else {
	          state.keep(this.parse(data));
	        }
	      }.bind(this));
	      return state.promise;
	    }

	    function workOutAsync(req) {
	      var state = State.make();
	      req.onreadystatechange = function requestHandler() {
	        if (req.readyState == 4 && req.status == 200) {
	          state.keep(this.parse(req.responseText));
	        }
	      }.bind(this);
	      return state.promise;
	    }

	    function resolveInclude(object) {
	      data[assignModuleVar] = object;
	      return data;
	    }

	    function resolveStatement() {
	      if (isNode === false) {
	        req = createRequest(templatePath);
	        return workOutAsync.call(this, req).when(resolveInclude);
	      }
	      return readFile.call(this, templatePath).when(resolveInclude);
	    }

	    return function includeResolve() {
	      return resolveStatement.call(this);
	    }
	  }
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var State = __webpack_require__(5),
	    utils = __webpack_require__(3);
	module.exports = {
	  module: function partialModule(tag, data) {
	    var assignModuleVar = tag.attribs.data.trim(),
	        template = tag.attribs.template.trim(),
	        rootVar = 'root',
	        scopeData = {};

	    function resolveStatement(data) {
	      var state = State.make(),
	          clonedData = utils.clone(data);
	      this._includeStack[template].when(
	        function partialInclude(templateData) {
	          if (templateData[template]) {
	            scopeData[rootVar] = clonedData[assignModuleVar];
	            this.traversingAST(templateData[template], scopeData).when(function partialTraversing(modAST) {
	              state.keep(modAST);
	            }, function brokenTraverse(reason) {
	              throw new Error(reason);
	            });
	          } else {
	            state.break('Include tag for "' + template + '" is not found!');
	          }
	        }.bind(this),
	        function brokenPartial(reason) {
	          throw new Error(reason);
	        }
	      );
	      return state.promise;
	    }

	    return function partialResolve() {
	      return resolveStatement.call(this, data);
	    }
	  }
	}


/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function universalHTMLGenerator(ast) {
	  var HTMLString = astSlice(ast);

	  function collectData(data) {
	    var dataString = '';
	    if (data !== undefined) {
	      if (data.type !== undefined) {
	        dataString += data.value;
	      } else {
	        for (var i = 0; i < data.length; i++) {
	          if (data[i].value !== undefined) {
	            dataString += data[i].value;
	          }
	        }
	      }
	    }
	    return dataString;
	  }

	  function generateAttributes(attribs) {
	    var attribsString = '';
	    if (attribs !== undefined) {
	      for (var value in attribs) {
	        if (attribs.hasOwnProperty(value)) {
	          attribsString = ' ' + value + '="' + collectData(attribs[value].data) + '"';
	        }
	      }
	    }
	    return attribsString;
	  }

	  function generateString(object) {
	    if (object.type === 'text') {
	      return collectData(object.data);
	    }
	    return '<' + object.name + generateAttributes(object.attribs) + '>' + astSlice(object.children) + '</' + object.name + '>';
	  }

	  function astSlice(ast) {
	    var string = '';
	    if (ast !== undefined) {
	      for (var i = 0; i < ast.length; i++) {
	        string += generateString(ast[i]);
	      }
	    }
	    return string;
	  }

	  return HTMLString;
	}


/***/ }
/******/ ])
});
;