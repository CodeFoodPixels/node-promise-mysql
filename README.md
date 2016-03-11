Promise-mysql
==================
[![Build Status](https://travis-ci.org/lukeb-uk/node-promise-mysql.svg?style=flat&branch=master)](https://travis-ci.org/lukeb-uk/node-promise-mysql?branch=master)

Promise-mysql is a wrapper for [node-mysql](https://github.com/felixge/node-mysql) that wraps function calls with [Bluebird](https://github.com/petkaantonov/bluebird/) promises. Usually this would be done with Bluebird's `.promisifyAll()` method, but node-mysql's footprint is different to that of what Bluebird expects.

To install promise-mysql, use [npm](http://github.com/isaacs/npm):

```bash
$ npm install promise-mysql
```

Please refer to [node-mysql](https://github.com/felixge/node-mysql) for documentation on how to use the mysql functions and refer to [Bluebird](https://github.com/petkaantonov/bluebird/) for documentation on Bluebird's promises

At the minute only the standard connection (using `.createConnection()`) and the pool (using `.createPool()`) is supported. `createPoolCluster` is not implemented yet.

## Examples

### Connection

To connect, you simply call `.createConnection()` like you would on node-mysql:
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
});
```

To use the promise, you call the methods as you would if you were just using node-mysql, minus the callback. You then add a .then() with your function in:
```javascript
connection.query('select `name` from hobbits').then(function(rows){
    // Logs out a list of hobbits
    console.log(rows);
});
```

You can even chain the promises, using a return within the .then():
```javascript
connection.query('select `id` from hobbits where `name`="frodo"').then(function(rows){
    // Query the items for a ring that Frodo owns.
    return connection.query('select * from items where `owner`="' + rows[0].id + '" and `name`="ring"');
}).then(function(rows){
    // Logs out a ring that Frodo owns
    console.log(rows);
});
```

You can catch errors using the .catch() method. You can still add .then() clauses, they'll just get skipped if there's an error
```javascript
connection.query('select * from tablethatdoesnotexist').then(function(){

    return connection.query('select * from hobbits');
}).catch(function(error){
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

## Tests

At the moment only simple basics tests are implemented using Mocha.
To run the tests, you need to connect to a running MySQL server. A database or write permissions are not required.

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
