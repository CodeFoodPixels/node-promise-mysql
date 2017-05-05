var mysql = require('./index.js');
var connection;

mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    paramsArray: true
}).then((conn) => {
    connection = conn;

    return connection.query('SELECT 1+1 AS res;')
}).then(function(rows){
    // Logs out a list of hobbits
    console.log(rows);
    connection.end();
});