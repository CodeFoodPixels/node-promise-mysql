'use strict';

const Promise = require(`bluebird`);
const mysql = require(`mysql`);
const promiseCallback = require(`./helper`).promiseCallback;

class connection {
    constructor(config = {}, _connection) {
        let mysqlValue = mysql;
        let mysqlWrapperCallbackPromise;

        if (typeof config !== 'string') {

            if (config.mysqlWrapper) {
                let callback;
                mysqlWrapperCallbackPromise = new Promise((resolve, reject) => {
                    callback = (err, mysql) => {
                        if (err) {
                            return reject(err);
                        }

                        return resolve(mysql);
                    }
                })
                mysqlValue = config.mysqlWrapper(mysql, callback);
                config.mysqlWrapper = undefined;
            }

            if (config.returnArgumentsArray) {
                this.returnArgumentsArray = config.returnArgumentsArray;
                config.returnArgumentsArray = undefined;
            }

            if (config.reconnect === true || config.reconnect === undefined) {
                this.reconnect = true;
                config.reconnect = undefined;
            }
        }

        this.config = config;

        return Promise.resolve(mysqlValue || mysqlWrapperCallbackPromise).then((mysql) => {
            if (_connection && this.reconnect) {
                addReconnectHandler(_connection, mysql, this.config, this.reconnect);
            } else if (!_connection) {
                _connection = connect(mysql, this.config, this.reconnect);
            }

            return _connection;
        }).then((connection) => {
            this.connection = connection;

            return this;
        })
    }

    query() {
        return promiseCallback.apply(this.connection, [`query`, arguments, this.returnArgumentsArray]);
    }

    queryStream(sql, values) {
        return this.connection.query(sql, values);
    };

    beginTransaction() {
        return promiseCallback.apply(this.connection, [`beginTransaction`, arguments, this.returnArgumentsArray]);
    }

    commit() {
        return promiseCallback.apply(this.connection, [`commit`, arguments, this.returnArgumentsArray]);
    }

    rollback() {
        return promiseCallback.apply(this.connection, [`rollback`, arguments, this.returnArgumentsArray]);
    }

    changeUser() {
        return promiseCallback.apply(this.connection, [`changeUser`, arguments, this.returnArgumentsArray]);
    }

    ping() {
        return promiseCallback.apply(this.connection, [`ping`, arguments, this.returnArgumentsArray]);
    }

    statistics() {
        return promiseCallback.apply(this.connection, [`statistics`, arguments, this.returnArgumentsArray]);
    }

    end() {
        return promiseCallback.apply(this.connection, [`end`, arguments, this.returnArgumentsArray]);
    }

    destroy() {
        this.connection.destroy();
    }

    pause() {
        this.connection.pause();
    }

    resume() {
        this.connection.resume();
    }

    escape(value) {
        return this.connection.escape(value);
    }

    escapeId(value) {
        return this.connection.escapeId(value);
    }

    format(sql, values) {
        return this.connection.format(sql, values);
    }

    on(event, fn) {
        this.connection.on(event, fn);
    }
}

const connect = (mysql, config, reconnect) => {
    const connection = mysql.createConnection(config);

    return new Promise((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                return reject(err);
            } else {
                if (reconnect) {
                    addReconnectHandler(connection, mysql, config, reconnect);
                }

                return resolve(connection);
            }
        })
    });
}

const addReconnectHandler = (connection, mysql, config, reconnect) => {
    connection.once(`error`, (err) => {
        if(
            err.code === `PROTOCOL_CONNECTION_LOST` ||
            err.code === `ECONNRESET` ||
            err.code === `PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR`
        ) {
            connect(mysql, config, reconnect);
        }
    });
}

module.exports = connection;
