var promiseCallback = function(functionName, params){
    var self = this;
    params = Array.prototype.slice.call(params, 0);
    return new Promise(function(resolve, reject){
        if (self.err) {
            return reject(self.err);
        }
        params.push(function(err){
            var args = Array.prototype.slice.call(arguments, 1);
            if (err) {
                return reject(err);
            }
            return resolve.apply(this, args);
        })
        self[functionName].apply(self, params);
    });
}

module.exports = promiseCallback;
