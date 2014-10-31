var Promise = require('bluebird'),
    mysql = require('mysql');

var connection = function(config){
    this.connection = mysql.createConnection(config);
    this.connection.connect();
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

connection.prototype.changeUser = function(data){
    return promiseCallback.apply(this.connection, ['changeUser', arguments]);
}

connection.prototype.ping = function(data){
    return promiseCallback.apply(this.connection, ['ping', arguments]);
}

connection.prototype.statistics = function(data){
    return promiseCallback.apply(this.connection, ['statistics', arguments]);
}

connection.prototype.end = function(data){
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

var promiseCallback = function(functionName, params){
    var self = this;
    params = Array.prototype.slice.call(params, 0);
    return new Promise(function(resolve, reject){
        params.push(function(err){
            var args = Array.prototype.slice.call(arguments, 1);
            if (err) {
                return reject(err);
            }
            return resolve.apply(this, args);
        })
        self[functionName].apply(self, params);
    });
}

module.exports = connection;
