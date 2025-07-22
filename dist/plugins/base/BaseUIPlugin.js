/**
 * Base UI Plugin Class
 *
 * Provides common functionality for all UI library plugins.
 */
import { BasePlugin } from './BasePlugin.js';
import { StylingOption } from '../../types/plugin-interfaces.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
import { PluginCategory } from '../../types/plugin.js';
import * as fs from 'fs-extra';
export class BaseUIPlugin extends BasePlugin {
    questionGenerator;
    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }
    // --- Shared Logic ---
    getBaseUISchema() {
        return {
            category: PluginCategory.UI_LIBRARY,
            parameters: [{
                    id: 'library',
                    name: 'library',
                    type: 'select',
                    description: 'Select UI Library',
                    required: true,
                    options: this.getUILibraries().map(l => ({ value: l, label: this.getLibraryLabel(l) }))
                }],
            groups: [],
            dependencies: [],
            validations: []
        };
    }
    async setupThemeProvider(context, providerImport, providerWrapperStart, providerWrapperEnd) {
        const layoutPath = this.pathResolver.getRootLayoutPath();
        if (!await this.fileExists(layoutPath)) {
            context.logger.warn(`Could not find root layout file at ${layoutPath}. Skipping ThemeProvider injection.`);
            return;
        }
        let content = await fs.readFile(layoutPath, 'utf8');
        // Add import statement if it doesn't exist
        if (!content.includes(providerImport)) {
            content = `${providerImport}\n${content}`;
        }
        // Wrap children in provider
        content = content.replace(/(<body.*?>)([\s\S]*?)(<\/body>)/, `$1\n  ${providerWrapperStart}\n$2\n  ${providerWrapperEnd}\n$3`);
        await this.generateFile(layoutPath, content);
    }
    async configureStyling(config) {
        // Example for TailwindCSS, can be extended
        if (config.styling.approach === StylingOption.TAILWIND) {
            const tailwindConfigPath = this.pathResolver.getConfigPath('tailwind.config.js');
            // Logic to modify tailwind config
        }
    }
    getDynamicQuestions(context) {
        return this.questionGenerator.generateQuestions(this, context);
    }
    validateConfiguration(config) {
        // Basic validation, can be extended by child classes
        return this.validateRequiredConfig(config, ['library']);
    }
}
//# sourceMappingURL=BaseUIPlugin.js.map