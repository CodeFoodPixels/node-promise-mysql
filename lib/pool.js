'use strict';

const Promise = require('bluebird');
const mysql = require('mysql');
const PoolConnection = require('./poolConnection.js');
const promiseCallback = require('./helper').promiseCallback;

class pool {
    constructor(config = {}) {
        let mysqlValue = mysql;
        let mysqlWrapperCallbackPromise;

        if (config.wrapper) {
            let callback;
            mysqlWrapperCallbackPromise = new Promise((resolve, reject) => {
                callback = (err, mysql) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(mysql);
                }
            })
            mysqlValue = config.wrapper(mysql, callback);
            delete config.wrapper;
        }

        return Promise.resolve(mysqlValue || mysqlWrapperCallbackPromise).then((mysql) => {
            this.pool = mysql.createPool(config);
            return Promise.resolve(this);
        });
    }

    getConnection() {
        return promiseCallback.apply(this.pool, ['getConnection', arguments])
            .then((_connection) => {
                return new PoolConnection(_connection);
            });
    }

    releaseConnection(connection) {
        //Use the underlying connection from the mysql-module here:
        return this.pool.releaseConnection(connection.connection);
    }

    query() {
        return promiseCallback.apply(this.pool, ['query', arguments]);
    }

    end() {
        return promiseCallback.apply(this.pool, ['end', arguments]);
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
