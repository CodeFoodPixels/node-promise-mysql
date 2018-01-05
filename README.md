Promise-mysql
==================
[![Build Status](https://travis-ci.org/lukeb-uk/node-promise-mysql.svg?style=flat&branch=master)](https://travis-ci.org/lukeb-uk/node-promise-mysql?branch=master)

Promise-mysql is a wrapper for [mysqljs/mysql](https://github.com/mysqljs/mysql) that wraps function calls with [Bluebird](https://github.com/petkaantonov/bluebird/) promises. Usually this would be done with Bluebird's `.promisifyAll()` method, but mysqljs/mysql's footprint is different to that of what Bluebird expects.

To install promise-mysql, use [npm](http://github.com/isaacs/npm):

```bash
$ npm install promise-mysql
```

Please refer to [mysqljs/mysql](https://github.com/mysqljs/mysql) for documentation on how to use the mysql functions and refer to [Bluebird](https://github.com/petkaantonov/bluebird/) for documentation on Bluebird's promises

At the minute only the standard connection (using `.createConnection()`) and the pool (using `.createPool()`) is supported. `createPoolCluster` is not implemented yet.

## Examples

### Connection

**Important note: don't forget to call connection.end() when you're finished otherwise the Node process won't finish**

To connect, you simply call `.createConnection()` like you would on mysqljs/mysql:
```javascript
var mysql = require('promise-mysql');

mysql.createConnection({
    host: 'localhost',
    user: 'sauron',
    password: 'theonetruering',
    database: 'mordor'
}).then(function(conn){
    // do stuff with conn
    conn.end();
});
```

To use the promise, you call the methods as you would if you were just using mysqljs/mysql, minus the callback. You then add a .then() with your function in:
```javascript
var mysql = require('promise-mysql');

mysql.createConnection({
    host: 'localhost',
    user: 'sauron',
    password: 'theonetruering',
    database: 'mordor'
}).then(function(conn){
    var result = conn.query('select `name` from hobbits');
    conn.end();
    return result;
}).then(function(rows){
    // Logs out a list of hobbits
    console.log(rows);
});
```

You can even chain the promises, using a return within the .then():
```javascript
var mysql = require('promise-mysql');
var connection;

mysql.createConnection({
    host: 'localhost',
    user: 'sauron',
    password: 'theonetruering',
    database: 'mordor'
}).then(function(conn){
    connection = conn;
    return connection.query('select `id` from hobbits where `name`="frodo"');
}).then(function(rows){
    // Query the items for a ring that Frodo owns.
    var result = connection.query('select * from items where `owner`="' + rows[0].id + '" and `name`="ring"');
    connection.end();
    return result;
}).then(function(rows){
    // Logs out a ring that Frodo owns
    console.log(rows);
});
```

You can catch errors using the .catch() method. You can still add .then() clauses, they'll just get skipped if there's an error
```javascript
var mysql = require('promise-mysql');
var connection;

mysql.createConnection({
    host: 'localhost',
    user: 'sauron',
    password: 'theonetruering',
    database: 'mordor'
}).then(function(conn){
    connection = conn;
    return connection.query('select * from tablethatdoesnotexist');
}).then(function(){
    var result = connection.query('select * from hobbits');
    connection.end();
    return result;
}).catch(function(error){
    if (connection && connection.end) connection.end();
    //logs out the error
    console.log(error);
});

```

### Pool

Use pool directly:

```javascript
pool = mysql.createPool({
  host: 'localhost',
  user: 'sauron',
  password: 'theonetruering',
  database: 'mordor',
  connectionLimit: 10
});

pool.query('select `name` from hobbits').then(function(rows){
    // Logs out a list of hobbits
    console.log(rows);
});

```

Get a connection from the pool:

```javascript
pool.getConnection().then(function(connection) {
    connection.query('select `name` from hobbits').then(...)
}).catch(function(err) {
    done(err);
});
```

#### Using/Disposer Pattern with Pool
Example implementing a using/disposer pattern using Bluebird's built-in `using` and `disposer` functions.

databaseConnection.js:
```javascript
var mysql = require('promise-mysql');

pool = mysql.createPool({
  host: 'localhost',
  user: 'sauron',
  password: 'theonetruering',
  database: 'mordor',
  connectionLimit: 10
});

function getSqlConnection() {
  return pool.getConnection().disposer(function(connection) {
    pool.releaseConnection(connection);
  });
}

module.exports = getSqlConnection;
```

sqlQuery.js:
```javascript
var Promise = require("bluebird");
var getSqlConnection = require('./databaseConnection');
Promise.using(getSqlConnection(), function(connection) {
    return connection.query('select `name` from hobbits').then(function(rows) {
      return console.log(rows);
    }).catch(function(error) {
      console.log(error);
    });
})
```


## Tests

At the moment only simple basics tests are implemented using Mocha.
To run the tests, you need to connect to a running MySQL server. A database or write permissions are not required.

If you have docker, you can run a docker container bound to the mysql port with the command:
```bash
docker run -p 3306:3306 --name mysql_container -e MYSQL_ROOT_PASSWORD=password -d mysql
```

Start the test suite with

```bash
DB_HOST=localhost DB_USER=user DB_PWD=pwd npm test
```

## License

The MIT License (MIT)

Copyright (c) 2014 Luke Bonaccorsi

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
