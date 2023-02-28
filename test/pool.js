'use strict';

const tap = require(`tap`);
const sinon = require(`sinon`);
const proxyquire = require(`proxyquire`);

sinon.addBehavior(`callsLastArgWith`, (fake, errVal, retVal) => {
    fake.callsArgWith(fake.stub.args.length - 1, errVal, retVal);
});

const poolMock = {
    getConnection: sinon.stub().callsLastArgWith(null, `getConnectionPromise`).returns(`getConnectionReturn`),
    query: sinon.stub().callsLastArgWith(null, `queryPromise`).returns(`queryReturn`),
    end: sinon.stub().callsLastArgWith(null, `endPromise`).returns(`endReturn`),
    escape: sinon.stub().returnsArg(0),
    escapeId: sinon.stub().returnsArg(0),
    on: sinon.stub().returnsArg(0)
};

const createPool = sinon.stub().returns(poolMock);

const mysqlMock = {
    createPool
};

class mockPoolConnection {
}

const pool = proxyquire(`../lib/pool.js`, {
    mysql: mysqlMock,
    './poolConnection.js': mockPoolConnection
});

tap.beforeEach(() => {
    createPool.resetHistory();
    poolMock.getConnection.resetHistory();
    poolMock.query.resetHistory();
    poolMock.end.resetHistory();
    poolMock.escape.resetHistory();
    poolMock.escapeId.resetHistory();
});

tap.test(`createPool is called`, (t) => {
    t.test(`without arguments`, (t) => {
        return new pool().then(() => {
            t.ok(createPool.calledOnce, `createPool is called once`);
            t.ok(createPool.calledWith({}), `createPool is called with no arguments`);
            t.end();
        });
    });

    t.test(`with just configuration options`, (t) => {
        const config = {
            test: "test"
        };
        return new pool(config).then(() => {
            t.ok(createPool.calledOnce, `createPool is called once`);
            t.ok(createPool.calledWith(config), `createPool is called with arguments`);
            t.end();
        });
    });

    t.test(`with a already instantiated underlying pool`, (t) => {
        const config = undefined;
        const underlyingPool = sinon.mock();
        const p = new pool(config, underlyingPool);
        t.ok(p.pool === underlyingPool, `uses the underlying pool`);
        t.ok(createPool.notCalled, `createPool is not called`);
        t.end();
    });

    t.end();
});

tap.test(`it should allow you to wrap mysql`, (t) => {
    t.test(`returning a value`, (t) => {
        const wrappedMysqlProxy = {
            createPool: sinon.stub().returns(poolMock)
        };

        return new pool({
            mysqlWrapper: (mysql) => {
                t.equal(mysql, mysqlMock, `proxy should be passed to the wrapper`);
                return wrappedMysqlProxy;
            }
        }).then(() => {
            t.ok(wrappedMysqlProxy.createPool.calledOnce, `wrapped createPool should get called`);
            t.end();
        });
    });

    t.test(`returning a promise`, (t) => {
        const wrappedMysqlProxy = {
            createPool: sinon.stub().returns(poolMock)
        };

        return new pool({
            mysqlWrapper: (mysql) => {
                t.equal(mysql, mysqlMock, `proxy should be passed to the wrapper`);
                return Promise.resolve(wrappedMysqlProxy);
            }
        }).then(() => {
            t.ok(wrappedMysqlProxy.createPool.calledOnce, `wrapped createPool should get called`);
            t.end();
        });
    });

    t.test(`returning a rejected promise`, (t) => {
        return new pool({
            mysqlWrapper: (mysql) => {
                t.equal(mysql, mysqlMock, `proxy should be passed to the wrapper`);
                return Promise.reject(`faaaaaaail`);
            }
        }).catch((err) => {
            t.ok(err, `faaaaaaail`, `The connection should be rejected with the error`);
            t.end();
        });
    });

    t.test(`calling the callback`, (t) => {
        const wrappedMysqlProxy = {
            createPool: sinon.stub().returns(poolMock)
        };

        return new pool({
            mysqlWrapper: (mysql, callback) => {
                t.equal(mysql, mysqlMock, `proxy should be passed to the wrapper`);
                callback(null, wrappedMysqlProxy);
            }
        }).then(() => {
            t.ok(wrappedMysqlProxy.createPool.calledOnce, `wrapped createPool should get called`);
            t.end();
        });
    });

    t.test(`calling the callback with an error`, (t) => {
        const wrappedMysqlProxy = {
            createPool: sinon.stub().returns(poolMock)
        };

        return new pool({
            mysqlWrapper: (mysql, callback) => {
                t.equal(mysql, mysqlMock, `proxy should be passed to the wrapper`);
                callback(`faaaaaaail`);
            }
        }).catch((err) => {
            t.ok(err, `faaaaaaail`, `The connection should be rejected with the error`);
            t.end();
        });
    });

    t.end();
});

