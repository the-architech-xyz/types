/**
 * MUI (Material-UI) Plugin - Pure Technology Implementation
 *
 * Provides MUI component library integration using the latest v6.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BaseUIPlugin } from '../../../base/index.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { MuiSchema } from './MuiSchema.js';
import { MuiGenerator } from './MuiGenerator.js';
export class MuiPlugin extends BaseUIPlugin {
    generator;
    constructor() {
        super();
        this.generator = new MuiGenerator();
    }
    // ============================================================================
    // METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'mui',
            name: 'Material-UI (MUI)',
            version: '1.0.0',
            description: 'React component library implementing Google\'s Material Design',
            author: 'The Architech Team',
            category: PluginCategory.UI_LIBRARY,
            tags: ['ui', 'components', 'material-design', 'react', 'enterprise'],
            license: 'MIT',
        };
    }
    // ============================================================================
    // ABSTRACT METHOD IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return MuiSchema.getParameterSchema();
    }
    getUILibraries() {
        return MuiSchema.getUILibraries();
    }
    getComponentOptions() {
        return MuiSchema.getComponentOptions();
    }
    getThemeOptions() {
        return MuiSchema.getThemeOptions();
    }
    getStylingOptions() {
        return MuiSchema.getStylingOptions();
    }
    getLibraryLabel(library) {
        switch (library) {
            case UILibrary.MUI:
                return 'Material-UI (MUI)';
            case UILibrary.SHADCN_UI:
                return 'Shadcn/UI';
            case UILibrary.CHAKRA_UI:
                return 'Chakra UI';
            case UILibrary.TAMAGUI:
                return 'Tamagui';
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
            documentation: 'Material-UI component library integration',
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
                const filePath = this.pathResolver.getLibPath('ui', file.path.replace('src/lib/ui/', ''));
                await this.generateFile(filePath, file.content);
            }
            // 3. Add dependencies
            await this.installDependencies(['@mui/material', '@emotion/react', '@emotion/styled'], ['@mui/icons-material', '@types/react', '@types/react-dom']);
            // 4. Add scripts
            const scripts = this.generator.generateScripts(config);
            await this.addScripts(scripts);
            return this.createSuccessResult([], [], [], [], [], startTime);
        }
        catch (error) {
            return this.createErrorResult('MUI installation failed', [error], startTime);
        }
    }
}
//# sourceMappingURL=MuiPlugin.js.map