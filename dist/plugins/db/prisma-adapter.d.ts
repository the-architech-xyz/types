import type { UnifiedDatabase, InsertResult, UpdateResult, DeleteResult, TableSchema, MigrationStatus, ConnectionHealth } from '../../types/unified';
/**
 * Prisma Adapter
 *
 * Implements the UnifiedDatabase interface for Prisma ORM
 * Translates Prisma's API to the unified interface
 */
export declare class PrismaAdapter implements UnifiedDatabase {
    private prismaClient;
    private prismaSchema;
    private prismaConfig;
    constructor(prismaClient: any, prismaSchema: any, config: any);
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
    private getPrismaModel;
    private tableToModelName;
    private getPrimaryKey;
    private buildPrismaWhere;
    private transformTableSchema;
    private extractColumns;
    private extractIndexes;
    private extractRelations;
}
/**
 * Factory function to create a Prisma adapter
 */
export declare function createPrismaAdapter(prismaClient: any, prismaSchema: any, config: any): UnifiedDatabase;
