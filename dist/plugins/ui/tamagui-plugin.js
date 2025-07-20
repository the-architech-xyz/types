/**
 * Tamagui Plugin - Cross-Platform UI Framework
 *
 * Provides Tamagui integration using the official @tamagui/cli.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../utils/template-service.js';
import { CommandRunner } from '../../utils/command-runner.js';
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
            description: 'Cross-platform UI framework for React and React Native',
            author: 'The Architech Team',
            category: PluginCategory.UI_LIBRARY,
            tags: ['ui', 'react', 'react-native', 'cross-platform', 'design-system'],
            license: 'MIT',
            repository: 'https://github.com/tamagui/tamagui',
            homepage: 'https://tamagui.dev'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        const { projectPath, pluginConfig } = context;
        const tamaguiConfig = pluginConfig;
        try {
            context.logger.info('Installing Tamagui UI framework...');
            // Install Tamagui CLI and core packages
            await this.installDependencies(context, tamaguiConfig);
            // Initialize Tamagui configuration
            await this.initializeTamagui(projectPath, tamaguiConfig, context);
            // Install additional dependencies based on configuration
            await this.installAdditionalDependencies(projectPath, tamaguiConfig, context);
            // Create Tamagui configuration files
            await this.createConfigurationFiles(projectPath, tamaguiConfig);
            // Create example components
            await this.createExampleComponents(projectPath, tamaguiConfig);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'tamagui.config.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'tamagui.css')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'Button.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'Card.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'Input.tsx')
                    }
                ],
                dependencies: [
                    {
                        name: '@tamagui/core',
                        version: '^1.74.0',
                        type: 'production',
                        category: PluginCategory.UI_LIBRARY
                    },
                    {
                        name: '@tamagui/config',
                        version: '^1.74.0',
                        type: 'production',
                        category: PluginCategory.UI_LIBRARY
                    },
                    {
                        name: '@tamagui/font-inter',
                        version: '^1.74.0',
                        type: 'production',
                        category: PluginCategory.UI_LIBRARY
                    },
                    {
                        name: '@tamagui/animations-css',
                        version: '^1.74.0',
                        type: 'production',
                        category: PluginCategory.ANIMATION
                    }
                ],
                scripts: [
                    {
                        name: 'tamagui:build',
                        command: 'tamagui build',
                        description: 'Build Tamagui components',
                        category: 'build'
                    },
                    {
                        name: 'tamagui:studio',
                        command: 'tamagui studio',
                        description: 'Open Tamagui Studio',
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
            context.logger.error(`Tamagui installation failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
            return this.createErrorResult(`Failed to install Tamagui: ${error instanceof Error ? error.message : 'Unknown error occurred'}`, startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            // Remove Tamagui specific files
            const filesToRemove = [
                'tamagui.config.ts',
                'src/tamagui.css',
                'src/components/ui'
            ];
            for (const file of filesToRemove) {
                const filePath = path.join(projectPath, file);
                if (await fsExtra.pathExists(filePath)) {
                    await fsExtra.remove(filePath);
                }
            }
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return this.createErrorResult(`Failed to uninstall Tamagui: ${error instanceof Error ? error.message : 'Unknown error occurred'}`, startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            // Update Tamagui packages
            await this.runner.execCommand(['npm', 'update', '@tamagui/core', '@tamagui/config', '@tamagui/cli'], {
                cwd: projectPath
            });
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return this.createErrorResult(`Failed to update Tamagui: ${error instanceof Error ? error.message : 'Unknown error occurred'}`, startTime, [], error);
        }
    }
    // ============================================================================
    // VALIDATION & COMPATIBILITY
    // ============================================================================
    async validate(context) {
        const { projectPath } = context;
        const errors = [];
        const warnings = [];
        // Check if project directory exists
        if (!await fsExtra.pathExists(projectPath)) {
            errors.push('Project directory does not exist');
        }
        // Check if package.json exists (required for dependency installation)
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (!await fsExtra.pathExists(packageJsonPath)) {
            errors.push('package.json not found - required for dependency installation');
        }
        // Check for potential conflicts (as warnings)
        if (await fsExtra.pathExists(packageJsonPath)) {
            const packageJson = await fsExtra.readJson(packageJsonPath);
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            // Check for conflicting UI libraries
            const conflicts = ['@shadcn/ui', 'chakra-ui', '@mui/material', '@emotion/react'];
            for (const conflict of conflicts) {
                if (dependencies[conflict]) {
                    warnings.push(`Potential conflict detected: ${conflict} is already installed`);
                }
            }
        }
        // Check if Tamagui is already installed (as warning)
        const tamaguiConfigPath = path.join(projectPath, 'tamagui.config.ts');
        if (await fsExtra.pathExists(tamaguiConfigPath)) {
            warnings.push('Tamagui configuration already exists - may overwrite existing setup');
        }
        return {
            valid: errors.length === 0,
            errors: errors.map(error => ({
                field: 'tamagui',
                message: error,
                code: 'TAMAGUI_ERROR',
                severity: 'error'
            })),
            warnings,
            suggestions: errors.length > 0 ? ['Ensure project directory and package.json exist before installation'] : []
        };
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'expo'],
            platforms: [TargetPlatform.WEB, TargetPlatform.MOBILE],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            conflicts: ['shadcn-ui', 'chakra-ui', 'mui']
        };
    }
    getDependencies() {
        return ['react', 'react-dom'];
    }
    getConflicts() {
        return ['shadcn-ui', 'chakra-ui', 'mui'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'react',
                version: '>=18.0.0',
                description: 'React framework required for Tamagui'
            },
            {
                type: 'package',
                name: 'react-dom',
                version: '>=18.0.0',
                description: 'React DOM required for Tamagui'
            }
        ];
    }
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    getDefaultConfig() {
        return {
            components: ['Button', 'Card', 'Input', 'Text', 'Stack'],
            theme: 'both',
            animations: true,
            mediaQueries: true,
            tokens: true,
            fonts: ['Inter', 'System'],
            icons: 'tamagui',
            platform: 'web'
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                components: {
                    type: 'array',
                    description: 'Tamagui components to include',
                    default: ['Button', 'Card', 'Input', 'Text', 'Stack'],
                    items: {
                        type: 'string',
                        description: 'Tamagui component name',
                        enum: ['Button', 'Card', 'Input', 'Text', 'Stack', 'XStack', 'YStack', 'H1', 'H2', 'H3', 'Paragraph']
                    }
                },
                theme: {
                    type: 'string',
                    description: 'Theme configuration',
                    default: 'both',
                    enum: ['light', 'dark', 'both']
                },
                animations: {
                    type: 'boolean',
                    description: 'Enable Tamagui animations',
                    default: true
                },
                mediaQueries: {
                    type: 'boolean',
                    description: 'Enable responsive media queries',
                    default: true
                },
                tokens: {
                    type: 'boolean',
                    description: 'Include design tokens',
                    default: true
                },
                fonts: {
                    type: 'array',
                    description: 'Font families to include',
                    default: ['Inter', 'System'],
                    items: {
                        type: 'string',
                        description: 'Font family name'
                    }
                },
                icons: {
                    type: 'string',
                    description: 'Icon library to use',
                    default: 'tamagui',
                    enum: ['tamagui', 'lucide', 'heroicons']
                },
                platform: {
                    type: 'string',
                    description: 'Target platform for Tamagui',
                    default: 'web',
                    enum: ['web', 'react-native', 'both']
                }
            }
        };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async installDependencies(context, config) {
        const { projectPath } = context;
        let dependencies = [];
        // Choose dependencies based on platform
        if (config.platform === 'web' || config.platform === 'both') {
            // Web-only dependencies
            dependencies = [
                '@tamagui/core',
                '@tamagui/config',
                '@tamagui/font-inter',
                '@tamagui/animations-css'
            ];
        }
        else if (config.platform === 'react-native') {
            // React Native dependencies
            dependencies = [
                '@tamagui/core',
                '@tamagui/config',
                '@tamagui/font-inter',
                '@tamagui/animations-react-native',
                'react-native'
            ];
        }
        if (dependencies.length > 0) {
            try {
                await this.runner.execCommand(['npm', 'install', ...dependencies], {
                    cwd: projectPath
                });
            }
            catch (error) {
                // If installation fails due to peer dependencies, try with legacy peer deps
                context.logger.warn('Standard installation failed, trying with legacy peer deps...');
                try {
                    await this.runner.execCommand(['npm', 'install', ...dependencies, '--legacy-peer-deps'], {
                        cwd: projectPath
                    });
                }
                catch (legacyError) {
                    throw new Error(`Failed to install Tamagui dependencies: ${legacyError instanceof Error ? legacyError.message : 'Unknown error'}`);
                }
            }
        }
    }
    async initializeTamagui(projectPath, config, context) {
        try {
            // Try to use Tamagui CLI first
            await this.runner.execCommand(['npx', '@tamagui/cli', 'init'], {
                cwd: projectPath
            });
        }
        catch (error) {
            // If CLI fails, create configuration manually
            context.logger.warn('Tamagui CLI initialization failed, creating configuration manually...');
            // Create the configuration files manually
            await this.createConfigurationFiles(projectPath, config);
            await this.createExampleComponents(projectPath, config);
        }
    }
    async installAdditionalDependencies(projectPath, config, context) {
        const dependencies = [];
        // Add platform-specific dependencies
        if (config.platform === 'web' || config.platform === 'both') {
            // Web-specific dependencies are already installed in installDependencies
        }
        else if (config.platform === 'react-native') {
            // React Native specific dependencies are already installed in installDependencies
        }
        // Add icon library based on configuration
        if (config.icons === 'lucide') {
            dependencies.push('lucide-react');
        }
        else if (config.icons === 'heroicons') {
            dependencies.push('@heroicons/react');
        }
        if (dependencies.length > 0) {
            try {
                await this.runner.execCommand(['npm', 'install', ...dependencies], {
                    cwd: projectPath
                });
            }
            catch (error) {
                // If installation fails, try with legacy peer deps
                context.logger.warn('Additional dependencies installation failed, trying with legacy peer deps...');
                try {
                    await this.runner.execCommand(['npm', 'install', ...dependencies, '--legacy-peer-deps'], {
                        cwd: projectPath
                    });
                }
                catch (legacyError) {
                    throw new Error(`Failed to install additional Tamagui dependencies: ${legacyError instanceof Error ? legacyError.message : 'Unknown error'}`);
                }
            }
        }
    }
    async createConfigurationFiles(projectPath, config) {
        // Create Tamagui configuration
        const tamaguiConfig = this.generateTamaguiConfig(config);
        await fsExtra.writeFile(path.join(projectPath, 'tamagui.config.ts'), tamaguiConfig);
        // Ensure src directory exists
        const srcDir = path.join(projectPath, 'src');
        await fsExtra.ensureDir(srcDir);
        // Create CSS file
        const cssContent = this.generateTamaguiCSS();
        await fsExtra.writeFile(path.join(srcDir, 'tamagui.css'), cssContent);
    }
    async createExampleComponents(projectPath, config) {
        const componentsDir = path.join(projectPath, 'src', 'components', 'ui');
        await fsExtra.ensureDir(componentsDir);
        // Create Button component
        const buttonComponent = this.generateButtonComponent(config);
        await fsExtra.writeFile(path.join(componentsDir, 'Button.tsx'), buttonComponent);
        // Create Card component
        const cardComponent = this.generateCardComponent(config);
        await fsExtra.writeFile(path.join(componentsDir, 'Card.tsx'), cardComponent);
        // Create Input component
        const inputComponent = this.generateInputComponent(config);
        await fsExtra.writeFile(path.join(componentsDir, 'Input.tsx'), inputComponent);
    }
    generateTamaguiConfig(config) {
        if (config.platform === 'web' || config.platform === 'both') {
            return this.generateWebTamaguiConfig(config);
        }
        else if (config.platform === 'react-native') {
            return this.generateReactNativeTamaguiConfig(config);
        }
        // Default to web config
        return this.generateWebTamaguiConfig(config);
    }
    generateWebTamaguiConfig(config) {
        return `import { createTamagui, createTokens } from 'tamagui'

const tokens = createTokens({
  color: {
    primary: '#007bff',
    primaryHover: '#0056b3',
    primaryPress: '#004085',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    background: '#ffffff',
    backgroundHover: '#f5f5f5',
    backgroundPress: '#e5e5e5',
    backgroundFocus: '#f0f0f0',
    color: '#000000',
    colorHover: '#1a1a1a',
    colorPress: '#2a2a2a',
    colorFocus: '#1a1a1a',
    borderColor: '#e5e5e5',
    borderColorHover: '#d5d5d5',
    borderColorFocus: '#007bff',
    borderColorPress: '#0056b3',
    placeholderColor: '#6c757d',
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
})

const media = {
  xs: { maxWidth: 660 },
  sm: { maxWidth: 800 },
  md: { maxWidth: 1020 },
  lg: { maxWidth: 1280 },
  xl: { maxWidth: 1420 },
  xxl: { maxWidth: 1600 },
  gtXs: { minWidth: 660 + 1 },
  gtSm: { minWidth: 800 + 1 },
  gtMd: { minWidth: 1020 + 1 },
  gtLg: { minWidth: 1280 + 1 },
  short: { maxHeight: 820 },
  tall: { minHeight: 820 },
  hoverNone: { hover: 'none' },
  pointerCoarse: { pointer: 'coarse' },
}

const animations = {
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  slow: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
}

const themes = {
  light: {
    background: tokens.color.background,
    backgroundHover: tokens.color.backgroundHover,
    backgroundPress: tokens.color.backgroundPress,
    backgroundFocus: tokens.color.backgroundFocus,
    color: tokens.color.color,
    colorHover: tokens.color.colorHover,
    colorPress: tokens.color.colorPress,
    colorFocus: tokens.color.colorFocus,
    borderColor: tokens.color.borderColor,
    borderColorHover: tokens.color.borderColorHover,
    borderColorFocus: tokens.color.borderColorFocus,
    borderColorPress: tokens.color.borderColorPress,
    placeholderColor: tokens.color.placeholderColor,
  },
  dark: {
    background: '#1a1a1a',
    backgroundHover: '#2a2a2a',
    backgroundPress: '#3a3a3a',
    backgroundFocus: '#2f2f2f',
    color: '#ffffff',
    colorHover: '#f0f0f0',
    colorPress: '#e0e0e0',
    colorFocus: '#f0f0f0',
    borderColor: '#404040',
    borderColorHover: '#505050',
    borderColorFocus: '#007bff',
    borderColorPress: '#0056b3',
    placeholderColor: '#6c757d',
  }
}

const tamaguiConfig = createTamagui({
  tokens,
  themes,
  media,
  animations,
})

export type AppConfig = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig
`;
    }
    generateReactNativeTamaguiConfig(config) {
        return `import { createTamagui, createTokens } from 'tamagui'

const tokens = createTokens({
  color: {
    primary: '#007bff',
    primaryHover: '#0056b3',
    primaryPress: '#004085',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    background: '#ffffff',
    backgroundHover: '#f5f5f5',
    backgroundPress: '#e5e5e5',
    backgroundFocus: '#f0f0f0',
    color: '#000000',
    colorHover: '#1a1a1a',
    colorPress: '#2a2a2a',
    colorFocus: '#1a1a1a',
    borderColor: '#e5e5e5',
    borderColorHover: '#d5d5d5',
    borderColorFocus: '#007bff',
    borderColorPress: '#0056b3',
    placeholderColor: '#6c757d',
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
})

const media = {
  xs: { maxWidth: 660 },
  sm: { maxWidth: 800 },
  md: { maxWidth: 1020 },
  lg: { maxWidth: 1280 },
  xl: { maxWidth: 1420 },
  xxl: { maxWidth: 1600 },
  gtXs: { minWidth: 660 + 1 },
  gtSm: { minWidth: 800 + 1 },
  gtMd: { minWidth: 1020 + 1 },
  gtLg: { minWidth: 1280 + 1 },
  short: { maxHeight: 820 },
  tall: { minHeight: 820 },
  hoverNone: { hover: 'none' },
  pointerCoarse: { pointer: 'coarse' },
}

const animations = {
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  slow: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
}

const themes = {
  light: {
    background: tokens.color.background,
    backgroundHover: tokens.color.backgroundHover,
    backgroundPress: tokens.color.backgroundPress,
    backgroundFocus: tokens.color.backgroundFocus,
    color: tokens.color.color,
    colorHover: tokens.color.colorHover,
    colorPress: tokens.color.colorPress,
    colorFocus: tokens.color.colorFocus,
    borderColor: tokens.color.borderColor,
    borderColorHover: tokens.color.borderColorHover,
    borderColorFocus: tokens.color.borderColorFocus,
    borderColorPress: tokens.color.borderColorPress,
    placeholderColor: tokens.color.placeholderColor,
  },
  dark: {
    background: '#1a1a1a',
    backgroundHover: '#2a2a2a',
    backgroundPress: '#3a3a3a',
    backgroundFocus: '#2f2f2f',
    color: '#ffffff',
    colorHover: '#f0f0f0',
    colorPress: '#e0e0e0',
    colorFocus: '#f0f0f0',
    borderColor: '#404040',
    borderColorHover: '#505050',
    borderColorFocus: '#007bff',
    borderColorPress: '#0056b3',
    placeholderColor: '#6c757d',
  }
}

const tamaguiConfig = createTamagui({
  tokens,
  themes,
  media,
  animations,
})

export type AppConfig = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig
`;
    }
    generateTamaguiCSS() {
        return `/* Tamagui CSS Reset and Base Styles */
