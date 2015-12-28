var expect = require('chai').expect;
var helper = require('./queryHelper');
var mysql  = require('../index.js');
var connection;

describe('The mysql connection', function(done) {

    before('Connecting to MySQL', function() {
        connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PWD,
        });
    });

    it('should execute a query successfully', function(done) {
        helper.queryCheck(connection.query('SELECT 1+1 AS res;'), done);
    });

    it('should reject if the sql query has got an error', function(done) {
        connection.query('SELECT * FROM tablethatdoesnotexist').then(function(res) {
            done('No Error was given.');
        }).catch(function(err) {
            expect(err).to.exist;
            done();
        });
    });

});
