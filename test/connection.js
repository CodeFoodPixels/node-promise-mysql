'use strict';

const tap = require(`tap`);
const sinon = require(`sinon`);
const proxyquire = require(`proxyquire`);
const eventEmitter = require(`events`);
const bluebird = require(`bluebird`);

sinon.addBehavior(`callsLastArgWith`, (fake, errVal, retVal) => {
    fake.callsArgWith(fake.stub.args.length - 1, errVal, retVal);
})

let connectionProxy;

const mysqlProxy = {};

const Connection = proxyquire(`../lib/connection.js`, {
    mysql: mysqlProxy
})

function getConnection(stubs = {}, options, passConnection) {
    connectionProxy = new eventEmitter();
    mysqlProxy.createConnection = sinon.stub().returns(connectionProxy)

    connectionProxy.query = stubs.query || sinon.stub().callsLastArgWith(null, `queryPromise`).returns(`queryReturn`);
    connectionProxy.beginTransaction = stubs.beginTransaction || sinon.stub().callsLastArgWith(null, `beginTransactionPromise`).returns(`beginTransactionReturn`);
    connectionProxy.commit = stubs.commit || sinon.stub().callsLastArgWith(null, `commitPromise`).returns(`commitReturn`);
    connectionProxy.rollback = stubs.rollback || sinon.stub().callsLastArgWith(null, `rollbackPromise`).returns(`rollbackReturn`);
    connectionProxy.changeUser = stubs.changeUser || sinon.stub().callsLastArgWith(null, `changeUserPromise`).returns(`changeUserReturn`);
    connectionProxy.ping = stubs.ping || sinon.stub().callsLastArgWith(null, `pingPromise`).returns(`pingReturn`);
    connectionProxy.statistics = stubs.statistics || sinon.stub().callsLastArgWith(null, `statisticsPromise`).returns(`statisticsReturn`);
    connectionProxy.end = stubs.end || sinon.stub().callsLastArgWith(null, `endPromise`).returns(`endReturn`);
    connectionProxy.destroy = stubs.destroy || sinon.stub();
    connectionProxy.pause = stubs.pause || sinon.stub();
    connectionProxy.resume = stubs.resume || sinon.stub();
    connectionProxy.escape = stubs.escape || sinon.stub().returnsArg(0);
    connectionProxy.escapeId = stubs.escapeId || sinon.stub().returnsArg(0);
    connectionProxy.format = stubs.format || sinon.stub().returnsArg(0);
    connectionProxy.connect = stubs.connect || sinon.stub().callsArg(0);

    return new Connection(options, passConnection ? connectionProxy : undefined);
}

tap.test(`It should create a new connection`, (t) => {
    const connection = getConnection();

    connection.then((connection) => {
        t.ok(mysqlProxy.createConnection.calledOnce, `createConnection should only be called once`);
        t.ok(connectionProxy.connect.calledOnce, `connection.connect should only be called once`);

        const promiseSpec = [
            [`query`, [`test`, [`test`]]],
            [`beginTransaction`, []],
            [`commit`, []],
            [`rollback`, []],
            [`changeUser`, [{user: `test`}]],
            [`ping`, []],
            [`statistics`, [{option: `test`}]],
            [`end`, []]
        ];

        promiseSpec.forEach((s) => {
            t.test(`connection.${s[0]} should call the underlying ${s[0]} method with the correct arguments`, (t) => {
                connection[s[0]](...s[1]).then(() => {
                    t.ok(connectionProxy[s[0]].calledOnce, `underlying ${s[0]} method called`)
                    t.equal(
                        connectionProxy[s[0]].lastCall.args.length,
                        s[1].length + 1,
                        `underlying ${s[0]} called with correct number of arguments`
                    );
                    t.ok(connectionProxy[s[0]].calledWith(...s[1]));
                    t.end();
                });
            });
        });

        const callSpec = [
            [`destroy`, []],
            [`pause`, []],
            [`resume`, []],
            [`escape`, [`test`]],
            [`escapeId`, [`testId`]]
        ];

        callSpec.forEach((s) => {
            t.test(`connection.${s[0]} should call the underlying ${s[0]} method with the correct arguments`, (t) => {
                connection[s[0]](...s[1]);
                t.ok(connectionProxy[s[0]].calledOnce, `underlying ${s[0]} method called`)
                t.equal(
                    connectionProxy[s[0]].lastCall.args.length,
                    s[1].length,
                    `underlying ${s[0]} called with correct number of arguments`
                );
                t.ok(connectionProxy[s[0]].calledWith(...s[1]));
                t.end();
            });
        });

        t.test(`connection.format should call the underlying format method with the correct arguments`, (t) => {
            const value = connection.format(`test`, `test2`);
            t.ok(connectionProxy.format.calledOnce, `underlying format method called`)
            t.ok(connectionProxy.format.calledWithExactly(`test`, `test2`), `underlying format called with correct arguments`);
            t.equal(value, `test`, `returns value from underlying function`);
            t.end();
        });

        t.end();
    })
});

