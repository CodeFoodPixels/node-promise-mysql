# Examples

These examples run against the [test_db](https://github.com/datacharmer/test_db) dataset. It expects the database to be named `employees` and expects the root password to be `password`.

To run a docker container with this data and bound to the correct port, you can run the following:

```
docker run -p 3306:3306 --name mysql_container -e MYSQL_ROOT_PASSWORD=password -d genschsa/mysql-employees
```

### Typecript

In the `typescript` folder there are the equivalent examples. In order to run them you can use `npm run ts-node` followed by the path of the file. So for example you can run `npm run ts-node ./examples/connection/typescript/query`

### Note

I am using `ts-node` in order to avoid including a bundler. If you try to compile the typescript files to javascript using ithe `outDir` option in `tsconfig` then you will get import errors beacuse we are pulling the `index` file form the root of the project.
