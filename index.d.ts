import * as mysql from 'mysql';
import Bluebird from 'bluebird';

export function createConnection(connectionUri: string | ConnectionConfig): Bluebird<Connection>;

export function createPool(config: PoolConfig | string): Bluebird<Pool>;

export function createPoolCluster(config: mysql.PoolClusterConfig): Bluebird<PoolCluster>;

export { Types, escape, escapeId, format, raw, ConnectionOptions, PoolClusterConfig, MysqlError } from 'mysql';

export type mysqlModule = typeof mysql;

export type ArgumentsArray<T> = [data: T[], fields: mysql.FieldInfo[], query: Query<T>];
export interface ConnectionConfig extends mysql.ConnectionConfig {
    mysqlWrapper?: (mysql: mysqlModule, callback?: (err: Error | null, success?: mysqlModule) => void) => mysqlModule | Promise<mysqlModule> | void;
    returnArgumentsArray?: boolean;
    reconnect?: boolean;
}

export interface PoolConfig extends mysql.PoolConfig {
    mysqlWrapper?: (mysql: mysqlModule, callback: (err: Error | null, success?: mysqlModule) => void) => mysqlModule | Promise<mysqlModule> | void;
    returnArgumentsArray?: boolean;
    reconnect?: boolean;
}

export interface QueryFunction {
    <T = any>(query: mysql.Query | string | mysql.QueryOptions): Bluebird<T>;

    <T = any>(options: string, values?: any): Bluebird<T>;
}

export interface Query<T> extends mysql.Query {

    on(ev: 'result', callback: (row: T, index: number) => void): mysql.Query;

    on(ev: 'error', callback: (err: mysql.MysqlError) => void): mysql.Query;

    on(ev: 'fields', callback: (fields: mysql.FieldInfo[], index: number) => void): mysql.Query;

    on<T = any>(ev: 'packet', callback: (packet: T) => void): mysql.Query;

    on(ev: 'end', callback: () => void): mysql.Query;
}

export class Connection {
    constructor(config: string | ConnectionConfig, _connection?: Connection);

    query: QueryFunction;

    beginTransaction(options?: mysql.QueryOptions): Bluebird<void>;

    commit(options?: mysql.QueryOptions): Bluebird<void>;

    rollback(options?: mysql.QueryOptions): Bluebird<void>;

    changeUser(options?: mysql.ConnectionOptions): Bluebird<void>;

    ping(options?: mysql.QueryOptions): Bluebird<void>;

    queryStream<T = any>(options: string, values?: any): Query<T>;

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

export class PoolConnection extends Connection {
    constructor(config: ConnectionConfig, _connection?: mysql.Connection);

    release(): any;
}

export class Pool {
    constructor(config: ConnectionConfig, _pool?: mysql.Pool);

    getConnection(): Bluebird<PoolConnection>;

    query: QueryFunction;

    end(options?: mysql.QueryOptions): Bluebird<void>;

    release(options?: mysql.QueryOptions): Bluebird<void>;

    escape(value: any, stringifyObjects?: boolean, timeZone?: string): string;

    escapeId(value: string, forbidQualified?: boolean): string;

    on(ev: 'connection' | 'acquire' | 'release', callback: (connection: mysql.PoolConnection) => void): mysql.Pool;

    on(ev: 'error', callback: (err: mysql.MysqlError) => void): mysql.Pool;

    on(ev: 'enqueue', callback: (err?: mysql.MysqlError) => void): mysql.Pool;

    on<T = any>(ev: string, callback: (...args: T[]) => void): mysql.Pool;
}

export class PoolCluster {
    constructor(config: mysql.PoolClusterConfig);

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
    on<T = any>(ev: string, callback: (...args: T[]) => void): PoolCluster;

    /**
     * Set handler to be run when a node is removed or goes offline.
     */
    on(ev: 'remove' | 'offline', callback: (nodeId: string) => void): PoolCluster;
}