tap.test(`It should work with a passed connection`, (t) => {
    const connection = getConnection({}, {}, true);

    connection.then((connection) => {
        t.ok(mysqlProxy.createConnection.notCalled, `createConnection should not be called`);
        t.ok(connectionProxy.connect.notCalled, `connection.connect should not be called`);

        const promiseSpec = [
            [`query`, [`test`, [`test`]]],
            [`beginTransaction`, []],
            [`commit`, []],
            [`rollback`, []],
            [`changeUser`, [{user: `test`}]],
            [`ping`, []],
            [`statistics`, [{option: `test`}]],
            [`end`, []]
        ];

        promiseSpec.forEach((s) => {
            t.test(`connection.${s[0]} should call the underlying ${s[0]} method with the correct arguments`, (t) => {
                connection[s[0]](...s[1]).then(() => {
                    t.ok(connectionProxy[s[0]].calledOnce, `underlying ${s[0]} method called`)
                    t.equal(
                        connectionProxy[s[0]].lastCall.args.length,
                        s[1].length + 1,
                        `underlying ${s[0]} called with correct number of arguments`
                    );
                    t.ok(connectionProxy[s[0]].calledWith(...s[1]));
                    t.end();
                })
            });
        });

        const callSpec = [
            [`destroy`, []],
            [`pause`, []],
            [`resume`, []],
            [`escape`, [`test`]],
            [`escapeId`, [`testId`]]
        ];

        callSpec.forEach((s) => {
            t.test(`connection.${s[0]} should call the underlying ${s[0]} method with the correct arguments`, (t) => {
                connection[s[0]](...s[1]);
                t.ok(connectionProxy[s[0]].calledOnce, `underlying ${s[0]} method called`)
                t.equal(
                    connectionProxy[s[0]].lastCall.args.length,
                    s[1].length,
                    `underlying ${s[0]} called with correct number of arguments`
                );
                t.ok(connectionProxy[s[0]].calledWith(...s[1]));
                t.end();
            });
        });

        t.test(`connection.format should call the underlying format method with the correct arguments`, (t) => {
            const value = connection.format(`test`, `test2`);
            t.ok(connectionProxy.format.calledOnce, `underlying format method called`)
            t.ok(connectionProxy.format.calledWithExactly(`test`, `test2`), `underlying format called with correct arguments`);
            t.equal(value, `test`, `returns value from underlying function`);
            t.end();
        });

        t.end();
    })
});

tap.test(`It should return the arguments array`, (t) => {
    const connection = getConnection({}, {returnArgumentsArray: true});

    connection.then((connection) => {
        t.ok(mysqlProxy.createConnection.calledOnce, `createConnection should only be called once`);
        t.ok(connectionProxy.connect.calledOnce, `connection.connect should only be called once`);

        const promiseSpec = [
            [`query`, [`test`, [`test`]]],
            [`beginTransaction`, []],
            [`commit`, []],
            [`rollback`, []],
            [`changeUser`, [{user: `test`}]],
            [`ping`, []],
            [`statistics`, [{option: `test`}]],
            [`end`, []]
        ];

        promiseSpec.forEach((s) => {
            t.test(`connection.${s[0]} should call the underlying ${s[0]} method with the correct arguments`, (t) => {
                connection[s[0]](...s[1]).then((retVal) => {
                    t.ok(connectionProxy[s[0]].calledOnce, `underlying ${s[0]} method called`)
                    t.equal(
                        connectionProxy[s[0]].lastCall.args.length,
                        s[1].length + 1,
                        `underlying ${s[0]} called with correct number of arguments`
                    );
                    t.same(
                        retVal,
                        [`${s[0]}Promise`, `${s[0]}Return`],
                        `returns arguments array`
                    );
                    t.ok(connectionProxy[s[0]].calledWith(...s[1]));
                    t.end();
                });
            });
        });

        t.end();
    })
});

tap.test(`it should reconnect if specific error events are fired`, (t) => {
    t.test(`PROTOCOL_CONNECTION_LOST`, (t) => {
        const connection = getConnection();

        connection.then((connection) => {
            connectionProxy.emit(`error`, {code: `PROTOCOL_CONNECTION_LOST`});
            t.ok(mysqlProxy.createConnection.calledTwice, `createConnection should be called`);
            t.ok(connectionProxy.connect.calledTwice, `connection.connect should be called`);
            t.end();
        });
    });

    t.test(`ECONNRESET`, (t) => {
        const connection = getConnection();

        connection.then((connection) => {
            connectionProxy.emit(`error`, {code: `ECONNRESET`});
            t.ok(mysqlProxy.createConnection.calledTwice, `createConnection should be called`);
            t.ok(connectionProxy.connect.calledTwice, `connection.connect should be called`);
            t.end();
        });
    });

    t.test(`PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR`, (t) => {
        const connection = getConnection();

        connection.then((connection) => {
            connectionProxy.emit(`error`, {code: `PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR`});
            t.ok(mysqlProxy.createConnection.calledTwice, `createConnection should be called`);
            t.ok(connectionProxy.connect.calledTwice, `connection.connect should be called`);
            t.end();
        });
    });

    t.end();
});

