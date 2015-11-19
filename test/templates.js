var requirejs = require("requirejs"),
   assert = require("assert"),
   expect = require('chai').expect;

requirejs.config({
   baseUrl: '.',
   nodeRequire: require
});

describe('Templates test', function templateTest() {
    it('Template Simple Test', function templateTestHere(done) {
       requirejs(['tmpl-engine'], function (tmpl) {
          var data = {
             master: 'Michelangelo'
          };
          tmpl.template('<span>321</span><ws:template name="rr"><div>{{master}}</div></ws:template><ws:partial template="rr" master="{{master}}"></ws:partial>').handle(function (traversed) {
             setTimeout(function () {
                expect(tmpl.html(traversed, data)).to.equal('<span>321</span><div>Michelangelo</div>');
                done();
             });
          });
       });
    });
    it('Template Injected Test', function templateInjectedTestHere(done) {
       requirejs(['tmpl-engine'], function (tmpl) {
          var data = {
             master: 'Michelangelo'
          };
          tmpl.template('<span>321</span><ws:template name="rr"><div>{{master}}</div><ws:partial template="{{injected}}"></ws:partial></ws:template><ws:partial template="rr" master="{{master}}"><ws:injected><i>MASK</i></ws:injected></ws:partial>').handle(function (traversed) {
             setTimeout(function () {
                expect(tmpl.html(traversed, data)).to.equal('<span>321</span><div>Michelangelo</div><i>MASK</i>');
                done();
             });
          });
       });
    });
});