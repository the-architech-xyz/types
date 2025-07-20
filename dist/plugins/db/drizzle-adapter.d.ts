import type { UnifiedDatabase, InsertResult, UpdateResult, DeleteResult, TableSchema, MigrationStatus, ConnectionHealth } from '../../types/unified';
/**
 * Drizzle Adapter
 *
 * Implements the UnifiedDatabase interface for Drizzle ORM
 * Translates Drizzle's API to the unified interface
 */
export declare class DrizzleAdapter implements UnifiedDatabase {
    private drizzleClient;
    private drizzleSchema;
    private drizzleConfig;
    constructor(drizzleClient: any, drizzleSchema: any, config: any);
    client: {
        query: (sql: string, params?: any[]) => Promise<any[]>;
        insert: (table: string, data: any) => Promise<InsertResult>;
        update: (table: string, where: any, data: any) => Promise<UpdateResult>;
        delete: (table: string, where: any) => Promise<DeleteResult>;
        transaction: <T>(fn: (tx: UnifiedDatabase["client"]) => Promise<T>) => Promise<T>;
        raw: (sql: string, params?: any[]) => Promise<any>;
    };
    schema: {
        users: TableSchema;
        posts: TableSchema;
        comments: TableSchema;
        categories: TableSchema;
        tags: TableSchema;
    };
    migrations: {
        generate: (name: string) => Promise<void>;
        run: () => Promise<void>;
        reset: () => Promise<void>;
        status: () => Promise<MigrationStatus[]>;
    };
    connection: {
        connect: () => Promise<void>;
        disconnect: () => Promise<void>;
        isConnected: () => boolean;
        health: () => Promise<ConnectionHealth>;
    };
    getUnderlyingClient: () => any;
    getUnderlyingSchema: () => any;
    private getTableSchema;
    private buildWhereClause;
    private transformTableSchema;
    private extractColumns;
    private extractIndexes;
    private extractRelations;
}
/**
 * Factory function to create a Drizzle adapter
 */
export declare function createDrizzleAdapter(drizzleClient: any, drizzleSchema: any, config: any): UnifiedDatabase;
