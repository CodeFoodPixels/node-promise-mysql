var mysql = require('mysql'),
    Connection = require('./connection.js'),
    promiseCallback = require('./helper').promiseCallback;

var pool = function(config) {
    var _mysql = (config && config.mysql) || mysql;
    this.pool = _mysql.createPool(config);
};

pool.prototype.getConnection = function getConnection() {
    return promiseCallback.apply(this.pool, ['getConnection', arguments])
    .then(function(con) {
        return new Connection(null, con);
    });
};

pool.prototype.releaseConnection = function releaseConnection(connection) {
    //Use the underlying connection from the mysql-module here:
    return this.pool.releaseConnection(connection.connection);
};

pool.prototype.query = function(sql, values) {
    return promiseCallback.apply(this.pool, ['query', arguments]);
};

pool.prototype.end = function(data) {
    return promiseCallback.apply(this.pool, ['end', arguments]);
};

pool.prototype.escape = function(value) {
    return this.pool.escape(value);
};

pool.prototype.escapeId = function(value) {
    return this.pool.escapeId(value);
};

pool.prototype.on = function(event, fn) {
    this.pool.on(event, fn);
};

module.exports = pool;
