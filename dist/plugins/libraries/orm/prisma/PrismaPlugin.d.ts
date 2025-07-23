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
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, IUIDatabasePlugin, UnifiedInterfaceTemplate, ValidationResult } from '../../../../types/plugins.js';
export declare class PrismaPlugin extends BasePlugin implements IUIDatabasePlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    install(context: PluginContext): Promise<PluginResult>;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    validate(context: PluginContext): Promise<ValidationResult>;
    getCompatibility(): any;
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
    getParameterSchema(): any;
    validateConfiguration(config: Record<string, any>): ValidationResult;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getDatabaseProviders(): string[];
    getORMOptions(): string[];
    getDatabaseFeatures(): string[];
    getConnectionOptions(): string[];
    getProviderLabel(provider: string): string;
    getProviderDescription(provider: string): string;
    getFeatureLabel(feature: string): string;
    getFeatureDescription(feature: string): string;
    private installPrismaDependencies;
    private initializePrismaConfig;
    private createDatabaseFiles;
    private generateUnifiedInterfaceFiles;
    private setupPrismaStudio;
}
