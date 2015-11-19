var requirejs = require("requirejs"),
   assert = require("assert"),
   expect = require('chai').expect;

requirejs.config({
   baseUrl: '.',
   nodeRequire: require
});

describe('Conditional attributes', function() {
   it('Vars', function(done) {
      requirejs(['tmpl-engine'], function (tmpl) {
         console.log(tmpl);
         var data = {
            hiddenClass: 'hidden'
         };
         tmpl.template('<div class="{{hiddenClass}}" id="{{no}}">Text</div>').handle(function(traversed) {
            setTimeout(function() {
               expect(tmpl.html(traversed, data)).to.equal('<div class="hidden">Text</div>');
               done();
            });
         });
      });
   });
   it('Conditions', function(done) {
      requirejs(['tmpl-engine'], function (tmpl) {
         var data = {
            hiddenClass: true,
            no: 123
         };
         tmpl.template('<div class="{{no}}{{ hiddenClass !== false ? \' hidden\' }}" id="{{ no === 321 ? \'first\' }}">Text</div>').handle(function (traversed) {
            setTimeout(function () {
               expect(tmpl.html(traversed, data)).to.equal('<div class="123 hidden">Text</div>');
               done();
            });
         });
      })
   });
   it('Mixed', function(done) {
      requirejs(['tmpl-engine'], function (tmpl) {
         var data = {
            hiddenClass: true,
            no: 123,
            mars: "pluto",
            pp: undefined
         };
         tmpl.template('<div class="{{ hiddenClass !== false ? \'hidden\' }}" id="{{ mars }}" custom="{{pp}}">Text</div>').handle(function (traversed) {
            setTimeout(function () {
               expect(tmpl.html(traversed, data)).to.equal('<div class="hidden" id="pluto">Text</div>');
               done();
            });
         });
      });
   });
});
