import { UIPluginConfig } from '../../../../types/plugin-interfaces.js';
export interface GeneratedFile {
    path: string;
    content: string;
}
export declare class MuiGenerator {
    generateAllFiles(config: UIPluginConfig): GeneratedFile[];
    generateThemeConfig(config: UIPluginConfig): GeneratedFile;
    generateUnifiedIndex(config: UIPluginConfig): GeneratedFile;
    private generateComponentExports;
    private getComponentName;
    generateButtonComponent(config: UIPluginConfig): GeneratedFile;
    generateCardComponent(config: UIPluginConfig): GeneratedFile;
    generateInputComponent(config: UIPluginConfig): GeneratedFile;
    generateFormComponent(config: UIPluginConfig): GeneratedFile;
    generateModalComponent(config: UIPluginConfig): GeneratedFile;
    generateTableComponent(config: UIPluginConfig): GeneratedFile;
    generateNavigationComponent(config: UIPluginConfig): GeneratedFile;
    generateSelectComponent(config: UIPluginConfig): GeneratedFile;
    generateCheckboxComponent(config: UIPluginConfig): GeneratedFile;
    generateSwitchComponent(config: UIPluginConfig): GeneratedFile;
    generateBadgeComponent(config: UIPluginConfig): GeneratedFile;
    generateAvatarComponent(config: UIPluginConfig): GeneratedFile;
    generateAlertComponent(config: UIPluginConfig): GeneratedFile;
    generateScripts(config: UIPluginConfig): Record<string, string>;
    generateEnvConfig(config: UIPluginConfig): Record<string, string>;
}
