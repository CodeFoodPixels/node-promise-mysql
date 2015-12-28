var expect = require('chai').expect;
var helper = require('./queryHelper');
var mysql  = require('../index.js');
var pool;

describe('The connection pool', function() {

    before('Connecting to MySQL', function() {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PWD,
            connectionLimit: 10,
        });
    });

    it('should execute a query successfully', function(done) {
        helper.queryCheck(pool.query('SELECT 1+1 AS res;'), done);
    });

    it('should give you a connection object', function(done) {
        pool.getConnection().then(function(con) {
            expect(con).to.exist;
            expect(con.query).to.be.a('function');
            helper.queryCheck(con.query('SELECT 1+1 AS res;'), done);
        }).catch(function(err) {
            done(err);
        });
    });

    it('acquireConnection');

    it('releaseConnection');

});
