var Connection = require('./connection.js'),
    inherits = require('util').inherits,
    promiseCallback = require('./helper').promiseCallback;

var poolConnection = function(_connection) {
    this.connection = _connection;

    Connection.call(this, null, _connection)
}

inherits(poolConnection, Connection);

poolConnection.prototype.release = function() {
    this.connection.release();
};

poolConnection.prototype.destroy = function() {
    this.connection.destroy();
};

module.exports = poolConnection;
