var utils = require('../helpers/utils'),
    State = require('../helpers/State');

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
        define('fs', function restrainFs() {
            return {};
        });
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
