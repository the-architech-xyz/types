/**
 * Docker Deployment Plugin - Pure Technology Implementation
 *
 * Provides Docker containerization and deployment setup.
 * Focuses only on containerization technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
export declare class DockerPlugin implements IPlugin {
    private templateService;
    private runner;
    constructor();
    getMetadata(): PluginMetadata;
    install(context: PluginContext): Promise<PluginResult>;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    validate(context: PluginContext): Promise<ValidationResult>;
    getCompatibility(): CompatibilityMatrix;
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): PluginRequirement[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): ConfigSchema;
    private createDockerFiles;
    private createDeploymentScripts;
    private createKubernetesManifests;
    private generateUnifiedInterfaceFiles;
    private generateDockerfile;
    private generateDockerignore;
    private generateDockerCompose;
    private generateBuildScript;
    private generateDeployScript;
    private generateK8sDeployment;
    private generateK8sService;
    private generateK8sIngress;
    private generateUnifiedIndex;
    private generateEnvConfig;
    private createErrorResult;
}
