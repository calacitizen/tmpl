var requirejs = require("requirejs"),
   assert = require("assert"),
   expect = require('chai').expect;

requirejs.config({
   baseUrl: '.',
   nodeRequire: require
});

describe('Variables', function varTest() {
    it('Simple variable', function simpleVarTest(done) {
       requirejs(['tmpl-engine'], function (tmpl) {
          var data = {
             master: 'Michelangelo'
          };
          tmpl.template('<div>{{ master }} Antonioni</div>').handle(function (traversed) {
             setTimeout(function () {
                expect(tmpl.html(traversed, data)).to.equal('<div>Michelangelo Antonioni</div>');
                done();
             });
          });
       });
    });
    it('Condition variable', function conditionVarTest(done) {
       requirejs(['tmpl-engine'], function (tmpl) {
          var data = {
             yes: true,
             no: true
          };
          tmpl.template('<div>{{ yes === true ? "Stanley" }} {{ no === true ? "Kramer" }}</div>').handle(function (traversed) {
             setTimeout(function () {
                expect(tmpl.html(traversed, data)).to.equal('<div>Stanley Kramer</div>');
                done();
             });
          });
       });
    });
    it('Mixed variables', function mixedVarTest(done) {
       requirejs(['tmpl-engine'], function (tmpl) {
          var data = {
             id: "rr",
             me: "yourself",
             he: 2,
             sumatra: "YEEEAAAHHH"
          };
          tmpl.template('<div id="{{id}}" class="Change-{{me}}{{ he !== 1 ? \' upyours\' }}">{{sumatra}} yep</div>').handle(function (traversed) {
             setTimeout(function () {
                expect(tmpl.html(traversed, data)).to.equal('<div id="rr" class="Change-yourself upyours">YEEEAAAHHH yep</div>');
                done();
             });
          });
       });
    });
});
