const Connection = require('./connection.js');

class poolConnection extends Connection {
    constructor(config, _connection) {
        super(config, _connection);
    }

    release() {
        this.connection.release();
    }
}

module.exports = poolConnection;
