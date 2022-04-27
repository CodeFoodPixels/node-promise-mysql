# Examples

These examples run against the [test_db](https://github.com/datacharmer/test_db) dataset. It expects the database to be named `employees` and expects the root password to be `password`.

To run a docker container with this data and bound to the correct port, you can run the following:

```
docker run -p 3306:3306 --name mysql_container -e MYSQL_ROOT_PASSWORD=password -d genschsa/mysql-employees
```

### Typescript

In the `typescript` folder there is a sample project with the examples that demostrate how this library would be used in a typescript project. In order to run them you need to navigate in the project's folder and then install the npm packages with `npm install` and then you can use `npm run ts-node` followed by the name of the file. So for example you can run `npm run ts-node .src/query.ts`

### Note

These examples are using `ts-node` in order to avoid including a bundler. If you try to compile the typescript files to javascript using the `outDir` option in `tsconfig` then you will get import errors because we are pulling the `index` file form the root.
