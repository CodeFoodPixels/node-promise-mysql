import * as mysql from 'mysql';
import * as Bluebird from 'bluebird';

export function createConnection(connectionUri: string | ConnectionConfig): Bluebird<Connection>;

export function createPool(config: PoolConfig | string): Bluebird<Pool>;

export function createPoolCluster(config: mysql.PoolClusterConfig): Bluebird<PoolCluster>;

export { Types, escape, escapeId, format, ConnectionOptions, PoolClusterConfig, MysqlError } from 'mysql';

export type mysqlModule = typeof mysql;

export interface ConnectionConfig extends mysql.ConnectionConfig {
    mysqlWrapper?: (mysql: mysqlModule, callback: (err: Error | null, success?: mysqlModule) => void) => mysqlModule | Promise<mysqlModule> | void;
    returnArgumentsArray?: boolean;
    reconnect?: boolean;
}

export interface PoolConfig extends mysql.PoolConfig {
    mysqlWrapper?: (mysql: mysqlModule, callback: (err: Error | null, success?: mysqlModule) => void) => mysqlModule | Promise<mysqlModule> | void;
    returnArgumentsArray?: boolean;
    reconnect?: boolean;
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
}

export interface Pool {
    getConnection(): Bluebird<PoolConnection>;

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

export interface PoolCluster {
    config: mysql.PoolClusterConfig;

    add(config: PoolConfig): void;

    add(id: string, config: PoolConfig): void;

    end(): Bluebird<void>;

    of(pattern: string, selector?: string): Pool;
    of(pattern: undefined | null | false, selector: string): Pool;

    /**
     * remove all pools which match pattern
     */
    remove(pattern: string): void;

    getConnection(pattern?: string, selector?: string): Bluebird<PoolConnection>;

    /**
     * Set handler to be run on a certain event.
     */
    on(ev: string, callback: (...args: any[]) => void): PoolCluster;

    /**
     * Set handler to be run when a node is removed or goes offline.
     */
    on(ev: 'remove' | 'offline', callback: (nodeId: string) => void): PoolCluster;
}
