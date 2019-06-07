const mysql = require('../../index.js');

function run() {
    mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees'
    }).then((connection) => {
        const employees = connection.queryStream('select * from employees limit 0, 10');

        employees.on('result', (employee) => {
            console.log(`The employee with the employee number ${employee.emp_no} is ${employee.first_name} ${employee.last_name}`);
        });

        employees.on('end', () => {
            connection.end();
        })
    });
}

async function runAwait() {
    const connection = await mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees'
    });

    const employees = connection.queryStream('select * from employees limit 0, 10');

    employees.on('result', (employee) => {
        console.log(`The employee with the employee number ${employee.emp_no} is ${employee.first_name} ${employee.last_name}`);
    });

    employees.on('end', () => {
        connection.end();
    })
}

run();
runAwait();
