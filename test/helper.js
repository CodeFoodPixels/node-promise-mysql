'use strict';

const tap = require(`tap`);
const sinon = require(`sinon`);
const helper = require(`../lib/helper.js`);

tap.test(`promiseCallback returns a promise and calls the defined function`, (t) => {
    const callback = sinon.stub()
    const promiseCallback = helper.promiseCallback.apply({
        test: sinon.stub().callsArgWith(0, undefined, `passed`)
    },
    [ `test`, [] ]);

    t.ok(promiseCallback.then, `promise has been returned`);

    t.resolveMatch(promiseCallback, `passed`, `promise resolves to expected value`)
    t.end();
});

tap.test(`promiseCallback resolves the promise to an array if returnArgumentsArray is true`, (t) => {
    const callback = sinon.stub()
    const promiseCallback = helper.promiseCallback.apply({
        test: sinon.stub().callsArgWith(0, undefined, 1, 2, 3).returns('returnValue')
    }, [ `test`, [], true ]);

    t.ok(promiseCallback.then, `promise has been returned`);

    promiseCallback.then((value) => {
        t.matchSnapshot(value, `promise resolves to an array`);
        t.end();
    })


});

tap.test(`promiseCallback rejects the promise when there's an error`, (t) => {
    const callback = sinon.stub()
    const promiseCallback = helper.promiseCallback.apply({
        test: sinon.stub().callsArgWith(0, `fail`)
    }, [
        `test`, []
    ]);

    t.ok(promiseCallback.then, `promise has been returned`);

    t.rejects(promiseCallback, `fail`, `promise rejects with expected value`)
    t.end();
})
