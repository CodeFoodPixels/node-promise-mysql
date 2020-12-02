import * as mysql from 'mysql';
import * as Bluebird from 'bluebird';

export function createConnection(connectionUri: string | mysql.ConnectionConfig): Bluebird<Connection>;

export function createPool(config: mysql.PoolConfig | string): Bluebird<Pool>;

export { Types, escape, escapeId, format, ConnectionOptions, MysqlError } from 'mysql';

export type mysqlModule = typeof mysql;

export interface ConnectionConfig extends mysql.ConnectionConfig {
    mysqlWrapper?: (mysql: mysqlModule, callback: (err: Error | null, success?: mysqlModule) => void) => mysqlModule | Promise<mysqlModule> | void;
}

export interface PoolConfig extends mysql.PoolConfig {
    mysqlWrapper?: (mysql: mysqlModule, callback: (err: Error | null, success?: mysqlModule) => void) => mysqlModule | Promise<mysqlModule> | void;
}

export interface QueryFunction<T> {
    (query: mysql.Query | string | mysql.QueryOptions): T;

    (options: string, values: any): T;
}

export interface Connection {
    query: QueryFunction<Bluebird<any>>;

    beginTransaction(options?: mysql.QueryOptions): Bluebird<void>;

    commit(options?: mysql.QueryOptions): Bluebird<void>;

    rollback(options?: mysql.QueryOptions): Bluebird<void>;

    changeUser(options?: mysql.ConnectionOptions): Bluebird<void>;

    ping(options?: mysql.QueryOptions): Bluebird<void>;

    queryStream: QueryFunction<mysql.Query>

    statistics(options?: mysql.QueryOptions): Bluebird<void>;

    end(options?: mysql.QueryOptions): Bluebird<void>;

    destroy(): void;

    pause(): void;

    resume(): void;

    escape(value: any, stringifyObjects?: boolean, timeZone?: string): string;

    escapeId(value: string, forbidQualified?: boolean): string;

    format(sql: string, values: any[], stringifyObjects?: boolean, timeZone?: string): string;

    on(ev: 'error', callback: (err: mysql.MysqlError) => void): void;

    on(ev: 'end', callback: () => void): void;
}

export interface PoolConnection extends Connection {
    release(): any;

    destroy(): any;
}

export interface Pool {
    getConnection(): Bluebird<PoolConnection>;

    releaseConnection(connection: PoolConnection): void;

    query: QueryFunction<Bluebird<any>>;

    end(options?: mysql.QueryOptions): Bluebird<void>;

    release(options?: mysql.QueryOptions): Bluebird<void>;

    escape(value: any, stringifyObjects?: boolean, timeZone?: string): string;

    escapeId(value: string, forbidQualified?: boolean): string;

    on(ev: 'connection' | 'acquire' | 'release', callback: (connection: mysql.PoolConnection) => void): mysql.Pool;

    on(ev: 'error', callback: (err: mysql.MysqlError) => void): mysql.Pool;

    on(ev: 'enqueue', callback: (err?: mysql.MysqlError) => void): mysql.Pool;

    on(ev: string, callback: (...args: any[]) => void): mysql.Pool;
}
