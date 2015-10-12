var tmpl = require('../tmpl'),
    assert = require("assert"),
    expect = require('chai').expect;

describe('Objects and children', function objectsAndChildrenTest() {
    it('Testing children vars', function childrenTest(done) {
        tmpl.template('<div>123 {{ master }}</div>').handle(function childrenVarTest(traversed) {
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
    it('Testing For module', function forTest(done) {
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
        tmpl.template('<ws:for data="dog in dogs"><span class="{{ dog.type }}">{{dog.name}}</span></ws:for>').handle(function(traversed) {
            setTimeout(function() {
                expect(tmpl.html(traversed, data)).to.equal('<span class="big">Lacy</span><span class="small">Kev</span><span class="stupid">Mike</span>');
                done();
            });
        });
    });
    it('Testing If module', function ifTest(done) {
        var data = {
            number: 124,
            bam: 'hidden'
        };
        tmpl.template('<ws:if data="number === 124"><div class="{{bam}}">{{tt}}</div></ws:if>').handle(function(traversed) {
            setTimeout(function() {
                expect(tmpl.html(traversed, data)).to.equal('<div class="hidden"></div>')
                done();
            });
        });
    });
});
