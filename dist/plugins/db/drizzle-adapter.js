/**
 * Drizzle Adapter
 *
 * Implements the UnifiedDatabase interface for Drizzle ORM
 * Translates Drizzle's API to the unified interface
 */
export class DrizzleAdapter {
    drizzleClient;
    drizzleSchema;
    drizzleConfig;
    constructor(drizzleClient, drizzleSchema, config) {
        this.drizzleClient = drizzleClient;
        this.drizzleSchema = drizzleSchema;
        this.drizzleConfig = config;
    }
    // Database client operations
    client = {
        query: async (sql, params) => {
            try {
                const result = await this.drizzleClient.execute(sql, params);
                return result.rows || result;
            }
            catch (error) {
                throw new Error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        insert: async (table, data) => {
            try {
                const tableSchema = this.getTableSchema(table);
                if (!tableSchema) {
                    throw new Error(`Table ${table} not found in schema`);
                }
                const result = await this.drizzleClient.insert(tableSchema).values(data);
                return {
                    id: result.insertId || data.id,
                    affectedRows: 1,
                    data: result,
                };
            }
            catch (error) {
                throw new Error(`Insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        update: async (table, where, data) => {
            try {
                const tableSchema = this.getTableSchema(table);
                if (!tableSchema) {
                    throw new Error(`Table ${table} not found in schema`);
                }
                const result = await this.drizzleClient
                    .update(tableSchema)
                    .set(data)
                    .where(this.buildWhereClause(where));
                return {
                    affectedRows: result.affectedRows || 0,
                    data: result,
                };
            }
            catch (error) {
                throw new Error(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        delete: async (table, where) => {
            try {
                const tableSchema = this.getTableSchema(table);
                if (!tableSchema) {
                    throw new Error(`Table ${table} not found in schema`);
                }
                const result = await this.drizzleClient
                    .delete(tableSchema)
                    .where(this.buildWhereClause(where));
                return {
                    affectedRows: result.affectedRows || 0,
                };
            }
            catch (error) {
                throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        transaction: async (fn) => {
            try {
                return await this.drizzleClient.transaction(async (tx) => {
                    // Create a transaction adapter
                    const txAdapter = {
                        query: async (sql, params) => {
                            const result = await tx.execute(sql, params);
                            return result.rows || result;
                        },
                        insert: async (table, data) => {
                            const tableSchema = this.getTableSchema(table);
                            const result = await tx.insert(tableSchema).values(data);
                            return {
                                id: result.insertId || data.id,
                                affectedRows: 1,
                                data: result,
                            };
                        },
                        update: async (table, where, data) => {
                            const tableSchema = this.getTableSchema(table);
                            const result = await tx
                                .update(tableSchema)
                                .set(data)
                                .where(this.buildWhereClause(where));
                            return {
                                affectedRows: result.affectedRows || 0,
                                data: result,
                            };
                        },
                        delete: async (table, where) => {
                            const tableSchema = this.getTableSchema(table);
                            const result = await tx
                                .delete(tableSchema)
                                .where(this.buildWhereClause(where));
                            return {
                                affectedRows: result.affectedRows || 0,
                            };
                        },
                        transaction: async (fn) => {
                            return await fn(txAdapter);
                        },
                        raw: async (sql, params) => {
                            return await tx.execute(sql, params);
                        },
                    };
                    return await fn(txAdapter);
                });
            }
            catch (error) {
                throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        raw: async (sql, params) => {
            try {
                const result = await this.drizzleClient.execute(sql, params);
                return result;
            }
            catch (error) {
                throw new Error(`Raw query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
    };
    // Schema management
    schema = {
        users: this.transformTableSchema('users'),
        posts: this.transformTableSchema('posts'),
        comments: this.transformTableSchema('comments'),
        categories: this.transformTableSchema('categories'),
        tags: this.transformTableSchema('tags'),
    };
    // Migration utilities
    migrations = {
        generate: async (name) => {
            try {
                // This would typically use Drizzle's migration generation
                // For now, we'll create a placeholder
                console.log(`Generating migration: ${name}`);
            }
            catch (error) {
                throw new Error(`Migration generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        run: async () => {
            try {
                // This would typically use Drizzle's migration runner
                console.log('Running migrations...');
            }
            catch (error) {
                throw new Error(`Migration execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        reset: async () => {
            try {
                // This would typically reset the database
                console.log('Resetting database...');
            }
            catch (error) {
                throw new Error(`Database reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        status: async () => {
            try {
                // This would typically check migration status
                return [];
            }
            catch (error) {
                throw new Error(`Migration status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
    };
    // Connection management
    connection = {
        connect: async () => {
            try {
                // Drizzle typically doesn't require explicit connection
                // but we can check if the client is ready
                console.log('Database connected');
            }
            catch (error) {
                throw new Error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        disconnect: async () => {
            try {
                // Drizzle typically handles connection cleanup automatically
                console.log('Database disconnected');
            }
            catch (error) {
                throw new Error(`Disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        isConnected: () => {
            // Check if the client is available
            return !!this.drizzleClient;
        },
        health: async () => {
            try {
                const start = Date.now();
                await this.client.query('SELECT 1');
                const latency = Date.now() - start;
                return {
                    status: 'healthy',
                    latency,
                };
            }
            catch (error) {
                return {
                    status: 'unhealthy',
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        },
    };
    // Escape hatch for advanced use cases
    getUnderlyingClient = () => this.drizzleClient;
    getUnderlyingSchema = () => this.drizzleSchema;
    // Helper methods
    getTableSchema(tableName) {
        if (!this.drizzleSchema)
            return null;
        // Try to find the table in the schema
        const table = this.drizzleSchema[tableName];
        if (table)
            return table;
        // If not found, try to find it in a different way
        // This depends on how the schema is structured
        return null;
    }
    buildWhereClause(where) {
        // Convert unified where clause to Drizzle format
        // This is a simplified implementation
        return where;
    }
    transformTableSchema(tableName) {
        const table = this.getTableSchema(tableName);
        if (!table) {
            return {
                name: tableName,
                columns: [],
                indexes: [],
                relations: [],
            };
        }
        // Transform Drizzle table schema to unified format
        // This is a simplified implementation
        return {
            name: tableName,
            columns: this.extractColumns(table),
            indexes: this.extractIndexes(table),
            relations: this.extractRelations(table),
        };
    }
    extractColumns(table) {
        // Extract column information from Drizzle table
        // This is a simplified implementation
        const columns = [];
        // You would typically iterate through table.columns or similar
        // and extract the column information
        return columns;
    }
    extractIndexes(table) {
        // Extract index information from Drizzle table
        // This is a simplified implementation
        const indexes = [];
        // You would typically iterate through table.indexes or similar
        // and extract the index information
        return indexes;
    }
    extractRelations(table) {
        // Extract relation information from Drizzle table
        // This is a simplified implementation
        const relations = [];
        // You would typically iterate through table.relations or similar
        // and extract the relation information
        return relations;
    }
}
/**
 * Factory function to create a Drizzle adapter
 */
export function createDrizzleAdapter(drizzleClient, drizzleSchema, config) {
    return new DrizzleAdapter(drizzleClient, drizzleSchema, config);
}
//# sourceMappingURL=drizzle-adapter.js.map