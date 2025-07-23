/**
 * Next.js Framework Plugin - Pure Technology Implementation
 * 
 * Provides Next.js framework integration using the official create-next-app CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIFrameworkPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { NextJSSchema } from './NextJSSchema.js';
import { NextJSGenerator } from './NextJSGenerator.js';

export class NextJSPlugin extends BasePlugin implements IUIFrameworkPlugin {
  private generator: NextJSGenerator;

  constructor() {
    super();
    this.generator = new NextJSGenerator();
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'nextjs',
      name: 'Next.js Framework',
      version: '1.0.0',
      description: 'React framework for production with App Router, Server Components, and TypeScript',
      author: 'The Architech Team',
      category: PluginCategory.FRAMEWORK,
      tags: ['react', 'nextjs', 'typescript', 'app-router', 'server-components'],
      license: 'MIT',
    };
  }

  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATION
  // ============================================================================

  getParameterSchema() {
    return NextJSSchema.getParameterSchema();
  }

  // Plugins NEVER generate questions - agents handle this
  getDynamicQuestions(context: PluginContext): any[] {
    return [];
  }

  validateConfiguration(config: Record<string, any>): any {
    const errors: any[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.router) {
      errors.push({
        field: 'router',
        message: 'Router type is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    // Validate router configuration
    if (config.router && !['app', 'pages'].includes(config.router)) {
      warnings.push('Router should be either "app" or "pages"');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.FRAMEWORK,
      exports: [
        {
          name: 'NextPage',
          type: 'interface',
          implementation: 'Next.js page interface',
          documentation: 'Interface for Next.js pages',
          examples: ['const MyPage: NextPage = () => <div>Hello</div>']
        },
        {
          name: 'NextApiRequest',
          type: 'interface',
          implementation: 'Next.js API request interface',
          documentation: 'Interface for Next.js API requests',
          examples: ['export default function handler(req: NextApiRequest) {}']
        }
      ],
      types: [
        {
          name: 'NextConfig',
          type: 'interface',
          definition: 'interface NextConfig { experimental?: any; env?: Record<string, string>; }',
          documentation: 'Next.js configuration interface'
        }
      ],
      utilities: [
        {
          name: 'getServerSideProps',
          type: 'function',
          implementation: 'Server-side props function',
          documentation: 'Get server-side props for pages',
          parameters: [],
          returnType: 'Promise<{ props: any }>',
          examples: ['export const getServerSideProps = async () => ({ props: {} })']
        }
      ],
      constants: [
        {
          name: 'NEXT_PUBLIC_API_URL',
          value: 'process.env.NEXT_PUBLIC_API_URL',
          documentation: 'Public API URL for client-side',
          type: 'string'
        }
      ],
      documentation: 'Next.js framework integration'
    };
  }

  // ============================================================================
  // FRAMEWORK PLUGIN INTERFACE IMPLEMENTATION
  // ============================================================================

  getFrameworkOptions(): string[] {
    return ['nextjs', 'react', 'typescript'];
  }

  getBuildOptions(): string[] {
    return ['webpack', 'turbopack', 'swc'];
  }

  getDeploymentOptions(): string[] {
    return ['vercel', 'netlify', 'aws', 'docker'];
  }

  // ============================================================================
  // PLUGIN INSTALLATION
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();

    try {
      // Initialize path resolver
      this.initializePathResolver(context);

      // Get configuration from context
      const config = context.pluginConfig;

      // Validate configuration
      const validation = this.validateConfiguration(config);
      if (!validation.valid) {
        return this.createErrorResult('Configuration validation failed', validation.errors, startTime);
      }

      // Install dependencies
      const dependencies = this.getDependencies();
      const devDependencies = this.getDevDependencies();
      await this.installDependencies(dependencies, devDependencies);

      // Generate files
      const allFiles = this.generator.generateAllFiles(config as any);
      for (const file of allFiles) {
        const filePath = this.pathResolver.getConfigPath(file.path);
        await this.generateFile(filePath, file.content);
      }

      // Add scripts
      const scripts = this.generator.generateScripts(config as any);
      await this.addScripts(scripts);

      return this.createSuccessResult(
        [
          { type: 'config', path: 'next.config.js', description: 'Next.js configuration' },
          { type: 'config', path: 'tsconfig.json', description: 'TypeScript configuration' },
          { type: 'config', path: 'tailwind.config.js', description: 'Tailwind CSS configuration' },
          { type: 'interface', path: this.pathResolver.getUnifiedInterfacePath('framework'), description: 'Unified framework interface' }
        ],
        dependencies,
        Object.keys(scripts),
        [],
        validation.warnings,
        startTime
      );

    } catch (error) {
      return this.createErrorResult('Next.js plugin installation failed', [error], startTime);
    }
  }

  // ============================================================================
  // DEPENDENCIES AND CONFIGURATION
  // ============================================================================

  getDependencies(): string[] {
    return ['next', 'react', 'react-dom'];
  }

  getDevDependencies(): string[] {
    return [
      '@types/node',
      '@types/react',
      '@types/react-dom',
      'eslint',
      'eslint-config-next',
      'tailwindcss',
      'autoprefixer',
      'postcss'
    ];
  }

  getCompatibility(): any {
    return {
      frameworks: ['react'],
      platforms: ['node', 'browser'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: ['gatsby', 'nuxt', 'sveltekit']
    };
  }

  getConflicts(): string[] {
    return ['gatsby', 'nuxt', 'sveltekit'];
  }

  getRequirements(): any[] {
    return [
      { type: 'node', version: '>=16.0.0' },
      { type: 'package-manager', name: 'npm, yarn, or pnpm' }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      router: 'app',
      typescript: true,
      tailwind: true,
      eslint: true
    };
  }

  getConfigSchema(): any {
    return {
      type: 'object',
      properties: {
        router: { type: 'string', enum: ['app', 'pages'] },
        typescript: { type: 'boolean' },
        tailwind: { type: 'boolean' },
        eslint: { type: 'boolean' }
      },
      required: ['router']
    };
  }
} 