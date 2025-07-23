import { BasePlugin } from './BasePlugin.js';
import { PluginCategory } from '../../types/plugins.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
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
            parameters: [
                {
                    id: 'library',
                    name: 'library',
                    type: 'select',
                    description: 'Select UI library',
                    required: true,
                    options: this.getUILibraries().map(l => ({ value: l, label: this.getLibraryLabel(l) })),
                    group: 'library'
                },
                {
                    id: 'components',
                    name: 'components',
                    type: 'multiselect',
                    description: 'Select components to include',
                    required: false,
                    options: this.getComponentOptions().map(c => ({ value: c, label: this.getComponentLabel(c) })),
                    group: 'components'
                }
            ],
            groups: [
                { id: 'library', name: 'UI Library', description: 'Choose your UI library', order: 1, parameters: ['library'] },
                { id: 'components', name: 'Components', description: 'Choose components to include', order: 2, parameters: ['components'] }
            ],
            dependencies: [],
            validations: []
        };
    }
    async setupUIComponents(context, components) {
        const componentsPath = this.pathResolver.getLibPath('ui', 'components');
        await this.ensureDirectory(componentsPath);
        for (const component of components) {
            const componentPath = this.pathResolver.getLibPath('ui', `components/${component}.tsx`);
            const componentContent = this.generateComponentFile(component);
            await this.generateFile(componentPath, componentContent);
        }
    }
    generateComponentFile(componentName) {
        return `import React from 'react';

export interface ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props {
  // Component props
}

export const ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}: React.FC<${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props> = (props) => {
  return (
    <div>
      {/* ${componentName} component implementation */}
    </div>
  );
};
`;
    }
    getDynamicQuestions(context) {
        return this.questionGenerator.generateQuestions(this, context);
    }
    validateConfiguration(config) {
        return this.validateRequiredConfig(config, ['library']);
    }
    getParameterSchema() {
        return this.getBaseUISchema();
    }
    generateUnifiedInterface() {
        return {
            functions: ['createComponent', 'applyTheme', 'getStyles'],
            classes: ['UIProvider', 'ThemeProvider', 'ComponentLibrary'],
            types: ['UIProps', 'ThemeConfig', 'ComponentConfig'],
            constants: ['DEFAULT_THEME', 'COMPONENT_VARIANTS']
        };
    }
}
//# sourceMappingURL=BaseUIPlugin.js.map