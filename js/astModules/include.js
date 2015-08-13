var VOW = require('../helpers/VOW'),
    utils = require('../helpers/utils');
module.exports = {
  module: function requireOrRetire(tag, data, cb) {
    var assignModuleVar = tag.attribs.name.trim(),
      template = tag.attribs.template.trim(),
      templatePath = template + '.tmpl',
      templateBody, req, text, ast;

      if (utils.isNode() === false) {
        define('fs', function restrain() {
          return {};
        });
      }

    function createRequest(url) {
      var request = new XMLHttpRequest();
      request.open('GET', url);
      request.send();
      return request;
    }

    function readFile(url) {
      var fs = requirejs('fs'),
        vow = VOW.make();
      fs.readFile('./' + url, function readFileCallback(err, data) {
        if (err) {
          vow.break(err);
        } else {
          vow.keep(this.parse(data));
        }
      }.bind(this));
      return vow.promise;
    }

    function workOutAsync(req) {
      var vow = VOW.make();
      req.onreadystatechange = function requestHandler() {
        if (req.readyState == 4 && req.status == 200) {
          vow.keep(this.parse(req.responseText));
        }
      }.bind(this);
      return vow.promise;
    }

    function resolveStatement() {
      if (utils.isNode() === false) {
        req = createRequest(templatePath);
        return workOutAsync.call(this, req).when(function resolveInclude(object) {
          data[assignModuleVar] = object;
          return data;
        });
      }
      return readFile.call(this, templatePath).when(function resolveInclude(object) {
        data[assignModuleVar] = object;
        return data;
      });
    }

    return function includeResolve() {
      return resolveStatement.call(this);
    }
  }
}
