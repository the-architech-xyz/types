import { UIPluginConfig } from '../../../../types/plugins.js';
export interface GeneratedFile {
    path: string;
    content: string;
}
export declare class VitestGenerator {
    generateAllFiles(config: UIPluginConfig): GeneratedFile[];
    generateVitestConfig(config: UIPluginConfig): GeneratedFile;
    generateSetupFile(config: UIPluginConfig): GeneratedFile;
    generateTestExample(config: UIPluginConfig): GeneratedFile;
    generateReadme(): GeneratedFile;
    generateGitIgnore(): GeneratedFile;
    generateScripts(config: UIPluginConfig): Record<string, string>;
}
