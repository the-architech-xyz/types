/**
 * Prisma ORM Plugin - Updated with Latest Best Practices
 *
 * Provides Prisma ORM integration with multiple database providers.
 * Follows latest Prisma documentation and TypeScript best practices.
 *
 * References:
 * - https://www.prisma.io/docs/getting-started
 * - https://www.prisma.io/docs/concepts/components/prisma-schema
 * - https://www.prisma.io/docs/concepts/components/prisma-client
 * - https://www.prisma.io/docs/guides/performance-and-optimization
 */
import { BaseDatabasePlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugin.js';
import { DatabaseProvider, ORMOption, DatabaseFeature, ParameterSchema, UnifiedInterfaceTemplate, ConnectionOption } from '../../../../types/plugin-interfaces.js';
export declare class PrismaPlugin extends BaseDatabasePlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): ParameterSchema;
    getDatabaseProviders(): DatabaseProvider[];
    getORMOptions(): ORMOption[];
    getDatabaseFeatures(): DatabaseFeature[];
    getConnectionOptions(provider: DatabaseProvider): ConnectionOption[];
    getProviderLabel(provider: DatabaseProvider): string;
    getProviderDescription(provider: DatabaseProvider): string;
    getFeatureLabel(feature: DatabaseFeature): string;
    getFeatureDescription(feature: DatabaseFeature): string;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    install(context: PluginContext): Promise<PluginResult>;
}
