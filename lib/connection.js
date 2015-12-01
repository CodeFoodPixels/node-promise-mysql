var Promise = require('bluebird'),
    mysql = require('mysql'),
    promiseCallback = require('./promise-callback.js');


var connection = function(configOrConnection){
    var self = this;
    if (configOrConnection._pool) {
        self.connection = configOrConnection
    } else {
        self.config = configOrConnection;
        var connect = function(resolve, reject){
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
                if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                    connect();
                }
            });
        };
        return new Promise(function(resolve, reject){
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
}

connection.prototype.query = function(sql, values){
    return promiseCallback.apply(this.connection, ['query', arguments]);
}

connection.prototype.beginTransaction = function(){
    return promiseCallback.apply(this.connection, ['beginTransaction', arguments]);
}

connection.prototype.commit = function(){
    return promiseCallback.apply(this.connection, ['commit', arguments]);
}

connection.prototype.rollback = function(){
    return promiseCallback.apply(this.connection, ['rollback', arguments]);
}

connection.prototype.changeUser = function(){
    return promiseCallback.apply(this.connection, ['changeUser', arguments]);
}

connection.prototype.ping = function(){
    return promiseCallback.apply(this.connection, ['ping', arguments]);
}

connection.prototype.statistics = function(){
    return promiseCallback.apply(this.connection, ['statistics', arguments]);
}

connection.prototype.end = function(){
    return promiseCallback.apply(this.connection, ['end', arguments]);
}

connection.prototype.destroy = function() {
    this.connection.destroy();
}

connection.prototype.pause = function() {
    this.connection.pause();
}

connection.prototype.resume = function() {
    this.connection.resume();
}

connection.prototype.escape = function(value){
    return this.connection.escape(value);
}

connection.prototype.escapeId = function(value){
    return this.connection.escapeId(value);
}

connection.prototype.format = function(sql, values){
    return this.connection.format(sql, values);
}

connection.prototype.release = function(){
    return this.connection.release();
}

module.exports = connection;
