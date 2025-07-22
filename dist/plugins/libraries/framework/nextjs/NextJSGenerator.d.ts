import { FrameworkPluginConfig } from '../../../../types/plugin-interfaces.js';
export interface GeneratedFile {
    path: string;
    content: string;
}
export declare class NextJSGenerator {
    generateAllFiles(config: FrameworkPluginConfig): GeneratedFile[];
    generateNextConfig(config: FrameworkPluginConfig): GeneratedFile;
    generatePackageJson(config: FrameworkPluginConfig): GeneratedFile;
    generateTsConfig(config: FrameworkPluginConfig): GeneratedFile;
    generateTailwindConfig(config: FrameworkPluginConfig): GeneratedFile;
    generateESLintConfig(config: FrameworkPluginConfig): GeneratedFile;
    generateReadme(config: FrameworkPluginConfig): GeneratedFile;
    generateScripts(config: FrameworkPluginConfig): Record<string, string>;
    generateEnvConfig(config: FrameworkPluginConfig): Record<string, string>;
}
