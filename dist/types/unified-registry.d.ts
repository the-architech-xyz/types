import type { UnifiedInterfaceRegistry, UnifiedAuth, UnifiedUI, UnifiedDatabase, AdapterFactory } from './unified';
/**
 * Unified Interface Registry Implementation
 *
 * Central registry for all unified interface implementations
 * Provides a single point of access to all adapters
 */
export declare class UnifiedRegistry implements UnifiedInterfaceRegistry {
    private _auth;
    private _ui;
    private _database;
    get auth(): Map<string, UnifiedAuth>;
    get ui(): Map<string, UnifiedUI>;
    get database(): Map<string, UnifiedDatabase>;
    /**
     * Register an implementation for a specific category and name
     */
    register<T extends keyof UnifiedInterfaceRegistry>(category: T, name: string, implementation: UnifiedInterfaceRegistry[T] extends Map<string, infer U> ? U : never): void;
    /**
     * Get an implementation by category and name
     */
    get<T extends keyof UnifiedInterfaceRegistry>(category: T, name: string): UnifiedInterfaceRegistry[T] extends Map<string, infer U> ? U | undefined : never;
    /**
     * List all registered implementations for a category
     */
    list<T extends keyof UnifiedInterfaceRegistry>(category: T): string[];
    /**
     * Check if an implementation exists for a category and name
     */
    has<T extends keyof UnifiedInterfaceRegistry>(category: T, name: string): boolean;
    /**
     * Remove an implementation from the registry
     */
    remove<T extends keyof UnifiedInterfaceRegistry>(category: T, name: string): boolean;
    /**
     * Clear all implementations for a category
     */
    clear<T extends keyof UnifiedInterfaceRegistry>(category: T): void;
    /**
     * Get the count of implementations for a category
     */
    count<T extends keyof UnifiedInterfaceRegistry>(category: T): number;
    /**
     * Get all implementations for a category as an array
     */
    getAll<T extends keyof UnifiedInterfaceRegistry>(category: T): Array<{
        name: string;
        implementation: UnifiedInterfaceRegistry[T] extends Map<string, infer U> ? U : never;
    }>;
}
/**
 * Adapter Factory Implementation
 *
 * Factory for creating adapters for different technologies
 * Provides a centralized way to instantiate adapters
 */
export declare class AdapterFactoryImpl implements AdapterFactory {
    /**
     * Create an auth adapter for the specified plugin
     */
    createAuthAdapter(pluginName: string): Promise<UnifiedAuth>;
    /**
     * Create a UI adapter for the specified plugin
     */
    createUIAdapter(pluginName: string): Promise<UnifiedUI>;
    /**
     * Create a database adapter for the specified plugin
     */
    createDatabaseAdapter(pluginName: string): Promise<UnifiedDatabase>;
}
/**
 * Global registry instance
 * This is the main registry that should be used throughout the application
 */
export declare const globalRegistry: UnifiedRegistry;
/**
 * Global adapter factory instance
 * This is the main factory that should be used throughout the application
 */
export declare const globalAdapterFactory: AdapterFactoryImpl;
/**
 * Helper function to register a plugin with the global registry
 */
export declare function registerPlugin<T extends keyof UnifiedInterfaceRegistry>(category: T, name: string, pluginName: string): void;
/**
 * Helper function to get a plugin from the global registry
 */
export declare function getPlugin<T extends keyof UnifiedInterfaceRegistry>(category: T, name: string): UnifiedInterfaceRegistry[T] extends Map<string, infer U> ? U | undefined : never;
/**
 * Helper function to check if a plugin exists in the global registry
 */
export declare function hasPlugin<T extends keyof UnifiedInterfaceRegistry>(category: T, name: string): boolean;
/**
 * Helper function to list all plugins for a category
 */
export declare function listPlugins<T extends keyof UnifiedInterfaceRegistry>(category: T): string[];
/**
 * Initialize default plugins
 * This function should be called during application startup
 */
export declare function initializeDefaultPlugins(): void;
/**
 * Plugin discovery and auto-registration
 * This function can be used to automatically discover and register plugins
 */
export declare function discoverAndRegisterPlugins(): void;
/**
 * Plugin validation
 * This function validates that all required plugins are available
 */
export declare function validatePlugins(requiredPlugins: Array<{
    category: keyof UnifiedInterfaceRegistry;
    name: string;
}>): {
    valid: boolean;
    missing: Array<{
        category: keyof UnifiedInterfaceRegistry;
        name: string;
    }>;
};
