var tmpl = require('../tmpl'),
  assert = require("assert"),
  expect = require('chai').expect;

describe('Variables', function() {
  it('Simple variable', function(done) {
    var parsed = tmpl.parse('<div>{{ master }} Antonioni</div>'),
      data = {
        master: 'Michelangelo'
      };
    tmpl.traverse(parsed).handle(function(traversed) {
      setTimeout(function() {
        expect(tmpl.html(traversed, data)).to.equal('<div>Michelangelo Antonioni</div>');
        done();
      });
    });
  });
  it('Condition variable', function(done) {
    var parsed = tmpl.parse('<div>{{ "Stanley": yes === true }} {{ "Kramer": no === true }}</div>'),
      data = {
        yes: true,
        no: true
      };
    tmpl.traverse(parsed).handle(function(traversed) {
      setTimeout(function() {
        expect(tmpl.html(traversed, data)).to.equal('<div>Stanley Kramer</div>');
        done();
      });
    });
  });
  it('Mixed variables', function(done) {
    var parsed = tmpl.parse('<div id="{{id}}" class="Change-{{me}}{{ " upyours" : he !== 1 }}">{{sumatra}} yep</div>'),
      data = {
        id: "rr",
        me: "yourself",
        he: 2,
        sumatra: "YEEEAAAHHH"
      };
    tmpl.traverse(parsed).handle(function(traversed) {
      setTimeout(function() {
        expect(tmpl.html(traversed, data)).to.equal('<div id="rr" class="Change-yourself upyours">YEEEAAAHHH</div>');
        done();
      });
    });
  });
});
