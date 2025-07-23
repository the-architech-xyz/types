/**
 * Tamagui Plugin - Pure Technology Implementation
 *
 * Provides Tamagui UI framework integration.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BaseUIPlugin } from '../../../base/index.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { TamaguiSchema } from './TamaguiSchema.js';
import { TamaguiGenerator } from './TamaguiGenerator.js';
export class TamaguiPlugin extends BaseUIPlugin {
    generator;
    constructor() {
        super();
        this.generator = new TamaguiGenerator();
    }
    // ============================================================================
    // METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'tamagui',
            name: 'Tamagui',
            version: '1.0.0',
            description: 'Universal React Native & Web UI kit',
            author: 'The Architech Team',
            category: PluginCategory.UI_LIBRARY,
            tags: ['ui', 'components', 'design-system', 'react-native', 'web', 'universal'],
            license: 'MIT',
        };
    }
    // ============================================================================
    // ABSTRACT METHOD IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return TamaguiSchema.getParameterSchema();
    }
    getUILibraries() {
        return TamaguiSchema.getUILibraries();
    }
    getComponentOptions() {
        return TamaguiSchema.getComponentOptions();
    }
    getThemeOptions() {
        return TamaguiSchema.getThemeOptions();
    }
    getStylingOptions() {
        return TamaguiSchema.getStylingOptions();
    }
    getLibraryLabel(library) {
        switch (library) {
            case UILibrary.TAMAGUI:
                return 'Tamagui';
            case UILibrary.SHADCN_UI:
                return 'Shadcn/UI';
            case UILibrary.CHAKRA_UI:
                return 'Chakra UI';
            case UILibrary.MUI:
                return 'Material-UI (MUI)';
            case UILibrary.ANT_DESIGN:
                return 'Ant Design';
            case UILibrary.RADIX_UI:
                return 'Radix UI';
            default:
                return library;
        }
    }
    generateUnifiedInterface(config) {
        return {
            category: PluginCategory.UI_LIBRARY,
            exports: [], types: [], utilities: [], constants: [],
            documentation: 'Tamagui universal UI kit integration',
        };
    }
    // ============================================================================
    // MAIN INSTALL METHOD
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        const config = context.pluginConfig;
        try {
            // 1. Generate all file contents
            const allFiles = this.generator.generateAllFiles(config);
            // 2. Use BasePlugin methods to write files
            for (const file of allFiles) {
                if (file.path === 'tamagui.config.ts') {
                    // Config file goes to root
                    await this.generateFile(file.path, file.content);
                }
                else {
                    // UI files go to lib/ui directory
                    const filePath = this.pathResolver.getLibPath('ui', file.path.replace('src/lib/ui/', ''));
                    await this.generateFile(filePath, file.content);
                }
            }
            // 3. Add dependencies
            await this.installDependencies(['tamagui', '@tamagui/core', '@tamagui/themes', '@tamagui/font-inter', '@tamagui/shorthands'], ['@tamagui/config', '@tamagui/animations-react-native']);
            // 4. Add scripts
            const scripts = this.generator.generateScripts(config);
            await this.addScripts(scripts);
            return this.createSuccessResult([], [], [], [], [], startTime);
        }
        catch (error) {
            return this.createErrorResult('Tamagui installation failed', [error], startTime);
        }
    }
}
//# sourceMappingURL=TamaguiPlugin.js.map