tap.test(`it should ignore any other errors`, (t) => {
    const connection = getConnection();

    connection.then((connection) => {
        connectionProxy.emit(`error`, {code: `FAAAAAKE`});
        t.ok(mysqlProxy.createConnection.calledOnce, `createConnection should only be called for the first connection`);
        t.ok(connectionProxy.connect.calledOnce, `connection.connect should only be called for the first connection`);
        t.end();
    });
});

tap.test(`it should reject if connection.connect errors`, (t) => {
    const expectedError = new Error(`error`);
    const connection = getConnection({
        connect: sinon.stub().callsArgWith(0, expectedError)
    });

    t.rejects(connection, expectedError, 'rejects with expected error');
    t.end();
});

tap.test(`it should allow you to wrap mysql`, (t) => {
    t.test(`returning a value`, (t) => {
        const wrappedConnectionProxy = new eventEmitter();
        wrappedConnectionProxy.connect = sinon.stub().callsArg(0);
        const wrappedMysqlProxy = {
            createConnection: sinon.stub().returns(wrappedConnectionProxy)
        };

        const connection = getConnection({}, {
            wrapper: (mysql) => {
                t.equal(mysql, mysqlProxy, `proxy should be passed to the wrapper`);
                return wrappedMysqlProxy;
            }
        });

        connection.then((connection) => {
            t.ok(wrappedMysqlProxy.createConnection.calledOnce, `createConnection should only be called for the first connection`);
            t.ok(wrappedConnectionProxy.connect.calledOnce, `connection.connect should only be called for the first connection`);
            t.end();
        });
    });

    t.test(`returning a promise`, (t) => {
        const wrappedConnectionProxy = new eventEmitter();
        wrappedConnectionProxy.connect = sinon.stub().callsArg(0);
        const wrappedMysqlProxy = {
            createConnection: sinon.stub().returns(wrappedConnectionProxy)
        };

        const connection = getConnection({}, {
            wrapper: (mysql) => {
                t.equal(mysql, mysqlProxy, `proxy should be passed to the wrapper`);
                return bluebird.resolve(wrappedMysqlProxy);
            }
        });

        connection.then((connection) => {
            t.ok(wrappedMysqlProxy.createConnection.calledOnce, `createConnection should only be called for the first connection`);
            t.ok(wrappedConnectionProxy.connect.calledOnce, `connection.connect should only be called for the first connection`);
            t.end();
        });
    });

    t.test(`returning a rejected promise`, (t) => {
        const wrappedConnectionProxy = new eventEmitter();
        wrappedConnectionProxy.connect = sinon.stub().callsArg(0);
        const wrappedMysqlProxy = {
            createConnection: sinon.stub().returns(wrappedConnectionProxy)
        };

        const connection = getConnection({}, {
            wrapper: (mysql) => {
                t.equal(mysql, mysqlProxy, `proxy should be passed to the wrapper`);
                return bluebird.reject(`faaaaaaail`);
            }
        });

        connection.catch((err) => {
            t.ok(err, `faaaaaaail`, `The connection should be rejected with the error`);
            t.end();
        });
    });

    t.test(`calling the callback`, (t) => {
        const wrappedConnectionProxy = new eventEmitter();
        wrappedConnectionProxy.connect = sinon.stub().callsArg(0);
        const wrappedMysqlProxy = {
            createConnection: sinon.stub().returns(wrappedConnectionProxy)
        };

        const connection = getConnection({}, {
            wrapper: (mysql, callback) => {
                t.equal(mysql, mysqlProxy, `proxy should be passed to the wrapper`);
                callback(null, wrappedMysqlProxy);
            }
        });

        connection.then((connection) => {
            t.ok(wrappedMysqlProxy.createConnection.calledOnce, `createConnection should only be called for the first connection`);
            t.ok(wrappedConnectionProxy.connect.calledOnce, `connection.connect should only be called for the first connection`);
            t.end();
        });
    });

    t.test(`calling the callback with an error`, (t) => {
        const wrappedConnectionProxy = new eventEmitter();
        wrappedConnectionProxy.connect = sinon.stub().callsArg(0);
        const wrappedMysqlProxy = {
            createConnection: sinon.stub().returns(wrappedConnectionProxy)
        };

        const connection = getConnection({}, {
            wrapper: (mysql, callback) => {
                t.equal(mysql, mysqlProxy, `proxy should be passed to the wrapper`);
                callback(`faaaaaaail`);
            }
        });

        connection.catch((err) => {
            t.ok(err, `faaaaaaail`, `The connection should be rejected with the error`);
            t.end();
        });
    });

    t.end();
});
