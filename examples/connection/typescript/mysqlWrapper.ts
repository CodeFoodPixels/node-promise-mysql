import Bluebird from 'bluebird';
import * as mysql from '../../../index';

async function runReturn() {
    const connection = await mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees',
        mysqlWrapper: (mysqlInstance: mysql.mysqlModule) => wrapMysql(mysqlInstance, 'runReturn')
    });

    connection.end();
}

async function runPromise() {
    const connection = await mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees',
        mysqlWrapper: (mysqlInstance: mysql.mysqlModule) => Bluebird.resolve(wrapMysql(mysqlInstance, 'runPromise')) as unknown as Promise<mysql.mysqlModule>
    });

    connection.end();
}

async function runCallback() {
    const connection = await mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees',
        mysqlWrapper: (mysqlInstance: mysql.mysqlModule, callback) => callback?.(null, wrapMysql(mysqlInstance, 'runCallback'))
    });

    connection.end();
}

runReturn();
runPromise();
runCallback();


function wrapMysql(mysqlInstance: mysql.mysqlModule, fnName: string) {
    const createConnection = mysqlInstance.createConnection;

    mysqlInstance.createConnection = function (...args) {
        console.log(`createConnection called in ${fnName}!`);

        mysqlInstance.createConnection = createConnection;

        return createConnection(...args);
    }

    return mysqlInstance;
}
