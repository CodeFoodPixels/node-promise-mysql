const Connection = require('./connection.js');

class poolConnection extends Connection {
    constructor(_connection) {
        super(_connection);
    }

    release() {
        this.connection.release();
    }

    destroy() {
        this.connection.destroy();
    }
}

module.exports = poolConnection;
