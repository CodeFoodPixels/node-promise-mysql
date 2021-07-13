'use strict';

const tap = require(`tap`);
const sinon = require(`sinon`);
const proxyquire = require(`proxyquire`);

sinon.addBehavior(`callsLastArgWith`, (fake, errVal, retVal) => {
    fake.callsArgWith(fake.stub.args.length - 1, errVal, retVal);
});

const constructorSpy = sinon.spy();
const connectionMock = {
    release: sinon.stub().returns(`releaseReturn`),
    destroy: sinon.stub().returns(`destroyReturn`)
};

const poolConnection = proxyquire(`../lib/poolConnection.js`, {
    './connection.js': class Connection {
        constructor(_connection) {
            constructorSpy(_connection);
            this.connection = connectionMock;
        }
    }
});

tap.beforeEach(() => {
    constructorSpy.resetHistory();
    connectionMock.release.resetHistory();
    connectionMock.destroy.resetHistory();
});

tap.test(`constructor is called`, (t) => {
    t.test(`without arguments`, (t) => {
        new poolConnection();

        t.ok(constructorSpy.calledOnce, `constructor is called once`);
        t.ok(constructorSpy.calledWith(undefined), `constructor is called with no arguments`);
        t.end();
    });

    t.test(`with arguments`, (t) => {
        new poolConnection(`badger`);

        t.ok(constructorSpy.calledOnce, `constructor is called once`);
        t.ok(constructorSpy.calledWith(`badger`), `constructor is called with no arguments`);
        t.end();
    });

    t.end();
});

tap.test(`calls the underlying methods`, (t) => {
    const connection = new poolConnection();

    const callSpec = [
        {method: `release`, args: []},
        {method: `destroy`, args: []}
    ];

    callSpec.forEach((spec) => {
        t.test(`connection.${spec.method} should call the underlying ${spec.method} method with the correct arguments`, (t) => {
            connection[spec.method](...spec.args)
            t.ok(connectionMock[spec.method].calledOnce, `underlying ${spec.method} method called`)
            t.equal(
                connectionMock[spec.method].lastCall.args.length,
                spec.args.length,
                `underlying ${spec.method} called with correct number of arguments`
            );
            t.ok(connectionMock[spec.method].calledWith(...spec.args));
            t.end();
        });
    });

    t.end();
})


