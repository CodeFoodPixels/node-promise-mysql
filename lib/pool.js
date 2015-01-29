var Promise = require('bluebird'),
    mysql = require('mysql');

var pool = function(config){
    this.pool = mysql.createPool(config);
}

pool.prototype.query = function(sql, values){
    return promiseCallback.apply(this.pool, ['query', arguments]);
}

pool.prototype.beginTransaction = function(){
    return promiseCallback.apply(this.pool, ['beginTransaction', arguments]);
}

pool.prototype.commit = function(){
    return promiseCallback.apply(this.pool, ['commit', arguments]);
}

pool.prototype.rollback = function(){
    return promiseCallback.apply(this.pool, ['rollback', arguments]);
}

pool.prototype.changeUser = function(data){
    return promiseCallback.apply(this.pool, ['changeUser', arguments]);
}

pool.prototype.ping = function(data){
    return promiseCallback.apply(this.pool, ['ping', arguments]);
}

pool.prototype.statistics = function(data){
    return promiseCallback.apply(this.pool, ['statistics', arguments]);
}

pool.prototype.end = function(data){
    return promiseCallback.apply(this.pool, ['end', arguments]);
}

pool.prototype.destroy = function() {
    this.pool.destroy();
}

pool.prototype.pause = function() {
    this.pool.pause();
}

pool.prototype.resume = function() {
    this.pool.resume();
}


pool.prototype.escape = function(value){
    return this.pool.escape(value);
}

pool.prototype.escapeId = function(value){
    return this.pool.escapeId(value);
}

pool.prototype.format = function(sql, values){
    return this.pool.format(sql, values);
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

module.exports = pool;
