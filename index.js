var Connection = require('./lib/connection.js');
var mysql = require('mysql');

exports.createConnection = function(config){
    return new Connection(config);
}

exports.Types = mysql.Types;
exports.escape = mysql.escape;
exports.escapeId = mysql.escapeId;
exports.format = mysql.format;