* {
  box-sizing: border-box;
}

html {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--background);
  color: var(--color);
}

/* Tamagui theme variables */
:root {
  --background: #ffffff;
  --background-hover: #f5f5f5;
  --background-press: #e5e5e5;
  --background-focus: #f0f0f0;
  --color: #000000;
  --color-hover: #1a1a1a;
  --color-press: #2a2a2a;
  --color-focus: #1a1a1a;
  --border-color: #e5e5e5;
  --border-color-hover: #d5d5d5;
  --border-color-focus: #007bff;
  --border-color-press: #0056b3;
  --placeholder-color: #6c757d;
  --primary: #007bff;
  --primary-hover: #0056b3;
  --primary-press: #004085;
  --secondary: #6c757d;
  --success: #28a745;
  --warning: #ffc107;
  --error: #dc3545;
}

[data-theme="dark"] {
  --background: #1a1a1a;
  --background-hover: #2a2a2a;
  --background-press: #3a3a3a;
  --background-focus: #2f2f2f;
  --color: #ffffff;
  --color-hover: #f0f0f0;
  --color-press: #e0e0e0;
  --color-focus: #f0f0f0;
  --border-color: #404040;
  --border-color-hover: #505050;
  --border-color-focus: #007bff;
  --border-color-press: #0056b3;
  --placeholder-color: #6c757d;
}

