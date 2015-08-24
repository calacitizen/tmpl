var tmpl = require('../tmpl'),
    assert = require("assert"),
    expect = require('chai').expect;
describe('Objects and children', function () {
  it('Testing children vars', function (done) {
    var parsed = tmpl.parse('<div>123 {{ master }}</div>');
    tmpl.traverse(parsed).handle(function (traversed) {
      setTimeout(function() {
        var child = traversed[0].children[0];
        for (var i = 0; i < child.data.length; i++) {
          if (child.data[i].name === 'master') {
            assert.equal(child.data[i].type, 'var');
          }
        }
        done();
      });
    });
  });
  it('Testing For module', function (done) {
    var parsed = tmpl.parse('<for data="dog in dogs"><span class="{{ dog.type }}">{{dog.name}}</span></for>');
        data = {dogs: [{type: 'big', name: 'Lacy'}, {type: 'small', name: 'Kev'}, {type: 'stupid', name: 'Mike'}]};
    tmpl.traverse(parsed).handle(function (traversed) {
        setTimeout(function () {
          expect(tmpl.html(traversed, data)).to.equal('<span class="big">Lacy</span><span class="small">Kev</span><span class="stupid">Mike</span>');
          done();
        });
    });
  });
  it('Testing If module', function (done) {
    var parsed = tmpl.parse('<if data="number === 124"><div class="{{bam}}">{{tt}}</div></if>');
        data = {number: 124, bam: 'hidden'};
    tmpl.traverse(parsed).handle(function (traversed) {
        setTimeout(function () {
          expect(tmpl.html(traversed, data)).to.equal('<div class="hidden"></div>')
          done();
        });
    });
  });
});
