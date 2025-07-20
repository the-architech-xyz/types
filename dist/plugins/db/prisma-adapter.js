/**
 * Prisma Adapter
 *
 * Implements the UnifiedDatabase interface for Prisma ORM
 * Translates Prisma's API to the unified interface
 */
export class PrismaAdapter {
    prismaClient;
    prismaSchema;
    prismaConfig;
    constructor(prismaClient, prismaSchema, config) {
        this.prismaClient = prismaClient;
        this.prismaSchema = prismaSchema;
        this.prismaConfig = config;
    }
    // Database client operations
    client = {
        query: async (sql, params) => {
            try {
                const result = await this.prismaClient.$queryRawUnsafe(sql, ...(params || []));
                return Array.isArray(result) ? result : [result];
            }
            catch (error) {
                throw new Error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        insert: async (table, data) => {
            try {
                const model = this.getPrismaModel(table);
                if (!model) {
                    throw new Error(`Table ${table} not found in schema`);
                }
                const result = await this.prismaClient[model].create({
                    data,
                });
                return {
                    id: result.id || result[this.getPrimaryKey(table)],
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
                const model = this.getPrismaModel(table);
                if (!model) {
                    throw new Error(`Table ${table} not found in schema`);
                }
                const result = await this.prismaClient[model].updateMany({
                    where: this.buildPrismaWhere(where),
                    data,
                });
                return {
                    affectedRows: result.count,
                    data: result,
                };
            }
            catch (error) {
                throw new Error(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        delete: async (table, where) => {
            try {
                const model = this.getPrismaModel(table);
                if (!model) {
                    throw new Error(`Table ${table} not found in schema`);
                }
                const result = await this.prismaClient[model].deleteMany({
                    where: this.buildPrismaWhere(where),
                });
                return {
                    affectedRows: result.count,
                };
            }
            catch (error) {
                throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        transaction: async (fn) => {
            try {
                return await this.prismaClient.$transaction(async (tx) => {
                    // Create a transaction adapter
                    const txAdapter = {
                        query: async (sql, params) => {
                            const result = await tx.$queryRawUnsafe(sql, ...(params || []));
                            return Array.isArray(result) ? result : [result];
                        },
                        insert: async (table, data) => {
                            const model = this.getPrismaModel(table);
                            if (!model) {
                                throw new Error(`Prisma model not found for table: ${table}`);
                            }
                            const result = await tx[model].create({ data });
                            return {
                                id: result.id || result[this.getPrimaryKey(table)],
                                affectedRows: 1,
                                data: result,
                            };
                        },
                        update: async (table, where, data) => {
                            const model = this.getPrismaModel(table);
                            if (!model) {
                                throw new Error(`Prisma model not found for table: ${table}`);
                            }
                            const result = await tx[model].updateMany({
                                where: this.buildPrismaWhere(where),
                                data,
                            });
                            return {
                                affectedRows: result.count,
                                data: result,
                            };
                        },
                        delete: async (table, where) => {
                            const model = this.getPrismaModel(table);
                            if (!model) {
                                throw new Error(`Prisma model not found for table: ${table}`);
                            }
                            const result = await tx[model].deleteMany({
                                where: this.buildPrismaWhere(where),
                            });
                            return {
                                affectedRows: result.count,
                            };
                        },
                        transaction: async (fn) => {
                            return await fn(txAdapter);
                        },
                        raw: async (sql, params) => {
                            return await tx.$executeRawUnsafe(sql, ...(params || []));
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
                const result = await this.prismaClient.$executeRawUnsafe(sql, ...(params || []));
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
                // This would typically use Prisma's migration generation
                console.log(`Generating Prisma migration: ${name}`);
                // await this.prismaClient.$executeRaw`npx prisma migrate dev --name ${name}`;
            }
            catch (error) {
                throw new Error(`Migration generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        run: async () => {
            try {
                // This would typically use Prisma's migration runner
                console.log('Running Prisma migrations...');
                // await this.prismaClient.$executeRaw`npx prisma migrate deploy`;
            }
            catch (error) {
                throw new Error(`Migration execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        reset: async () => {
            try {
                // This would typically reset the database
                console.log('Resetting Prisma database...');
                // await this.prismaClient.$executeRaw`npx prisma migrate reset`;
            }
            catch (error) {
                throw new Error(`Database reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        status: async () => {
            try {
                // This would typically check migration status
                console.log('Checking Prisma migration status...');
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
                await this.prismaClient.$connect();
                console.log('Prisma database connected');
            }
            catch (error) {
                throw new Error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        disconnect: async () => {
            try {
                await this.prismaClient.$disconnect();
                console.log('Prisma database disconnected');
            }
            catch (error) {
                throw new Error(`Disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        isConnected: () => {
            // Check if the client is available
            return !!this.prismaClient;
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
    getUnderlyingClient = () => this.prismaClient;
    getUnderlyingSchema = () => this.prismaSchema;
    // Helper methods
    getPrismaModel(tableName) {
        if (!this.prismaSchema)
            return null;
        // Convert table name to Prisma model name (singular, PascalCase)
        const modelName = this.tableToModelName(tableName);
        // Check if the model exists in the Prisma client
        if (this.prismaClient && typeof this.prismaClient[modelName] === 'object') {
            return modelName;
        }
        return null;
    }
    tableToModelName(tableName) {
        // Convert table name to Prisma model name
        // e.g., "users" -> "user", "blog_posts" -> "blogPost"
        const singular = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;
        return singular.charAt(0).toUpperCase() + singular.slice(1);
    }
    getPrimaryKey(tableName) {
        // Default primary key is usually 'id'
        return 'id';
    }
    buildPrismaWhere(where) {
        // Convert unified where clause to Prisma format
        if (!where)
            return {};
        // Handle simple equality
        if (typeof where === 'object' && !Array.isArray(where)) {
            return where;
        }
        // Handle more complex conditions
        return where;
    }
    transformTableSchema(tableName) {
        const model = this.getPrismaModel(tableName);
        if (!model) {
            return {
                name: tableName,
                columns: [],
                indexes: [],
                relations: [],
            };
        }
        // Transform Prisma schema to unified format
        // This is a simplified implementation
        return {
            name: tableName,
            columns: this.extractColumns(tableName),
            indexes: this.extractIndexes(tableName),
            relations: this.extractRelations(tableName),
        };
    }
    extractColumns(tableName) {
        // Extract column information from Prisma schema
        // This is a simplified implementation
        const columns = [];
        // You would typically parse the Prisma schema file
        // and extract column information from the model definition
        // For now, return basic columns
        if (tableName === 'users') {
            columns.push({ name: 'id', type: 'String', nullable: false, primaryKey: true, unique: true }, { name: 'email', type: 'String', nullable: false, primaryKey: false, unique: true }, { name: 'name', type: 'String', nullable: true, primaryKey: false, unique: false }, { name: 'createdAt', type: 'DateTime', nullable: false, primaryKey: false, unique: false }, { name: 'updatedAt', type: 'DateTime', nullable: false, primaryKey: false, unique: false });
        }
        return columns;
    }
    extractIndexes(tableName) {
        // Extract index information from Prisma schema
        // This is a simplified implementation
        const indexes = [];
        // You would typically parse the Prisma schema file
        // and extract index information from the model definition
        return indexes;
    }
    extractRelations(tableName) {
        // Extract relation information from Prisma schema
        // This is a simplified implementation
        const relations = [];
        // You would typically parse the Prisma schema file
        // and extract relation information from the model definition
        return relations;
    }
}
/**
 * Factory function to create a Prisma adapter
 */
export function createPrismaAdapter(prismaClient, prismaSchema, config) {
    return new PrismaAdapter(prismaClient, prismaSchema, config);
}
//# sourceMappingURL=prisma-adapter.js.map