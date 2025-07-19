import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, TargetPlatform } from '../../types/plugin.js';
export declare class BetterAuthPlugin implements IPlugin {
    private templateService;
    constructor();
    getMetadata(): PluginMetadata;
    install(context: PluginContext): Promise<PluginResult>;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    validate(context: PluginContext): Promise<ValidationResult>;
    getCompatibility(): {
        frameworks: string[];
        platforms: TargetPlatform[];
        nodeVersions: string[];
        packageManagers: string[];
        databases: string[];
        conflicts: string[];
    };
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): {
        type: "package";
        name: string;
        version: string;
        description: string;
    }[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): {
        type: "object";
        properties: {
            providers: {
                type: "array";
                items: {
                    type: "string";
                    enum: string[];
                    description: string;
                };
                description: string;
            };
            requireEmailVerification: {
                type: "boolean";
                description: string;
            };
            sessionDuration: {
                type: "number";
                description: string;
            };
        };
        required: string[];
    };
    private setupAuthentication;
    private getAuthConfig;
    private updatePackageJson;
    private createESLintConfig;
    private createAuthConfig;
    private createAuthUtils;
    private createAuthMiddleware;
    private createIndex;
    private updateEnvConfig;
}