tap.test(`calls the underlying methods`, (t) => {
    return new pool().then((pool) => {
        const callSpec = [{
                method: `escape`,
                args: [`test`]
            },
            {
                method: `escapeId`,
                args: [`test`]
            },
            {
                method: `on`,
                args: [`test`, () => {}]
            }
        ];

        callSpec.forEach((spec) => {
            t.test(`pool.${spec.method} should call the underlying ${spec.method} method with the correct arguments`, (t) => {
                pool[spec.method](...spec.args)
                t.ok(poolMock[spec.method].calledOnce, `underlying ${spec.method} method called`)
                t.equal(
                    poolMock[spec.method].lastCall.args.length,
                    spec.args.length,
                    `underlying ${spec.method} called with correct number of arguments`
                );
                t.ok(poolMock[spec.method].calledWith(...spec.args));
                t.end();
            });
        });

        const promiseSpec = [
            {
                method: `query`,
                args: [`test`, [`test`]]
            },
            {
                method: `end`,
                args: []
            }
        ];

        promiseSpec.forEach((spec) => {
            t.test(`pool.${spec.method} should call the underlying ${spec.method} method with the correct arguments`, (t) => {
                return pool[spec.method](...spec.args).then((retVal) => {
                    t.ok(poolMock[spec.method].calledOnce, `underlying ${spec.method} method called`)
                    t.equal(
                        poolMock[spec.method].lastCall.args.length,
                        spec.args.length + 1,
                        `underlying ${spec.method} called with correct number of arguments`
                    );
                    t.same(
                        retVal,
                        `${spec.method}Promise`,
                        `returns arguments`
                    );
                    t.ok(poolMock[spec.method].calledWith(...spec.args));
                    t.end();
                });
            });
        });

        t.test(`pool.getConnection should call the underlying getConnection method with the correct arguments`, (t) => {
            return pool.getConnection().then((retVal) => {
                t.ok(poolMock.getConnection.calledOnce, `underlying getConnection method called`)
                t.equal(
                    poolMock.getConnection.lastCall.args.length,
                    1,
                    `underlying getConnection called with correct number of arguments`
                );
                t.ok(retVal instanceof mockPoolConnection);
                t.end();
            });
        });

        t.end();
    });
})

tap.test(`returns an argument array`, (t) => {
    return new pool({returnArgumentsArray: true}).then((pool) => {

        const promiseSpec = [{
                method: `query`,
                args: [`test`, [`test`]]
            },
            {
                method: `end`,
                args: []
            }
        ];

        promiseSpec.forEach((spec) => {
            t.test(`pool.${spec.method} should call the underlying ${spec.method} method with the correct arguments`, (t) => {
                return pool[spec.method](...spec.args).then((retVal) => {
                    t.ok(poolMock[spec.method].calledOnce, `underlying ${spec.method} method called`)
                    t.equal(
                        poolMock[spec.method].lastCall.args.length,
                        spec.args.length + 1,
                        `underlying ${spec.method} called with correct number of arguments`
                    );
                    t.same(
                        retVal,
                        [`${spec.method}Promise`, `${spec.method}Return`],
                        `returns arguments array`
                    );
                    t.ok(poolMock[spec.method].calledWith(...spec.args));
                    t.end();
                });
            });
        });

        t.end();
    });
})