/* Tamagui component base styles */
.tamagui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--primary);
  color: white;
}

.tamagui-button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.tamagui-button:active {
  background-color: var(--primary-press);
  transform: translateY(0);
}

.tamagui-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.tamagui-card {
  background-color: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.tamagui-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tamagui-input {
  background-color: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--color);
  transition: all 0.2s ease;
}

.tamagui-input::placeholder {
  color: var(--placeholder-color);
}

.tamagui-input:hover {
  border-color: var(--border-color-hover);
}

.tamagui-input:focus {
  outline: none;
  border-color: var(--border-color-focus);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.tamagui-input:disabled {
  background-color: var(--background-hover);
  color: var(--placeholder-color);
  cursor: not-allowed;
}
`;
    }
    generateButtonComponent(config) {
        if (config.platform === 'web' || config.platform === 'both') {
            return this.generateWebButtonComponent();
        }
        else if (config.platform === 'react-native') {
            return this.generateReactNativeButtonComponent();
        }
        // Default to web component
        return this.generateWebButtonComponent();
    }
    generateWebButtonComponent() {
        return `import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  variant = 'primary',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'tamagui-button';
  
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-5 py-3 text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    outline: 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50',
    ghost: 'bg-transparent text-blue-500 hover:bg-blue-50'
  };
  
  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
