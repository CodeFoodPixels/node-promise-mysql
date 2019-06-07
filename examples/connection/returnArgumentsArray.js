const mysql = require('../../index.js');

function run() {
    let connection;

    mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees',
        returnArgumentsArray: true
    }).then((conn) => {
        connection = conn;

        return connection.query('select * from employees limit 0, 10');
    }).then(([data, fields, query]) => {
        console.log(`The SQL for the query was: ${query.sql}\n`);

        console.log(`The table 'employees' contains the following fields:`)
        fields.forEach(field => {
            console.log(`    ${field.name}`);
        })

        console.log('\nThe data retrieved was:')

        data.forEach(employee => {
            console.log(`    Employee number ${employee.emp_no}: ${employee.first_name} ${employee.last_name}`);
        });

        connection.end();
    });
}

async function runAwait() {
    const connection = await mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees',
        returnArgumentsArray: true
    });

    const [data, fields, query] = await connection.query('select * from employees limit 0, 10');

    console.log(`The SQL for the query was: ${query.sql}\n`);

    console.log(`The table 'employees' contains the following fields:`)
    fields.forEach(field => {
        console.log(`    ${field.name}`);
    })

    console.log('\nThe data retrieved was:')

    data.forEach(employee => {
        console.log(`    Employee number ${employee.emp_no}: ${employee.first_name} ${employee.last_name}`);
    });

    connection.end();
}

run();
runAwait();
