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

    it('should release a connection without errors', function(done) {
        var pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PWD,
            connectionLimit: 1,
        });

        //We need to track the order of execution here,
        //We should get the 2nd connection after the first one
        //was released successfully.
        var seq = 0;

        pool.getConnection().then(function(con) {
            expect(++seq).to.be.equal(1);

            pool.getConnection().then(function(con) {
                expect(++seq).to.be.equal(3);
                pool.releaseConnection(con);
                pool.end();
                done();
            }).catch(function(err) {
                pool.end();
                done(err);
            });

            process.nextTick(function(arguments) {
                expect(++seq).to.be.equal(2);
                pool.releaseConnection(con);
            });

        }).catch(function(err) {
            done(err);
        });
    });

});
