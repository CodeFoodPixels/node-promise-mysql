var expect = require('chai').expect;

module.exports = {
    queryCheck: function queryCheck(promise, done) {
        promise.then(function(result) {
            expect(result).to.be.a('array');
            expect(result).to.have.length(1);
            expect(result[0]).to.have.property('res');
            expect(result[0].res).to.be.equal(2);
            done();
        }).catch(function(err) {
            done(err);
        });
    },
};
