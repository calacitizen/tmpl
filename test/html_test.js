var tmpl = require('../tmpl'),
    assert = require("assert"),
    expect = require('chai').expect;
describe('Objects and children', function () {
  it('Testing children vars', function (done) {
    var parsed = tmpl.parse('<div>123 {{ master }}</div>'),
        data = { master: 321 };
    tmpl.traverse(parsed, data).handle(function (traversed) {
      setTimeout(function() {
        var child = traversed[0].children[0];
        for (var i = 0; i < child.data.length; i++) {
          if (child.data[i].type === 'var') {
            assert.equal(child.data[i].value, data.master);
          }
        }
        done();
      });
    });
  });
  it('Testing For module', function (done) {
    var parsed = tmpl.parse('<for data="dog in dogs"><span class="{{ dog.type }}">{{dog.name}}</span></for>');
        data = {dogs: [{type: 'big', name: 'Lacy'}, {type: 'small', name: 'Kev'}, {type: 'stupid', name: 'Mike'}]};
    tmpl.traverse(parsed, data).handle(function (traversed) {
        setTimeout(function () {
          var classData = traversed[0].attribs.class.data;
          expect(traversed).to.have.length(3);
          for (var i = 0; i < classData.length; i++) {
            if (classData[i].type === 'var') {
              expect(classData[i].value).to.equal('big');
            }
          }
          done();
        });
    });
  });
  it('Testing If module', function (done) {
    var parsed = tmpl.parse('<if data="number === 124"><div class="{{bam}}">{{tt}}</div></if>');
        data = {number: 124, bam: 'hidden'};
    tmpl.traverse(parsed, data).handle(function (traversed) {
        setTimeout(function () {
          expect(traversed).to.have.length(1);
          done();
        });
    });
  });
});
