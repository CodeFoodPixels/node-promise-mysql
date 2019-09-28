'use strict';

const Promise = require('bluebird');
const mysql = require('mysql');
const PoolConnection = require('./poolConnection.js');
const promiseCallback = require('./helper').promiseCallback;

class pool {
    constructor(config = {}) {
        let mysqlValue = mysql;
        let mysqlWrapperCallbackPromise;

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
            delete config.mysqlWrapper;
        }

        if (config.returnArgumentsArray) {
            this.returnArgumentsArray = config.returnArgumentsArray;
            config.returnArgumentsArray = undefined;
        }

        return Promise.resolve(mysqlValue || mysqlWrapperCallbackPromise).then((mysql) => {
            this.pool = mysql.createPool(config);
            return Promise.resolve(this);
        });
    }

    getConnection() {
        return promiseCallback.apply(this.pool, ['getConnection', arguments, this.returnArgumentsArray])
            .then((_connection) => {
                const config = {
                    returnArgumentsArray: this.returnArgumentsArray,
                    reconnect: false
                };

                return new PoolConnection(config, _connection);
            });
    }

    releaseConnection(connection) {
        //Use the underlying connection from the mysql-module here:
        return this.pool.releaseConnection(connection.connection);
    }

    query() {
        return promiseCallback.apply(this.pool, ['query', arguments, this.returnArgumentsArray]);
    }

    end() {
        return promiseCallback.apply(this.pool, ['end', arguments, this.returnArgumentsArray]);
    }

    escape(value) {
        return this.pool.escape(value);
    }

    escapeId(value) {
        return this.pool.escapeId(value);
    }

    on(event, fn) {
        this.pool.on(event, fn);
    }
}

module.exports = pool;
