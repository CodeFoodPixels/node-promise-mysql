'use strict';

const Promise = require('bluebird');

module.exports = {
    promiseCallback: function(functionName, params) {
        params = Array.prototype.slice.call(params, 0);
        return new Promise((resolve, reject) => {
            params.push(function(err) {
                const args = Array.prototype.slice.call(arguments, 1);

                if (err) {
                    return reject(err);
                }

                return resolve.apply(this, args);
            });

            this[functionName].apply(this, params);
        });
    }
};
