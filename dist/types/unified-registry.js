/**
 * Unified Interface Registry Implementation
 *
 * Central registry for all unified interface implementations
 * Provides a single point of access to all adapters
 */
export class UnifiedRegistry {
    _auth = new Map();
    _ui = new Map();
    _database = new Map();
    // Public accessors for the maps
    get auth() { return this._auth; }
    get ui() { return this._ui; }
    get database() { return this._database; }
    /**
     * Register an implementation for a specific category and name
     */
    register(category, name, implementation) {
        const map = this[category];
        map.set(name, implementation);
    }
    /**
     * Get an implementation by category and name
     */
    get(category, name) {
        const map = this[category];
        return map.get(name);
    }
    /**
     * List all registered implementations for a category
     */
    list(category) {
        const map = this[category];
        return Array.from(map.keys());
    }
    /**
     * Check if an implementation exists for a category and name
     */
    has(category, name) {
        const map = this[category];
        return map.has(name);
    }
    /**
     * Remove an implementation from the registry
     */
    remove(category, name) {
        const map = this[category];
        return map.delete(name);
    }
    /**
     * Clear all implementations for a category
     */
    clear(category) {
        const map = this[category];
        map.clear();
    }
    /**
     * Get the count of implementations for a category
     */
    count(category) {
        const map = this[category];
        return map.size;
    }
    /**
     * Get all implementations for a category as an array
     */
    getAll(category) {
        const map = this[category];
        return Array.from(map.entries()).map(([name, implementation]) => ({
            name,
            implementation,
        }));
    }
}
/**
 * Adapter Factory Implementation
 *
 * Factory for creating adapters for different technologies
 * Provides a centralized way to instantiate adapters
 */
export class AdapterFactoryImpl {
    /**
     * Create an auth adapter for the specified plugin
     */
    async createAuthAdapter(pluginName) {
        switch (pluginName.toLowerCase()) {
            case 'better-auth':
                try {
                    const { createBetterAuthAdapter } = await import('../plugins/auth/better-auth-adapter.js');
                    // This would typically receive the actual Better Auth client and config
                    // For now, we'll create a mock implementation
                    return createBetterAuthAdapter({}, // betterAuthClient
                    {}, // betterAuthServer
                    {} // config
                    );
                }
                catch (error) {
                    throw new Error(`Failed to load Better Auth adapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            // Add more auth plugins here
            case 'nextauth':
                throw new Error('NextAuth adapter not yet implemented');
            case 'clerk':
                throw new Error('Clerk adapter not yet implemented');
            default:
                throw new Error(`Unknown auth plugin: ${pluginName}`);
        }
    }
    /**
     * Create a UI adapter for the specified plugin
     */
    async createUIAdapter(pluginName) {
        switch (pluginName.toLowerCase()) {
            case 'shadcn':
            case 'shadcn/ui':
            case 'shadcn-ui':
                try {
                    const { createShadcnAdapter } = await import('../plugins/ui/shadcn-adapter.js');
                    return createShadcnAdapter({});
                }
                catch (error) {
                    throw new Error(`Failed to load Shadcn adapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            case 'tamagui':
                try {
                    const { createTamaguiAdapter } = await import('../plugins/ui/tamagui-adapter.js');
                    return createTamaguiAdapter({});
                }
                catch (error) {
                    throw new Error(`Failed to load Tamagui adapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            case 'chakra':
            case 'chakra-ui':
                throw new Error('Chakra UI adapter not yet implemented');
            case 'mui':
            case 'material-ui':
                throw new Error('Material-UI adapter not yet implemented');
            default:
                throw new Error(`Unknown UI plugin: ${pluginName}`);
        }
    }
    /**
     * Create a database adapter for the specified plugin
     */
    async createDatabaseAdapter(pluginName) {
        switch (pluginName.toLowerCase()) {
            case 'drizzle':
                try {
                    const { createDrizzleAdapter } = await import('../plugins/db/drizzle-adapter.js');
                    return createDrizzleAdapter({}, // drizzleClient
                    {}, // drizzleSchema
                    {} // config
                    );
                }
                catch (error) {
                    throw new Error(`Failed to load Drizzle adapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            case 'prisma':
                try {
                    const { createPrismaAdapter } = await import('../plugins/db/prisma-adapter.js');
                    return createPrismaAdapter({}, // prismaClient
                    {}, // prismaSchema
                    {} // config
                    );
                }
                catch (error) {
                    throw new Error(`Failed to load Prisma adapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            case 'supabase':
                throw new Error('Supabase adapter not yet implemented');
            case 'firebase':
                throw new Error('Firebase adapter not yet implemented');
            default:
                throw new Error(`Unknown database plugin: ${pluginName}`);
        }
    }
}
/**
 * Global registry instance
 * This is the main registry that should be used throughout the application
 */
export const globalRegistry = new UnifiedRegistry();
/**
 * Global adapter factory instance
 * This is the main factory that should be used throughout the application
 */
export const globalAdapterFactory = new AdapterFactoryImpl();
/**
 * Helper function to register a plugin with the global registry
 */
export function registerPlugin(category, name, pluginName) {
    let implementation;
    switch (category) {
        case 'auth':
            implementation = globalAdapterFactory.createAuthAdapter(pluginName);
            break;
        case 'ui':
            implementation = globalAdapterFactory.createUIAdapter(pluginName);
            break;
        case 'database':
            implementation = globalAdapterFactory.createDatabaseAdapter(pluginName);
            break;
        default:
            throw new Error(`Unknown category: ${category}`);
    }
    globalRegistry.register(category, name, implementation);
}
/**
 * Helper function to get a plugin from the global registry
 */
export function getPlugin(category, name) {
    return globalRegistry.get(category, name);
}
/**
 * Helper function to check if a plugin exists in the global registry
 */
export function hasPlugin(category, name) {
    return globalRegistry.has(category, name);
}
/**
 * Helper function to list all plugins for a category
 */
export function listPlugins(category) {
    return globalRegistry.list(category);
}
/**
 * Initialize default plugins
 * This function should be called during application startup
 */
export function initializeDefaultPlugins() {
    // Register default auth plugins
    try {
        registerPlugin('auth', 'better-auth', 'better-auth');
    }
    catch (error) {
        console.warn('Failed to register Better Auth plugin:', error);
    }
    // Register default UI plugins
    try {
        registerPlugin('ui', 'shadcn', 'shadcn');
    }
    catch (error) {
        console.warn('Failed to register Shadcn/ui plugin:', error);
    }
    // Register default database plugins
    try {
        registerPlugin('database', 'drizzle', 'drizzle');
    }
    catch (error) {
        console.warn('Failed to register Drizzle plugin:', error);
    }
}
/**
 * Plugin discovery and auto-registration
 * This function can be used to automatically discover and register plugins
 */
export function discoverAndRegisterPlugins() {
    // This would typically scan for plugin configurations
    // and automatically register them
    // For now, we'll just initialize the default plugins
    initializeDefaultPlugins();
}
/**
 * Plugin validation
 * This function validates that all required plugins are available
 */
export function validatePlugins(requiredPlugins) {
    const missing = [];
    for (const plugin of requiredPlugins) {
        if (!globalRegistry.has(plugin.category, plugin.name)) {
            missing.push(plugin);
        }
    }
    return {
        valid: missing.length === 0,
        missing,
    };
}
//# sourceMappingURL=unified-registry.js.map