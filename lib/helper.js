'use strict';

const Promise = require('bluebird');

module.exports = {
    promiseCallback: function(functionName, params, paramsArray = false) {
        params = Array.prototype.slice.call(params, 0);
        return new Promise((resolve, reject) => {
            params.push(function(err) {
                const args = Array.prototype.slice.call(arguments, 1);

                if (err) {
                    return reject(err);
                }

                if (paramsArray) {
                    args.push(call);
                    return resolve(args)
                }

                return resolve(args[0]);
            });

            const call = this[functionName].apply(this, params);
        });
    }
};
