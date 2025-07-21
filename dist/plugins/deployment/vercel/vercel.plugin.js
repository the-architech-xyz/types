import { PluginCategory, TargetPlatform, ProjectType } from '../../../types/plugin.js';
import { AgentLogger as Logger } from '../../../core/cli/logger.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
export class VercelPlugin {
    logger;
    commandRunner;
    constructor() {
        this.logger = new Logger(false, 'VercelPlugin');
        this.commandRunner = new CommandRunner();
    }
    getMetadata() {
        return {
            id: 'vercel',
            name: 'Vercel',
            version: '1.0.0',
            description: 'Deploy your application to Vercel with zero configuration',
            author: 'The Architech Team',
            category: PluginCategory.DEPLOYMENT,
            tags: ['deployment', 'vercel', 'serverless', 'edge'],
            license: 'MIT',
            repository: 'https://github.com/architech/plugins',
            homepage: 'https://vercel.com',
            documentation: 'https://vercel.com/docs'
        };
    }
    async install(context) {
        try {
            this.logger.info('Installing Vercel deployment plugin...');
            // Install Vercel CLI with specific version
            const installResult = await this.commandRunner.exec('npm', ['install', '-g', 'vercel@latest']);
            if (installResult.code !== 0) {
                return {
                    success: false,
                    artifacts: [],
                    dependencies: [],
                    scripts: [],
                    configs: [],
                    errors: [{
                            code: 'INSTALL_FAILED',
                            message: 'Failed to install Vercel CLI',
                            details: installResult.stderr,
                            severity: 'error'
                        }],
                    warnings: [],
                    duration: 0
                };
            }
            // Add Vercel configuration to package.json
            const packageJsonPath = `${context.projectPath}/package.json`;
            const packageJson = require(packageJsonPath);
            if (!packageJson.scripts) {
                packageJson.scripts = {};
            }
            packageJson.scripts.deploy = 'vercel --prod';
            packageJson.scripts['deploy:dev'] = 'vercel';
            packageJson.scripts['deploy:preview'] = 'vercel --preview';
            packageJson.scripts['vercel:build'] = 'next build';
            packageJson.scripts['vercel:dev'] = 'next dev';
            // Create improved Vercel configuration file
            const vercelConfig = {
                version: 2,
                buildCommand: 'npm run vercel:build',
                devCommand: 'npm run vercel:dev',
                installCommand: 'npm install',
                framework: 'nextjs',
                functions: {
                    'app/api/**/*.ts': {
                        runtime: 'nodejs18.x'
                    }
                },
                env: {
                    NODE_ENV: 'production'
                },
                build: {
                    env: {
                        NODE_ENV: 'production'
                    }
                },
                routes: [
                    {
                        src: '/api/(.*)',
                        dest: '/app/api/$1'
                    },
                    {
                        src: '/(.*)',
                        dest: '/$1'
                    }
                ],
                headers: [
                    {
                        source: '/(.*)',
                        headers: [
                            {
                                key: 'X-Content-Type-Options',
                                value: 'nosniff'
                            },
                            {
                                key: 'X-Frame-Options',
                                value: 'DENY'
                            },
                            {
                                key: 'X-XSS-Protection',
                                value: '1; mode=block'
                            }
                        ]
                    }
                ]
            };
            // Create environment variables template
            const envTemplate = `# Vercel Environment Variables
# Copy this to .env.local and fill in your values

# Vercel Configuration
VERCEL_PROJECT_ID=your_project_id_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_TOKEN=your_token_here

# Environment-specific variables
NEXT_PUBLIC_VERCEL_ENV=production
NEXT_PUBLIC_VERCEL_URL=https://your-app.vercel.app

# Add your other environment variables below
# DATABASE_URL=your_database_url
# API_KEY=your_api_key
`;
            // Create deployment script
            const deployScript = `#!/bin/bash

# Vercel Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=\${1:-production}
PROJECT_DIR="$(pwd)"

echo "🚀 Deploying to Vercel (\$ENVIRONMENT)..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy based on environment
case "\$ENVIRONMENT" in
    "production")
        echo "🚀 Deploying to production..."
        vercel --prod --yes
        ;;
    "preview")
        echo "👀 Deploying preview..."
        vercel --preview --yes
        ;;
    "development")
        echo "🔧 Deploying development..."
        vercel --yes
        ;;
    *)
        echo "❌ Invalid environment. Use: production, preview, or development"
        exit 1
        ;;
esac

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is live at: https://your-app.vercel.app"
`;
            // Create GitHub Actions workflow
            const githubWorkflow = `name: Deploy to Vercel

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: \${{ github.ref == 'refs/heads/main' && '--prod' || '--preview' }}
        working-directory: ./
`;
            this.logger.success('Vercel deployment plugin installed successfully');
            return {
                success: true,
                artifacts: [
                    {
                        type: 'config',
                        path: 'vercel.json',
                        content: JSON.stringify(vercelConfig, null, 2)
                    },
                    {
                        type: 'file',
                        path: '.env.vercel.example',
                        content: envTemplate
                    },
                    {
                        type: 'file',
                        path: 'scripts/deploy.sh',
                        content: deployScript
                    },
                    {
                        type: 'file',
                        path: '.github/workflows/deploy.yml',
                        content: githubWorkflow
                    }
                ],
                dependencies: [
                    {
                        name: 'vercel',
                        version: 'latest',
                        type: 'development',
                        category: PluginCategory.DEPLOYMENT
                    }
                ],
                scripts: [
                    {
                        name: 'deploy',
                        command: 'vercel --prod',
                        description: 'Deploy to production',
                        category: 'deploy'
                    },
                    {
                        name: 'deploy:dev',
                        command: 'vercel',
                        description: 'Deploy to development',
                        category: 'deploy'
                    },
                    {
                        name: 'deploy:preview',
                        command: 'vercel --preview',
                        description: 'Deploy preview',
                        category: 'deploy'
                    },
                    {
                        name: 'vercel:build',
                        command: 'next build',
                        description: 'Build for Vercel',
                        category: 'build'
                    },
                    {
                        name: 'vercel:dev',
                        command: 'next dev',
                        description: 'Development server',
                        category: 'dev'
                    }
                ],
                configs: [
                    {
                        file: 'package.json',
                        content: JSON.stringify(packageJson, null, 2),
                        mergeStrategy: 'merge'
                    }
                ],
                errors: [],
                warnings: [],
                duration: 0
            };
        }
        catch (error) {
            this.logger.error('Failed to install Vercel deployment plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'INSTALL_ERROR',
                        message: 'Failed to install Vercel deployment plugin',
                        details: error,
                        severity: 'error'
                    }],
                warnings: [],
                duration: 0
            };
        }
    }
    async uninstall(context) {
        try {
            this.logger.info('Uninstalling Vercel deployment plugin...');
            // Remove Vercel configuration files
            await this.commandRunner.exec('rm', ['-f', `${context.projectPath}/vercel.json`]);
            await this.commandRunner.exec('rm', ['-f', `${context.projectPath}/.env.vercel.example`]);
            await this.commandRunner.exec('rm', ['-f', `${context.projectPath}/scripts/deploy.sh`]);
            await this.commandRunner.exec('rm', ['-rf', `${context.projectPath}/.github/workflows/deploy.yml`]);
            await this.commandRunner.exec('rm', ['-rf', `${context.projectPath}/lib/deployment`]);
            // Remove Vercel-related environment variables from .env.local
            await this.commandRunner.exec('sed', ['-i', '', '/VERCEL_/d', `${context.projectPath}/.env.local`]);
            this.logger.success('Vercel deployment plugin uninstalled successfully');
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration: 0
            };
        }
        catch (error) {
            this.logger.error('Failed to uninstall Vercel deployment plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'UNINSTALL_ERROR',
                        message: 'Failed to uninstall Vercel deployment plugin',
                        details: error,
                        severity: 'error'
                    }],
                warnings: [],
                duration: 0
            };
        }
    }
    async update(context) {
        try {
            this.logger.info('Updating Vercel deployment plugin...');
            // Update Vercel CLI
            const updateResult = await this.commandRunner.exec('npm', ['update', '-g', 'vercel']);
            this.logger.success('Vercel deployment plugin updated successfully');
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration: 0
            };
        }
        catch (error) {
            this.logger.error('Failed to update Vercel deployment plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'UPDATE_ERROR',
                        message: 'Failed to update Vercel deployment plugin',
                        details: error,
                        severity: 'error'
                    }],
                warnings: [],
                duration: 0
            };
        }
    }
    async validate(context) {
        try {
            this.logger.info('Validating Vercel deployment plugin...');
            // Check if Vercel CLI is installed
            const vercelInstalled = await this.commandRunner.exec('vercel', ['--version']);
            if (vercelInstalled.code !== 0) {
                return {
                    valid: false,
                    errors: [{
                            field: 'vercel-cli',
                            message: 'Vercel CLI is not installed',
                            code: 'CLI_MISSING',
                            severity: 'error'
                        }],
                    warnings: []
                };
            }
            // Check if vercel.json exists
            const vercelConfigExists = await this.commandRunner.exec('test', ['-f', `${context.projectPath}/vercel.json`]);
            if (vercelConfigExists.code !== 0) {
                return {
                    valid: false,
                    errors: [{
                            field: 'vercel-config',
                            message: 'vercel.json configuration file is missing',
                            code: 'CONFIG_MISSING',
                            severity: 'error'
                        }],
                    warnings: []
                };
            }
            this.logger.success('Vercel deployment plugin validation passed');
            return {
                valid: true,
                errors: [],
                warnings: []
            };
        }
        catch (error) {
            this.logger.error('Vercel deployment plugin validation failed:', error);
            return {
                valid: false,
                errors: [{
                        field: 'validation',
                        message: `Validation failed: ${error}`,
                        code: 'VALIDATION_ERROR',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
    }
    getCompatibility() {
        return {
            frameworks: [ProjectType.NEXTJS, ProjectType.REACT, ProjectType.NODE, ProjectType.EXPRESS],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['16.x', '18.x', '20.x'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['vercel'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'vercel',
                description: 'Vercel CLI for deployment',
                version: 'latest'
            }
        ];
    }
    getDefaultConfig() {
        return {
            projectId: '',
            orgId: '',
            token: '',
            environment: 'production',
            autoDeploy: false
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                projectId: {
                    type: 'string',
                    description: 'Vercel project ID'
                },
                orgId: {
                    type: 'string',
                    description: 'Vercel organization ID'
                },
                token: {
                    type: 'string',
                    description: 'Vercel API token'
                },
                environment: {
                    type: 'string',
                    description: 'Deployment environment',
                    enum: ['production', 'preview', 'development'],
                    default: 'production'
                },
                autoDeploy: {
                    type: 'boolean',
                    description: 'Enable automatic deployment',
                    default: false
                }
            },
            required: [],
            additionalProperties: false
        };
    }
}
//# sourceMappingURL=vercel.plugin.js.map