/***********************************************
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

define('htmlparser', [],function () {

    function runningInNode () {
        return(
        (typeof require) == "function"
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

   return exports;

});

define("jison/htmlparser", function(){});

define('utils', [],function utilsLoader() {
   var utils = {
      reduceMap: function reduceMap(array, fn, bind, initial) {
         var len = array.length, i = 0;
         if (len == 0 && arguments.length == 1) return null;
         var result = initial || array[i];
         for (; i < len; i++) result = fn.call(bind, result, array[i], i, array);
         return result;
      },
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
   return utils;
});
define("helpers/utils", function(){});

define('skipVars', ['helpers/utils', 'helpers/entityHelpers'], function (utils, entityHelpers) {
   return {
      checkStatementForInners: function checkStatementForInners(value, arrVars) {
         var isUseful = utils.inArray(arrVars, value);
         if (isUseful === true) {
            return entityHelpers.createDataVar(value, undefined);
         }
         return entityHelpers.createDataText(value);
      }
   };
});

define("helpers/skipVars", function(){});

define('State', [],function StateLoader () {
   var State = (function StateFunction() {
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
   return State;
});
define("helpers/State", function(){});

define('module', ['helpers/utils', 'astModules/partial', 'helpers/straightFromFile'], function moduleLoader(utils, partial, straightFromFile) {
   var moduleM = {
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
   return moduleM;
});

define("astModules/module", function(){});

define('entityHelpers', ['helpers/utils'], function entityHelpersLoader(utils) {
   var entityHelpers = {
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
   return entityHelpers;
});
define("helpers/entityHelpers", function(){});

define('include', ['helpers/straightFromFile', 'helpers/entityHelpers', 'helpers/State'], function (straightFromFile, entityHelpers, State) {
   var includeM = {
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
   return includeM;
});
define("astModules/include", function(){});

define('template', ['helpers/State', 'helpers/entityHelpers'], function templateLoader(State, entityHelpers) {
   var templateM = {
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
   return templateM;
});
define("astModules/template", function(){});

define('partial', ['helpers/State', 'helpers/utils', 'helpers/injectedDataForce'], function partialLoader(State, utils, injectedDataForce) {
   var partialM = {
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
   return partialM;
});
define("astModules/partial", function(){});

define('traverse', ['jison/htmlparser', 'helpers/utils', 'helpers/skipVars', 'helpers/State', 'astModules/module', 'helpers/entityHelpers', 'astModules/include', 'astModules/template', 'astModules/partial'], function traverseLoader(htmlparser, utils, skipVars, State, moduleC, entityHelpers, inc, tmp, par) {
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
define('seekForVars', ['helpers/utils', 'jison/jsCat', 'helpers/decorators'], function seekForVarsLoader(utils, jsResolver, decorators) {
   return function seekForVars(textData, scopeData) {
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
});

define("helpers/seekingForVars", function(){});

define('whatType', [],function whatTypeLoader() {
   return function checkType(value) {

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
});

define("helpers/whatType", function(){});

define('if', ['jison/jsCat', 'helpers/challenge', 'helpers/decorators'], function ifLoader(jsResolver, challenge, decorators) {
   var ifM = {
      module: function ifModule(tag, data) {
         function resolveStatement(source) {
            var res = jsResolver.parse(source.value)(data, decorators), processed, clonedData;
            if (source.fromAttr) {
               tag.attribs.if = undefined;
               if (res) {
                  return this._process([tag], data);
               }
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
   return ifM;
});

define("astModules/if", function(){});

define('for', ['helpers/checkStatements', 'helpers/whatType', 'helpers/challenge', 'helpers/utils'], function (checkStatements, whatType, challenge, utils) {
   var forM = {
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
               tag.attribs.for = undefined;
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
   return forM;
});
define("astModules/for", function(){});

define('else', ['jison/jsCat', 'helpers/decorators'], function elseLoader(jsResolver, decorators) {
   var elseM = {
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
   return elseM;
});
define("astModules/else", function(){});

define('processing', ['helpers/utils', 'helpers/seekingForVars', 'helpers/whatType', 'astModules/module', 'helpers/entityHelpers', 'astModules/if', 'astModules/for', 'astModules/else', 'astModules/partial', 'astModules/include', 'astModules/template'], function processingModule(utils, seekingForVars, whatType, moduleC, entityHelpers, ifM, forM, elseM, par, inc, tmp) {
   var processing = {
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
         'else': elseM
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
   return processing;
});

define('entry', ['traverse', 'processing'], function (traversing, processing) {
   return {
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
});
