var tmpl = require('../tmpl'),
   assert = require("assert"),
   expect = require('chai').expect;

describe('Short for constructions', function () {
   it('ShortIf', function (done) {
      var data = {
         hiddenClass: 'hidden',
         fast: true,
         whatProperty: false
      };
      tmpl.template('<div if="{{fast}}" class="{{ hiddenClass }}">Text</div>').handle(function(traversed) {
         setTimeout(function() {
            expect(tmpl.html(traversed, data)).to.equal('<div class="hidden">Text</div>');
            done();
         });
      });
   });
   it('Testing short for module', function forTest(done) {
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
         setTimeout(function() {
            expect(tmpl.html(traversed, data)).to.equal('<span class="big">Lacy</span><span class="small">Kev</span><span class="stupid">Mike</span>');
            done();
         });
      });
   });
});