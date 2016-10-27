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
                    if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
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

/*merge some code*/
['query', 'beginTransaction', 'commit', 'rollback', 'changeUser', 'ping', 'statistics', 'end'].forEach(function (method) {
    connection.prototype[method] = function () {
        return promiseCallback.apply(this.connection, [method, arguments]);
    };
});
['destroy', 'pause', 'resume', 'escape', 'escapeId', 'format'].forEach(function (method) {
    connection.prototype[method] = function () {
        return this.connection[method].apply(this.connection, arguments);
    };
});

module.exports = connection;
