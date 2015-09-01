var tmpl = require('../tmpl'),
  assert = require("assert"),
  expect = require('chai').expect;

describe('Conditional attributes', function() {
  it('Vars', function(done) {
    var parsed = tmpl.parse('<div class="{{hiddenClass}}" id="{{no}}">Text</div>'),
      data = {
        hiddenClass: 'hidden'
      };
    tmpl.traverse(parsed).handle(function(traversed) {
      setTimeout(function() {
        expect(tmpl.html(traversed, data)).to.equal('<div class="hidden">Text</div>');
        done();
      });
    });
  });
  it('Conditions', function(done) {
    var parsed = tmpl.parse('<div class="{{ \'hidden\': hiddenClass !== false }}" id="{{ \'first\': no === 321 }}">Text</div>'),
      data = {
        hiddenClass: true,
        no: 123
      };
    tmpl.traverse(parsed).handle(function(traversed) {
      setTimeout(function() {
        expect(tmpl.html(traversed, data)).to.equal('<div class="hidden">Text</div>');
        done();
      });
    });
  });
});
