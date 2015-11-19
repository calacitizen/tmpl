var tmpl = require('../tmplw'),
    assert = require("assert"),
    expect = require('chai').expect;

describe('Variables', function varTest() {
    it('Simple variable', function simpleVarTest(done) {
        var data = {
            master: 'Michelangelo'
        };
        tmplw.template('<div>{{ master }} Antonioni</div>').handle(function(traversed) {
            setTimeout(function() {
                expect(tmplw.html(traversed, data)).to.equal('<div>Michelangelo Antonioni</div>');
                done();
            });
        });
    });
    it('Condition variable', function conditionVarTest(done) {
        var data = {
            yes: true,
            no: true
        };
        tmplw.template('<div>{{ yes === true ? "Stanley" }} {{ no === true ? "Kramer" }}</div>').handle(function(traversed) {
            setTimeout(function() {
                expect(tmplw.html(traversed, data)).to.equal('<div>Stanley Kramer</div>');
                done();
            });
        });
    });
    it('Mixed variables', function mixedVarTest(done) {
        var data = {
            id: "rr",
            me: "yourself",
            he: 2,
            sumatra: "YEEEAAAHHH"
        };
        tmplw.template('<div id="{{id}}" class="Change-{{me}}{{ he !== 1 ? \' upyours\' }}">{{sumatra}} yep</div>').handle(function(traversed) {
            setTimeout(function() {
                expect(tmplw.html(traversed, data)).to.equal('<div id="rr" class="Change-yourself upyours">YEEEAAAHHH yep</div>');
                done();
            });
        });
    });
});
