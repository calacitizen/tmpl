var requirejs = require("requirejs"),
   assert = require("assert"),
   expect = require('chai').expect;

requirejs.config({
   baseUrl: '.',
   nodeRequire: require
});


describe('Short for constructions', function () {
   it('ShortIf', function (done) {
      requirejs(['tmpl-engine'], function (tmpl) {
         var data = {
            hiddenClass: 'hidden',
            fast: true,
            whatProperty: false
         };
         tmpl.template('<div if="{{fast}}" class="{{ hiddenClass }}">Text</div>').handle(function (traversed) {
            setTimeout(function () {
               expect(tmpl.html(traversed, data)).to.equal('<div class="hidden">Text</div>');
               done();
            });
         });
      });
   });
   it('short if nested', function (done) {
      requirejs(['tmpl-engine'], function (tmpl) {
         var data = {
            hiddenClass: 'hidden',
            fast: true,
            whatProperty: false
         };
         tmpl.template('<div if="{{fast}}" class="{{ hiddenClass }}">Rest<div if="{{whatProperty}}" class="{{ hiddenClass }}">Text</div>Paste</div>').handle(function (traversed) {
            setTimeout(function () {
               expect(tmpl.html(traversed, data)).to.equal('<div class="hidden">RestPaste</div>');
               done();
            });
         });
      });
   });
   it('Testing short for module', function forTest(done) {
      requirejs(['tmpl-engine'], function (tmpl) {
         var data = {
            dogs: [{
               type: 'big',
               name: 'Lacy'
            }, {
               type: 'small',
               name: 'Kev'
            }, {
               type: 'stupid',
               name: 'Mike'
            }]
         };
         tmpl.template('<span for="dog in dogs" class="{{ dog.type }}">{{dog.name}}</span>').handle(function (traversed) {
            setTimeout(function () {
               expect(tmpl.html(traversed, data)).to.equal('<span class="big">Lacy</span><span class="small">Kev</span><span class="stupid">Mike</span>');
               done();
            });
         });
      });
   });
   it('Testing short nested for module', function forTest(done) {
      requirejs(['tmpl-engine'], function (tmpl) {
         var data = {
            dogs: [{
               type: 'big',
               name: 'Lacy',
               cars: [{
                  type: 'big',
                  name: 'Porshe'
               }, {
                  type: 'small',
                  name: 'MiniCooper'
               }, {
                  type: 'stupid',
                  name: 'Lada'
               }]
            }, {
               type: 'small',
               name: 'Kev',
               cars: [{
                  type: 'big',
                  name: 'Porshe'
               }, {
                  type: 'small',
                  name: 'MiniCooper'
               }, {
                  type: 'stupid',
                  name: 'Lada'
               }]
            }, {
               type: 'stupid',
               name: 'Mike',
               cars: [{
                  type: 'big',
                  name: 'Porshe'
               }, {
                  type: 'small',
                  name: 'MiniCooper'
               }, {
                  type: 'stupid',
                  name: 'Lada'
               }]
            }]
         };
         tmpl.template('<div for="dog in dogs" class="{{ dog.type }}"><div for="car in dog.cars" if="{{dog.type === \'small\'}}">{{dog.name}}{{car.name}}</div></div>').handle(function (traversed) {
            setTimeout(function () {
               expect(tmpl.html(traversed, data)).to.equal('<div class="big"></div><div class="small"><div>KevPorshe</div><div>KevMiniCooper</div><div>KevLada</div></div><div class="stupid"></div>');
               done();
            });
         });
      });
   });
});