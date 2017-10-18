var Connection = require('./connection.js'),
    inherits = require('util').inherits,
    promiseCallback = require('./helper').promiseCallback;

var poolConnection = function(_connection) {
    this.connection = _connection;

    Connection.call(this, null, _connection)
}

poolConnection.prototype.release = function() {
    return promiseCallback.apply(this.connection, ['release', arguments]);
};

poolConnection.prototype.destroy = function() {
    return promiseCallback.apply(this.connection, ['destroy', arguments]);
};

inherits(poolConnection, Connection);

module.exports = poolConnection;
