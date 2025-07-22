/**
 * Tamagui Plugin - Pure Technology Implementation
 *
 * Provides Tamagui UI framework integration.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../../types/plugin.js';
import { templateService } from '../../../core/templates/template-service.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class TamaguiPlugin {
    templateService;
    runner;
    constructor() {
        this.templateService = templateService;
        this.runner = new CommandRunner();
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'tamagui',
            name: 'Tamagui',
            version: '1.0.0',
            description: 'Universal React Native & Web UI kit',
            author: 'The Architech Team',
            category: PluginCategory.DESIGN_SYSTEM,
            tags: ['ui', 'components', 'design-system', 'react-native', 'web', 'universal'],
            license: 'MIT',
            repository: 'https://github.com/tamagui/tamagui',
            homepage: 'https://tamagui.dev'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectPath, pluginConfig } = context;
            context.logger.info('Installing Tamagui UI framework...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Create Tamagui configuration
            await this.createTamaguiConfig(context);
            // Step 3: Create UI components structure
            await this.createUIComponents(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'ui', 'index.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'ui', 'components.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'ui', 'theme.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'tamagui.config.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'button.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'card.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'input.tsx')
                    }
                ],
                dependencies: [
                    {
                        name: 'tamagui',
                        version: '^1.74.0',
                        type: 'production',
                        category: PluginCategory.DESIGN_SYSTEM
                    },
                    {
                        name: '@tamagui/core',
                        version: '^1.74.0',
                        type: 'production',
                        category: PluginCategory.DESIGN_SYSTEM
                    },
                    {
                        name: '@tamagui/config',
                        version: '^1.74.0',
                        type: 'production',
                        category: PluginCategory.DESIGN_SYSTEM
                    }
                ],
                scripts: [
                    {
                        name: 'ui:build',
                        command: 'tamagui build',
                        description: 'Build Tamagui components',
                        category: 'dev'
                    }
                ],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Tamagui', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Tamagui...');
            // Remove Tamagui files
            const tamaguiFiles = [
                'tamagui.config.ts',
                'src/lib/ui',
                'src/components/ui'
            ];
            for (const file of tamaguiFiles) {
                const filePath = path.join(projectPath, file);
                if (await fsExtra.pathExists(filePath)) {
                    await fsExtra.remove(filePath);
                }
            }
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Tamagui', startTime, [], error);
        }
    }
    async update(context) {
        // For now, just reinstall
        return this.install(context);
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        // Check if React is available
        const packageJsonPath = path.join(context.projectPath, 'package.json');
        if (await fsExtra.pathExists(packageJsonPath)) {
            const packageJson = await fsExtra.readJSON(packageJsonPath);
            if (!packageJson.dependencies?.react && !packageJson.dependencies?.['react-native']) {
                errors.push({
                    field: 'react',
                    message: 'React or React Native is required for Tamagui',
                    code: 'REACT_REQUIRED',
                    severity: 'error'
                });
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'react-native', 'expo'],
            platforms: [TargetPlatform.WEB, TargetPlatform.MOBILE],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['tamagui', '@tamagui/core', '@tamagui/config'];
    }
    getConflicts() {
        return ['shadcn-ui']; // Can conflict with other UI libraries
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'react',
                description: 'React is required for Tamagui components',
                version: '>=16.0.0'
            }
        ];
    }
    getDefaultConfig() {
        return {
            theme: 'light',
            components: ['button', 'input', 'card', 'text'],
            animations: true,
            responsive: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                theme: {
                    type: 'string',
                    description: 'Default theme mode',
                    enum: ['light', 'dark', 'system'],
                    default: 'light'
                },
                components: {
                    type: 'array',
                    description: 'Components to include',
                    items: {
                        type: 'string',
                        description: 'Component name',
                        enum: ['button', 'input', 'card', 'text', 'stack', 'box', 'modal', 'form', 'select', 'checkbox', 'radio', 'switch', 'badge', 'avatar', 'alert', 'toast']
                    },
                    default: ['button', 'input', 'card', 'text']
                },
                animations: {
                    type: 'boolean',
                    description: 'Enable animations',
                    default: true
                },
                responsive: {
                    type: 'boolean',
                    description: 'Enable responsive design',
                    default: true
                }
            },
            required: []
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const dependencies = ['tamagui', '@tamagui/core', '@tamagui/config'];
        await this.runner.install(dependencies, false, context.projectPath);
    }
    async createTamaguiConfig(context) {
        const { projectPath, pluginConfig } = context;
        const configPath = path.join(projectPath, 'tamagui.config.ts');
        const configContent = this.generateTamaguiConfig(pluginConfig);
        await fsExtra.writeFile(configPath, configContent);
    }
    async createUIComponents(context) {
        const { projectPath, pluginConfig } = context;
        const componentsPath = path.join(projectPath, 'src', 'components', 'ui');
        await fsExtra.ensureDir(componentsPath);
        const components = pluginConfig.components || ['button', 'input', 'card', 'text'];
        for (const component of components) {
            switch (component) {
                case 'button':
                    await this.createButtonComponent(componentsPath);
                    break;
                case 'input':
                    await this.createInputComponent(componentsPath);
                    break;
                case 'card':
                    await this.createCardComponent(componentsPath);
                    break;
                case 'text':
                    await this.createTextComponent(componentsPath);
                    break;
            }
        }
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        const libPath = path.join(projectPath, 'src', 'lib', 'ui');
        await fsExtra.ensureDir(libPath);
        // Create index.ts for the unified interface
        const indexContent = `import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Text } from '../components/ui/text';
import { useTheme } from './theme';

// Unified UI interface
export const ui = {
  components: {
    Button,
    Input,
    Card,
    Text,
  },
  theme: {
    useTheme,
  },
  utils: {
    cn: (...classes: (string | undefined | null | false)[]) => {
      return classes.filter(Boolean).join(' ');
    },
  },
};

export default ui;
`;
        await fsExtra.writeFile(path.join(libPath, 'index.ts'), indexContent);
        // Create components.tsx for additional components
        const componentsContent = `import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Text } from '../components/ui/text';

export function LoginForm() {
  return (
    <Card padding="$4" space="$4" width={300}>
      <Text fontSize="$6" fontWeight="bold" textAlign="center">Sign In</Text>
      <Input placeholder="Email" />
      <Input placeholder="Password" secureTextEntry />
      <Button>Sign In</Button>
    </Card>
  );
}

export function UserCard({ user }: { user: any }) {
  return (
    <Card padding="$4" width={250}>
      <Text fontSize="$5" fontWeight="semibold">{user.name}</Text>
      <Text fontSize="$3" color="$gray10">{user.email}</Text>
    </Card>
  );
}
`;
        await fsExtra.writeFile(path.join(libPath, 'components.tsx'), componentsContent);
        // Create theme.ts for theme management
        const themeContent = `import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    // Tamagui handles theme switching internally
    // This is just for React context
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
`;
        await fsExtra.writeFile(path.join(libPath, 'theme.ts'), themeContent);
        context.logger.success('Tamagui unified interface files generated successfully');
    }
    async createButtonComponent(componentsPath) {
        const buttonContent = `import { Button as TamaguiButton, styled } from 'tamagui';

export const Button = styled(TamaguiButton, {
  backgroundColor: '$blue10',
  color: 'white',
  borderRadius: '$4',
  paddingHorizontal: '$4',
  paddingVertical: '$2',
  fontSize: '$4',
  fontWeight: '600',
  
  variants: {
    variant: {
      primary: {
        backgroundColor: '$blue10',
        color: 'white',
      },
      secondary: {
        backgroundColor: '$gray5',
        color: '$gray12',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$blue10',
        borderWidth: 1,
        color: '$blue10',
      },
    },
    size: {
      small: {
        paddingHorizontal: '$3',
        paddingVertical: '$1',
        fontSize: '$3',
      },
      large: {
        paddingHorizontal: '$5',
        paddingVertical: '$3',
        fontSize: '$5',
      },
    },
  },
  
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});
`;
        await fsExtra.writeFile(path.join(componentsPath, 'button.tsx'), buttonContent);
    }
    async createInputComponent(componentsPath) {
        const inputContent = `import { Input as TamaguiInput, styled } from 'tamagui';

export const Input = styled(TamaguiInput, {
  backgroundColor: '$gray2',
  borderColor: '$gray7',
  borderWidth: 1,
  borderRadius: '$4',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  fontSize: '$4',
  color: '$gray12',
  
  focusStyle: {
    borderColor: '$blue8',
    backgroundColor: '$gray1',
  },
  
  placeholderTextColor: '$gray9',
});
`;
        await fsExtra.writeFile(path.join(componentsPath, 'input.tsx'), inputContent);
    }
    async createCardComponent(componentsPath) {
        const cardContent = `import { Card as TamaguiCard, styled } from 'tamagui';

export const Card = styled(TamaguiCard, {
  backgroundColor: '$gray1',
  borderColor: '$gray6',
  borderWidth: 1,
  borderRadius: '$4',
  padding: '$4',
  shadowColor: '$gray12',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
});
`;
        await fsExtra.writeFile(path.join(componentsPath, 'card.tsx'), cardContent);
    }
    async createTextComponent(componentsPath) {
        const textContent = `import { Text as TamaguiText, styled } from 'tamagui';

export const Text = styled(TamaguiText, {
  color: '$gray12',
  fontSize: '$4',
  
  variants: {
    size: {
      small: {
        fontSize: '$3',
      },
      large: {
        fontSize: '$5',
      },
      xlarge: {
        fontSize: '$6',
      },
    },
    weight: {
      normal: {
        fontWeight: '400',
      },
      medium: {
        fontWeight: '500',
      },
      semibold: {
        fontWeight: '600',
      },
      bold: {
        fontWeight: '700',
      },
    },
  },
  
  defaultVariants: {
    size: 'medium',
    weight: 'normal',
  },
});
`;
        await fsExtra.writeFile(path.join(componentsPath, 'text.tsx'), textContent);
    }
    generateTamaguiConfig(config) {
        return `import { createTamagui } from 'tamagui';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { themes, tokens } from '@tamagui/themes';

const interFont = createInterFont();

const config = createTamagui({
  fonts: {
    heading: interFont,
    body: interFont,
  },
  themes,
  tokens,
  shorthands,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
`;
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'INSTALL_FAILED',
                    message: originalError instanceof Error ? originalError.message : message,
                    details: originalError,
                    severity: 'error'
                },
                ...errors
            ],
            warnings: [],
            duration: Date.now() - startTime
        };
    }
}
//# sourceMappingURL=tamagui-plugin.js.map