`;
    }
    generateReactNativeButtonComponent() {
        return `import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface ButtonProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  variant = 'primary',
  disabled = false,
  onPress,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    styles[size],
    styles[variant],
    disabled && styles.disabled,
    style
  ];

  const textStyleCombined = [
    styles.text,
    styles[\`\${size}Text\`],
    styles[\`\${variant}Text\`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={textStyleCombined}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primary: {
    backgroundColor: '#007bff',
  },
  secondary: {
    backgroundColor: '#6c757d',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '500',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#007bff',
  },
  ghostText: {
    color: '#007bff',
  },
  disabledText: {
    color: '#6c757d',
  },
});

export default Button;
`;
    }
    generateCardComponent(config) {
        if (config.platform === 'web' || config.platform === 'both') {
            return this.generateWebCardComponent();
        }
        else if (config.platform === 'react-native') {
            return this.generateReactNativeCardComponent();
        }
        // Default to web component
        return this.generateWebCardComponent();
    }
    generateWebCardComponent() {
        return `import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  elevation?: 'low' | 'medium' | 'high';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'low',
  interactive = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'tamagui-card';
  
  const elevationClasses = {
    low: 'shadow-sm',
    medium: 'shadow-md',
    high: 'shadow-lg'
  };
  
  const interactiveClasses = interactive ? 'cursor-pointer' : '';
  
  const classes = [
    baseClasses,
    elevationClasses[elevation],
    interactiveClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
`;
    }
    generateReactNativeCardComponent() {
        return `import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  elevation?: 'low' | 'medium' | 'high';
  interactive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'low',
  interactive = false,
  onPress,
  style,
  ...props
}) => {
  const cardStyle = [
    styles.card,
    styles[elevation],
    interactive && styles.interactive,
    style
  ];

  return (
    <View
      style={cardStyle}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 16,
  },
  low: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  high: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  interactive: {
    // Add interactive styles if needed
  },
});

export default Card;
`;
    }
    generateInputComponent(config) {
        if (config.platform === 'web' || config.platform === 'both') {
            return this.generateWebInputComponent();
        }
        else if (config.platform === 'react-native') {
            return this.generateReactNativeInputComponent();
        }
        // Default to web component
        return this.generateWebInputComponent();
    }
    generateWebInputComponent() {
        return `import React from 'react';

export interface InputProps {
  value?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  size?: 'small' | 'medium' | 'large';
  error?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  placeholder,
  type = 'text',
  size = 'medium',
  error = false,
  disabled = false,
  onChange,
  onFocus,
  onBlur,
  className = '',
  ...props
}) => {
  const baseClasses = 'tamagui-input';
  
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg'
  };
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '';
  
  const classes = [
    baseClasses,
    sizeClasses[size],
    errorClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      value={value}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      className={classes}
      {...props}
    />
  );
};

export default Input;
`;
    }
    generateReactNativeInputComponent() {
        return `import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface InputProps {
  value?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  size?: 'small' | 'medium' | 'large';
  error?: boolean;
  disabled?: boolean;
  onChangeText?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  value,
  placeholder,
  secureTextEntry = false,
  size = 'medium',
  error = false,
  disabled = false,
  onChangeText,
  onFocus,
  onBlur,
  style,
  textStyle,
  ...props
}) => {
  const inputStyle = [
    styles.input,
    styles[size],
    error && styles.error,
    disabled && styles.disabled,
    style
  ];

  const textStyleCombined = [
    styles.text,
    styles[\`\${size}Text\`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TextInput
      value={value}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      editable={!disabled}
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
      style={inputStyle}
      placeholderTextColor="#6c757d"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
    color: '#000000',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  error: {
    borderColor: '#dc3545',
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    color: '#6c757d',
  },
  text: {
    // Base text styles
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    color: '#6c757d',
  },
});

export default Input;
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
                    code: 'TAMAGUI_ERROR',
                    message,
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