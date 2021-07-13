'use strict';

const tap = require(`tap`);
const sinon = require(`sinon`);
const proxyquire = require(`proxyquire`);

sinon.addBehavior(`callsLastArgWith`, (fake, errVal, retVal) => {
    fake.callsArgWith(fake.stub.args.length - 1, errVal, retVal);
});

const poolClusterMock = {
    add: sinon.stub().returnsArg(0),
    remove: sinon.stub().returnsArg(0),
    getConnection: sinon.stub().callsLastArgWith(null, `getConnectionPromise`).returns(`getConnectionReturn`),
    of: sinon.stub().returns(`pool`),
    end: sinon.stub().callsLastArgWith(null, `endPromise`).returns(`endReturn`),
    on: sinon.stub().returnsArg(0),
};

const createPoolCluster = sinon.stub().returns(poolClusterMock);

const mysqlMock = {
    createPoolCluster
};

class mockPool {
}

class mockPoolConnection {
}

const poolCluster = proxyquire(`../lib/poolCluster.js`, {
    mysql: mysqlMock,
    './pool.js': mockPool,
    './poolConnection.js': mockPoolConnection
});

tap.beforeEach(() => {
    createPoolCluster.resetHistory();
    poolClusterMock.add.resetHistory();
    poolClusterMock.remove.resetHistory();
    poolClusterMock.getConnection.resetHistory();
    poolClusterMock.of.resetHistory();
    poolClusterMock.end.resetHistory();
    poolClusterMock.on.resetHistory();
});

tap.test(`createPool is called`, (t) => {
    t.test(`without arguments`, (t) => {
        return new poolCluster().then(() => {
            t.ok(createPoolCluster.calledOnce, `createPoolCluster is called once`);
            t.ok(createPoolCluster.calledWith({}), `createPoolCluster is called with no arguments`);
            t.end();
        });
    });

    t.test(`with configuration options`, (t) => {
        const config = {
            test: "test"
        };
        return new poolCluster(config).then(() => {
            t.ok(createPoolCluster.calledOnce, `createPoolCluster is called once`);
            t.ok(createPoolCluster.calledWith(config), `createPoolCluster is called with arguments`);
            t.end();
        });
    });

    t.end();
});

tap.test(`calls the underlying methods`, (t) => {
    return new poolCluster().then((poolCluster) => {
        const callSpec = [
            {
                method: `add`,
                args: [`test`, undefined],
            },
            {
                method: `add`,
                args: [`identifier`, `test`],
            },
            {
                method: `remove`,
                args: [`test`],
            },
            {
                method: `on`,
                args: [`test`, () => { }],
            }
        ];

        callSpec.forEach((spec) => {
            t.test(`poolCluster.${spec.method} should call the underlying ${spec.method} method with the correct arguments`, (t) => {
                poolCluster[spec.method](...spec.args)
                t.ok(poolClusterMock[spec.method].calledOnce, `underlying ${spec.method} method called`)
                t.equal(
                    poolClusterMock[spec.method].lastCall.args.length,
                    spec.args.length,
                    `underlying ${spec.method} called with correct number of arguments`,
                );
                t.ok(poolClusterMock[spec.method].calledWith(...spec.args));
                t.end();
            });
        });

        t.test(`poolCluster.of should call the underlying of method with the correct arguments and return a new pool object`, (t) => {
            const pattern = 'test';
            const retVal = poolCluster.of(pattern);
            t.ok(poolClusterMock.of.calledOnce, `underlying of method called`);
            t.ok(poolClusterMock.of.calledWith(pattern));
            t.ok(retVal instanceof mockPool);
            t.end();
        });

        const promiseSpec = [
            {
                method: `end`,
                args: []
            }
        ];

        promiseSpec.forEach((spec) => {
            t.test(`poolCluster.${spec.method} should call the underlying ${spec.method} method with the correct arguments`, (t) => {
                return poolCluster[spec.method](...spec.args).then((retVal) => {
                    t.ok(poolClusterMock[spec.method].calledOnce, `underlying ${spec.method} method called`)
                    t.equal(
                        poolClusterMock[spec.method].lastCall.args.length,
                        spec.args.length + 1,
                        `underlying ${spec.method} called with correct number of arguments`
                    );
                    t.same(
                        retVal,
                        `${spec.method}Promise`,
                        `returns arguments`
                    );
                    t.ok(poolClusterMock[spec.method].calledWith(...spec.args));
                    t.end();
                });
            });
        });

        t.test(`poolCluster.getConnection should call the underlying getConnection method with the correct arguments`, (t) => {
            return poolCluster.getConnection().then((retVal) => {
                t.ok(poolClusterMock.getConnection.calledOnce, `underlying getConnection method called`)
                t.equal(
                    poolClusterMock.getConnection.lastCall.args.length,
                    1,
                    `underlying getConnection called with correct number of arguments`
                );
                t.ok(retVal instanceof mockPoolConnection);
                t.end();
            });
        });
    });
});

tap.test(`returns an argument array`, (t) => {
    return new poolCluster({returnArgumentsArray: true}).then((poolCluster) => {

        const promiseSpec = [
            {
                method: `end`,
                args: []
            }
        ];

        promiseSpec.forEach((spec) => {
            t.test(`poolCluster.${spec.method} should call the underlying ${spec.method} method with the correct arguments`, (t) => {
                return poolCluster[spec.method](...spec.args).then((retVal) => {
                    t.ok(poolClusterMock[spec.method].calledOnce, `underlying ${spec.method} method called`)
                    t.equal(
                        poolClusterMock[spec.method].lastCall.args.length,
                        spec.args.length + 1,
                        `underlying ${spec.method} called with correct number of arguments`
                    );
                    t.same(
                        retVal,
                        [`${spec.method}Promise`, `${spec.method}Return`],
                        `returns arguments array`
                    );
                    t.ok(poolClusterMock[spec.method].calledWith(...spec.args));
                    t.end();
                });
            });
        });

        t.end();
    });
});
