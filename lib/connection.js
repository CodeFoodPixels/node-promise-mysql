var Promise = require('bluebird'),
    mysql = require('mysql'),
    promiseCallback = require('./helper').promiseCallback;

/**
* Constructor
* @param {object} config - The configuration object
* @param {object} _connection - Mysql-Connection, only used internaly by the pool object
*/
var connection = function(config, _connection) {
    this.connection = _connection || mysql.createConnection(config);
    this.connection.connect();
};

connection.prototype.query = function(sql, values) {
    return promiseCallback.apply(this.connection, ['query', arguments]);
};

connection.prototype.beginTransaction = function() {
    return promiseCallback.apply(this.connection, ['beginTransaction', arguments]);
};

connection.prototype.commit = function() {
    return promiseCallback.apply(this.connection, ['commit', arguments]);
};

connection.prototype.rollback = function() {
    return promiseCallback.apply(this.connection, ['rollback', arguments]);
};

connection.prototype.changeUser = function(data) {
    return promiseCallback.apply(this.connection, ['changeUser', arguments]);
};

connection.prototype.ping = function(data) {
    return promiseCallback.apply(this.connection, ['ping', arguments]);
};

connection.prototype.statistics = function(data) {
    return promiseCallback.apply(this.connection, ['statistics', arguments]);
};

connection.prototype.end = function(data) {
    return promiseCallback.apply(this.connection, ['end', arguments]);
};

connection.prototype.destroy = function() {
    this.connection.destroy();
};

connection.prototype.pause = function() {
    this.connection.pause();
};

connection.prototype.resume = function() {
    this.connection.resume();
};

connection.prototype.escape = function(value) {
    return this.connection.escape(value);
};

connection.prototype.escapeId = function(value) {
    return this.connection.escapeId(value);
};

connection.prototype.format = function(sql, values) {
    return this.connection.format(sql, values);
};

module.exports = connection;
