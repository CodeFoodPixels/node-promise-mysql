'use strict';

const tap = require(`tap`);
const sinon = require(`sinon`);
const proxyquire = require(`proxyquire`);

sinon.addBehavior(`callsLastArgWith`, (fake, errVal, retVal) => {
    fake.callsArgWith(fake.stub.args.length - 1, errVal, retVal);
});

const constructorSpy = sinon.spy();
const connectionMock = {
    release: sinon.stub().callsLastArgWith(null, `releasePromise`).returns(`releaseReturn`),
    destroy: sinon.stub().callsLastArgWith(null, `destroyPromise`).returns(`destroyReturn`)
};

const poolConnection = proxyquire(`../lib/poolConnection.js`, {
    './connection.js': class Connection {
        constructor(_connection) {
            constructorSpy(_connection);
            this.connection = connectionMock;
        }
    }
});

tap.beforeEach((done) => {
    constructorSpy.resetHistory();
    connectionMock.release.resetHistory();
    connectionMock.destroy.resetHistory();
    done();
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

    const promiseSpec = [
        [`release`, []],
        [`destroy`, []]
    ];

    promiseSpec.forEach((s) => {
        t.test(`connection.${s[0]} should call the underlying ${s[0]} method with the correct arguments`, (t) => {
            connection[s[0]](...s[1]).then(() => {
                t.ok(connectionMock[s[0]].calledOnce, `underlying ${s[0]} method called`)
                t.equal(
                    connectionMock[s[0]].lastCall.args.length,
                    s[1].length + 1,
                    `underlying ${s[0]} called with correct number of arguments`
                );
                t.ok(connectionMock[s[0]].calledWith(...s[1]));
                t.end();
            });
        });
    });

    t.end();
})


