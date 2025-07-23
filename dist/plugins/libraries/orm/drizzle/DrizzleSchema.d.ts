/**
 * Drizzle Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Drizzle plugin.
 * Based on: https://orm.drizzle.team/
 */
import { ParameterSchema } from '../../../../types/plugins.js';
import { DatabaseProvider, DatabaseFeature } from '../../../../types/core.js';
export declare class DrizzleSchema {
    static getParameterSchema(): ParameterSchema;
    static getDatabaseProviders(): DatabaseProvider[];
    static getDatabaseFeatures(): DatabaseFeature[];
    static getProviderLabel(provider: DatabaseProvider): string;
    static getProviderDescription(provider: DatabaseProvider): string;
    static getFeatureLabel(feature: DatabaseFeature): string;
    static getFeatureDescription(feature: DatabaseFeature): string;
}
