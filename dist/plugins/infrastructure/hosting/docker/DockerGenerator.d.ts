import { DockerConfig } from './DockerSchema.js';
export declare class DockerGenerator {
    static generateDockerfile(config: DockerConfig): string;
    static generateDockerignore(): string;
    static generateDockerCompose(config: DockerConfig): string;
    static generateBuildScript(config: DockerConfig): string;
    static generateDeployScript(config: DockerConfig): string;
    static generateK8sDeployment(config: DockerConfig): string;
    static generateK8sService(config: DockerConfig): string;
    static generateK8sIngress(config: DockerConfig): string;
    static generateUnifiedIndex(): string;
    static generateEnvConfig(config: DockerConfig): string;
    static generatePackageJson(config: DockerConfig): string;
    static generateReadme(): string;
}
