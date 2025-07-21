/**
 * Neon Database Provider Plugin - Pure Infrastructure Implementation
 *
 * Provides Neon PostgreSQL database infrastructure setup.
 * Focuses only on database connection and configuration.
 * ORM functionality is handled by separate ORM plugins.
 */
import { PluginCategory, TargetPlatform } from '../../../types/plugin.js';
import { templateService } from '../../../core/templates/template-service.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService } from '../../../core/project/structure-service.js';
export class NeonPlugin {
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
            id: 'neon',
            name: 'Neon Database',
            version: '1.0.0',
            description: 'Serverless PostgreSQL with branching and autoscaling',
            author: 'The Architech Team',
            category: PluginCategory.DATABASE,
            tags: ['database', 'postgresql', 'serverless', 'neon', 'infrastructure'],
            license: 'MIT',
            repository: 'https://github.com/neondatabase/neon',
            homepage: 'https://neon.tech',
            documentation: 'https://neon.tech/docs'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Infrastructure Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectPath, pluginConfig } = context;
            context.logger.info('Setting up Neon PostgreSQL database...');
            // Step 1: Install Neon CLI (optional, for management)
            await this.installNeonCLI(context);
            // Step 2: Create database configuration
            await this.createDatabaseConfig(context);
            // Step 3: Add environment configuration
            await this.addEnvironmentConfig(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'database', 'neon.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'neon.config.ts')
                    }
                ],
                dependencies: [
                    {
                        name: '@neondatabase/serverless',
                        version: '^1.0.1',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    }
                ],
                scripts: [
                    {
                        name: 'db:neon:status',
                        command: 'neonctl status',
                        description: 'Check Neon database status',
                        category: 'dev'
                    },
                    {
                        name: 'db:neon:branch',
                        command: 'neonctl branch create',
                        description: 'Create new Neon branch',
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
            return this.createErrorResult('Failed to setup Neon database', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            // Remove Neon specific files
            const filesToRemove = [
                'neon.config.ts',
                'neon.config.js',
                'src/lib/database/neon.ts'
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult(`Failed to uninstall Neon database: ${errorMessage}`, startTime, [], error);
        }
    }
    async update(context) {
        return this.install(context);
    }
    // ============================================================================
    // VALIDATION & COMPATIBILITY
    // ============================================================================
    async validate(context) {
        const errors = [];
        const warnings = [];
        // Check if project directory exists
        if (!await fsExtra.pathExists(context.projectPath)) {
            errors.push({
                field: 'projectPath',
                message: `Project directory does not exist: ${context.projectPath}`,
                code: 'DIRECTORY_NOT_FOUND',
                severity: 'error'
            });
        }
        // Check for database configuration
        const dbConfig = context.pluginConfig;
        if (!dbConfig.databaseUrl) {
            warnings.push('DATABASE_URL not configured - you will need to set this environment variable');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    getCompatibility() {
        return {
            frameworks: ['next', 'react', 'vue', 'svelte', 'angular'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['18.0.0', '20.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['postgresql'],
            conflicts: []
        };
    }
    getDependencies() {
        return [
            '@neondatabase/serverless@^1.0.1'
        ];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@neondatabase/serverless',
                version: '^1.0.1',
                description: 'Neon serverless driver'
            },
            {
                type: 'config',
                name: 'DATABASE_URL',
                description: 'Neon database connection string'
            }
        ];
    }
    getDefaultConfig() {
        return {
            projectId: '',
            branchId: '',
            databaseUrl: process.env.DATABASE_URL || '',
            region: 'us-east-1',
            poolSize: 10
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                projectId: {
                    type: 'string',
                    description: 'Neon project ID',
                    default: ''
                },
                branchId: {
                    type: 'string',
                    description: 'Neon branch ID',
                    default: ''
                },
                databaseUrl: {
                    type: 'string',
                    description: 'Neon database connection URL',
                    default: ''
                },
                region: {
                    type: 'string',
                    description: 'Neon region',
                    default: 'us-east-1'
                },
                poolSize: {
                    type: 'number',
                    description: 'Connection pool size',
                    default: 10
                }
            }
        };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async installNeonCLI(context) {
        const { projectPath } = context;
        // Install Neon CLI globally for database management
        try {
            await this.runner.exec('npm', ['install', '-g', 'neonctl']);
            context.logger.info('Neon CLI installed successfully');
        }
        catch (error) {
            context.logger.warn('Failed to install Neon CLI globally - you can install it manually with: npm install -g neonctl');
        }
    }
    async createDatabaseConfig(context) {
        const { projectPath, pluginConfig } = context;
        const structure = context.projectStructure;
        // Create Neon configuration file
        const neonConfig = this.generateNeonConfig(pluginConfig);
        const configPath = path.join(projectPath, 'neon.config.ts');
        await fsExtra.writeFile(configPath, neonConfig);
    }
    async addEnvironmentConfig(context) {
        const { projectPath, pluginConfig } = context;
        // Add environment variables to .env.local
        const envContent = this.generateEnvConfig(pluginConfig);
        const envPath = path.join(projectPath, '.env.local');
        // Append to existing .env.local or create new
        let existingContent = '';
        if (await fsExtra.pathExists(envPath)) {
            existingContent = await fsExtra.readFile(envPath, 'utf-8');
        }
        await fsExtra.writeFile(envPath, existingContent + '\n' + envContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        const structure = context.projectStructure;
        const unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'database');
        await fsExtra.ensureDir(unifiedPath);
        // Create Neon database connection file
        const neonContent = this.generateNeonConnection();
        const neonPath = path.join(unifiedPath, 'neon.ts');
        await fsExtra.writeFile(neonPath, neonContent);
    }
    generateNeonConfig(config) {
        return `import { neonConfig } from '@neondatabase/serverless';

// Neon configuration
export const neonDatabaseConfig = {
  projectId: '${config.projectId || 'your-project-id'}',
  branchId: '${config.branchId || 'main'}',
  region: '${config.region || 'us-east-1'}',
  poolSize: ${config.poolSize || 10}
};

// Configure Neon for better performance
neonConfig.fetchConnectionCache = true;

export default neonDatabaseConfig;
`;
    }
    generateNeonConnection() {
        return `import { neon } from '@neondatabase/serverless';

// Neon database connection
// This is a pure database connection - ORM integration is handled by ORM plugins
const sql = neon(process.env.DATABASE_URL!);

export { sql };

// Database connection utility
export class NeonConnection {
  private static instance: typeof sql;

  static getInstance(): typeof sql {
    if (!this.instance) {
      this.instance = sql;
    }
    return this.instance;
  }

  static async testConnection(): Promise<boolean> {
    try {
      await sql\`SELECT 1\`;
      return true;
    } catch (error) {
      console.error('Neon connection test failed:', error);
      return false;
    }
  }
}

// Health check function
export async function checkNeonHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: Date;
}> {
  try {
    const isConnected = await NeonConnection.testConnection();
    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      message: isConnected ? 'Neon connection successful' : 'Neon connection failed',
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: \`Neon health check failed: \${error instanceof Error ? error.message : 'Unknown error'}\`,
      timestamp: new Date(),
    };
  }
}
`;
    }
    generateEnvConfig(config) {
        return `# ============================================================================
# Neon Database Configuration
# ============================================================================

# REQUIRED: Neon database connection string
# Get this from https://console.neon.tech
DATABASE_URL="${config.databaseUrl || 'postgresql://user:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database?sslmode=require'}"

# ============================================================================
# Neon Project Configuration (optional)
# ============================================================================

# Neon project ID (optional, for CLI operations)
NEON_PROJECT_ID="${config.projectId || 'your-project-id'}"

# Neon branch ID (optional, defaults to 'main')
NEON_BRANCH_ID="${config.branchId || 'main'}"

# Neon region (optional, defaults to 'us-east-1')
NEON_REGION="${config.region || 'us-east-1'}"

# ============================================================================
# Connection Pool Configuration (optional)
# ============================================================================

# Connection pool size (optional, defaults to 10)
NEON_POOL_SIZE="${config.poolSize || 10}"

# ============================================================================
# Development Configuration
# ============================================================================

# Enable connection logging in development
NEON_DEBUG="${process.env.NODE_ENV === 'development' ? 'true' : 'false'}"
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
                    code: 'NEON_SETUP_FAILED',
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
//# sourceMappingURL=neon.plugin.js.map