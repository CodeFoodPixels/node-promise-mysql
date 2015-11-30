var Promise = require('bluebird'),
    mysql = require('mysql'),
    promiseCallback = require('./promise-callback.js'),
    Connection = require('./connection.js');


var pool = function(config){
    this.config = config;
    this.pool = mysql.createPool(config);
}

pool.prototype.getConnection = function(){
    var self = this;

    return new Promise(function(resolve, reject){
        self.pool.getConnection(
            function(err, connection){
                if (err) {
                    self.pool.err = err;
                    reject(err);
                } else {
                    delete self.pool.err;
                    resolve(new Connection(connection));
                }
            }
        );
    });
}

pool.prototype.end = function(){
    return promiseCallback.apply(this.pool, ['end', arguments]);
}

module.exports = pool;
