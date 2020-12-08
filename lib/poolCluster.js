'use strict';

const Promise = require('bluebird');
const mysql = require('mysql');
const Pool = require('./pool');
const PoolConnection = require('./poolConnection.js');
const promiseCallback = require('./helper').promiseCallback;

class poolCluster {
    constructor(config = {}) {
        if (config.returnArgumentsArray) {
            this.returnArgumentsArray = config.returnArgumentsArray;
            config.returnArgumentsArray = undefined;
        }

        return Promise.resolve(mysql).then((mysql) => {
            this.poolCluster = mysql.createPoolCluster(config);
            return Promise.resolve(this);
        });
    }
    
    add(id, config) {
        return this.poolCluster.add(id, config);
    }

    end() {
        return promiseCallback.apply(this.poolCluster, ['end', arguments, this.returnArgumentsArray]);
    }

    of(pattern, selector) {
        const pool = this.poolCluster.of(pattern, selector);
        return new Pool(undefined, pool);
    }

    remove(pattern) {
        return this.poolCluster.remove(pattern);
    }

    getConnection() {
        return promiseCallback.apply(this.poolCluster, ['getConnection', arguments, this.returnArgumentsArray])
            .then((_connection) => {
                const config = {
                    reconnect: false
                };

                return new PoolConnection(config, _connection);
            });
    }

    on(event, fn) {
        return this.poolCluster.on(event, fn);
    }
}

module.exports = poolCluster;
