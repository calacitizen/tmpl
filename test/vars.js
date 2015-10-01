var tmpl = require('../tmpl'),
    assert = require("assert"),
    expect = require('chai').expect;

describe('Variables', function() {
    it('Simple variable', function(done) {
        var data = {
            master: 'Michelangelo'
        };
        tmpl.template('<div>{{ master }} Antonioni</div>').handle(function(traversed) {
            setTimeout(function() {
                expect(tmpl.html(traversed, data)).to.equal('<div>Michelangelo Antonioni</div>');
                done();
            });
        });
    });
    it('Condition variable', function(done) {
        var data = {
            yes: true,
            no: true
        };
        tmpl.template('<div>{{ yes === true ? "Stanley" }} {{ no === true ? "Kramer" }}</div>').handle(function(traversed) {
            setTimeout(function() {
                expect(tmpl.html(traversed, data)).to.equal('<div>Stanley Kramer</div>');
                done();
            });
        });
    });
    it('Mixed variables', function(done) {
        var data = {
            id: "rr",
            me: "yourself",
            he: 2,
            sumatra: "YEEEAAAHHH"
        };
        tmpl.template('<div id="{{id}}" class="Change-{{me}}{{ he !== 1 ? \' upyours\' }}">{{sumatra}} yep</div>').handle(function(traversed) {
            setTimeout(function() {
                expect(tmpl.html(traversed, data)).to.equal('<div id="rr" class="Change-yourself upyours">YEEEAAAHHH yep</div>');
                done();
            });
        });
    });
});
