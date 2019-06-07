Examples
==================

These examples run against the [test_db](https://github.com/datacharmer/test_db) dataset. It expects the database to be named `employees` and expects the root password to be `password`.

To run a docker container with this data and bound to the correct port, you can run the following:

```
docker run -p 3306:3306 --name mysql_container -e MYSQL_ROOT_PASSWORD=password -d genschsa/mysql-employees
```
