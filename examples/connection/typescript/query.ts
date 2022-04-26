import * as mysql from '../../../index';
import { Employee } from './employee';

async function run() {
    let connection: mysql.Connection;

    mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees'
    }).then((conn) => {
        connection = conn;

        return connection.query<Employee[]>('select * from employees limit 0, 10');
    }).then((employees) => {
        employees.forEach(employee => {
            console.log(`The employee with the employee number ${employee.emp_no} is ${employee.first_name} ${employee.last_name}`);
        });
    
        connection.end();
    })
}

async function runAwait() {
    const connection = await mysql.createConnection({
        user: 'root',
        password: 'password',
        database: 'employees'
    });

    const employees = await connection.query<Employee[]>('select * from employees limit 0, 10');

    employees.forEach(employee => {
        console.log(`The employee with the employee number ${employee.emp_no} is ${employee.first_name} ${employee.last_name}`);
    });

    connection.end();
}

run();
runAwait();
