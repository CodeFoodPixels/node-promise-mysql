const mysql = require('../../index.js');

async function runReturn() {
    const connection = await mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees',
        mysqlWrapper: (mysqlInstance) => {
            return wrapMysql(mysqlInstance, 'runReturn');
        }
    });

    connection.end();
}

async function runPromise() {
    const connection = await mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees',
        mysqlWrapper: (mysqlInstance) => {
            return Promise.resolve(wrapMysql(mysqlInstance, 'runPromise'));
        }
    });

    connection.end();
}

async function runCallback() {
    const connection = await mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees',
        mysqlWrapper: (mysqlInstance, callback) => {
            callback(null, wrapMysql(mysqlInstance, 'runCallback'));
        }
    });

    connection.end();
}

runReturn();
runPromise();
runCallback();


function wrapMysql(mysql, fnName) {
    const createConnection = mysql.createConnection;

    mysql.createConnection = function () {
        console.log(`createConnection called in ${fnName}!`);

        mysql.createConnection = createConnection;

        return createConnection(...arguments);
    }

    return mysql;
}
