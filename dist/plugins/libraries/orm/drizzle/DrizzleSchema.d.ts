/**
 * Drizzle Schema
 *
 * Contains the parameter schema and static helper methods for the Drizzle plugin.
 * Separated from the main plugin for better organization.
 */
import { ParameterSchema, DatabaseProvider, ORMOption, DatabaseFeature } from '../../../../types/plugins.js';
export declare class DrizzleSchema {
    /**
     * Get the parameter schema for Drizzle plugin
     */
    static getParameterSchema(): ParameterSchema;
    /**
     * Get database providers supported by Drizzle
     */
    static getDatabaseProviders(): DatabaseProvider[];
    /**
     * Get ORM options supported by Drizzle
     */
    static getORMOptions(): ORMOption[];
    /**
     * Get database features supported by Drizzle
     */
    static getDatabaseFeatures(): DatabaseFeature[];
    /**
     * Get provider label for display
     */
    static getProviderLabel(provider: DatabaseProvider): string;
    /**
     * Get provider description
     */
    static getProviderDescription(provider: DatabaseProvider): string;
    /**
     * Get feature label for display
     */
    static getFeatureLabel(feature: DatabaseFeature): string;
    /**
     * Get feature description
     */
    static getFeatureDescription(feature: DatabaseFeature): string;
}
