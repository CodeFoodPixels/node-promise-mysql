var Promise = require('bluebird'),
    mysql = require('mysql'),
    promiseCallback = require('./helper').promiseCallback;

/**
* Constructor
* @param {object} config - The configuration object
* @param {object} _connection - Mysql-Connection, only used internaly by the pool object
*/
var connection = function(config, _connection){
    var self = this,
        connect = function(resolve, reject) {
            if (_connection) {
                self.connection = _connection;
                resolve();
            } else {
                self.connection = mysql.createConnection(self.config);
                self.connection.connect(
                    function(err){
                        if (err) {
                            self.connection.err = err;
                            if (typeof reject === 'function') {
                                return reject(err);
                            } else {
                                setTimeout(function(){
                                    connect();
                                }, 2000);
                                return;
                            }
                        } else {
                            delete self.connection.err;
                            if (typeof resolve === 'function') {
                                return resolve();
                            }
                        }
                    }
                );

                self.connection.on('error', function(err) {
                    console.log('db error', err);
                    self.connection.err = err;
                    if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
                        connect();
                    }
                });
            }
        };

    this.config = config;

    return new Promise(function(resolve, reject) {
        connect(
            function(){
                return resolve(self);
            },
            function(err){
                return reject(err);
            }
        );
    });
}

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
