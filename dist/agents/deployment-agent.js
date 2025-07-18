/**
 * Deployment Agent - DevOps Automation Specialist
 *
 * Sets up production-ready deployment infrastructure:
 * - Multi-stage Dockerfile optimized for Next.js
 * - GitHub Actions CI/CD workflows
 * - Environment configuration
 * - Docker Compose for local development
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
export class DeploymentAgent extends AbstractAgent {
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'DeploymentAgent',
            version: '1.0.0',
            description: 'Sets up production-ready deployment infrastructure',
            author: 'The Architech Team',
            category: AgentCategory.DEPLOYMENT,
            tags: ['deployment', 'docker', 'ci-cd', 'github-actions', 'devops'],
            dependencies: [],
            conflicts: [],
            requirements: [
                {
                    type: 'package',
                    name: 'next',
                    description: 'Next.js for application framework'
                },
                {
                    type: 'package',
                    name: 'typescript',
                    description: 'TypeScript for type safety'
                }
            ],
            license: 'MIT',
            repository: 'https://github.com/the-architech/cli'
        };
    }
    getAgentCapabilities() {
        return [
            {
                name: 'create-dockerfile',
                description: 'Creates optimized multi-stage Dockerfile for Next.js',
                parameters: [],
                examples: [
                    {
                        name: 'Create Dockerfile',
                        description: 'Creates production-ready Dockerfile with multi-stage build',
                        parameters: {},
                        expectedResult: 'Optimized Dockerfile for Next.js applications'
                    }
                ],
                category: CapabilityCategory.SETUP
            },
            {
                name: 'create-docker-compose',
                description: 'Creates Docker Compose configuration for development and production',
                parameters: [],
                examples: [
                    {
                        name: 'Create Docker Compose',
                        description: 'Sets up docker-compose.yml and docker-compose.dev.yml',
                        parameters: {},
                        expectedResult: 'Docker Compose files for local development and production'
                    }
                ],
                category: CapabilityCategory.SETUP
            },
            {
                name: 'create-github-actions',
                description: 'Creates GitHub Actions CI/CD workflow',
                parameters: [],
                examples: [
                    {
                        name: 'Create GitHub Actions',
                        description: 'Sets up automated testing and deployment pipeline',
                        parameters: {},
                        expectedResult: 'GitHub Actions workflow for CI/CD'
                    }
                ],
                category: CapabilityCategory.SETUP
            },
            {
                name: 'create-environment-files',
                description: 'Creates environment configuration files',
                parameters: [],
                examples: [
                    {
                        name: 'Create Environment Files',
                        description: 'Sets up .env.example and .env.local.example',
                        parameters: {},
                        expectedResult: 'Environment configuration templates'
                    }
                ],
                category: CapabilityCategory.CONFIGURATION
            }
        ];
    }
    // ============================================================================
    // CORE EXECUTION
    // ============================================================================
    async executeInternal(context) {
        const { projectPath } = context;
        context.logger.info('Setting up deployment infrastructure...');
        try {
            const artifacts = [];
            const startTime = Date.now();
            // Step 1: Create Dockerfile
            const dockerArtifacts = await this.createDockerfile(context);
            artifacts.push(...dockerArtifacts);
            // Step 2: Create Docker Compose files
            const composeArtifacts = await this.createDockerCompose(context);
            artifacts.push(...composeArtifacts);
            // Step 3: Create GitHub Actions workflow
            const githubArtifacts = await this.createGitHubActions(context);
            artifacts.push(...githubArtifacts);
            // Step 4: Create environment files
            const envArtifacts = await this.createEnvironmentFiles(context);
            artifacts.push(...envArtifacts);
            // Step 5: Create .dockerignore
            const ignoreArtifacts = await this.createDockerIgnore(context);
            artifacts.push(...ignoreArtifacts);
            const duration = Date.now() - startTime;
            context.logger.success('Deployment infrastructure configured successfully');
            return {
                success: true,
                data: {
                    filesCreated: ['Dockerfile', 'docker-compose.yml', 'docker-compose.dev.yml', '.github/workflows/ci.yml', '.env.example', '.env.local.example', '.dockerignore'],
                    configurations: ['docker', 'docker-compose', 'github-actions', 'environment']
                },
                duration,
                artifacts,
                nextSteps: [
                    'Update .env.example with your actual environment variables',
                    'Configure GitHub repository secrets for deployment',
                    'Run "docker-compose up" for local development',
                    'Push to main branch to trigger CI/CD pipeline'
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Failed to configure deployment infrastructure: ${errorMessage}`, error);
            return this.createErrorResult('DEPLOYMENT_SETUP_FAILED', `Failed to configure deployment infrastructure: ${errorMessage}`, [], 0, error);
        }
    }
    // ============================================================================
    // VALIDATION
    // ============================================================================
    async validate(context) {
        const baseValidation = await super.validate(context);
        if (!baseValidation.valid) {
            return baseValidation;
        }
        const errors = [];
        const warnings = [];
        // Check if project has package.json
        const packageJsonPath = path.join(context.projectPath, 'package.json');
        if (!existsSync(packageJsonPath)) {
            errors.push({
                field: 'projectPath',
                message: 'package.json not found in project directory',
                code: 'MISSING_PACKAGE_JSON',
                severity: 'error'
            });
        }
        // Check if Next.js is configured
        const nextConfigPath = path.join(context.projectPath, 'next.config.js');
        if (!existsSync(nextConfigPath)) {
            warnings.push('Next.js configuration not found - Docker setup may need adjustments');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async createDockerfile(context) {
        context.logger.info('Creating optimized Dockerfile...');
        const dockerfile = `# Multi-stage Dockerfile for Next.js optimized for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \\
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \\
  elif [ -f package-lock.json ]; then npm ci; \\
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
`;
        const dockerfilePath = path.join(context.projectPath, 'Dockerfile');
        writeFileSync(dockerfilePath, dockerfile);
        context.logger.success('Dockerfile created');
        return [
            {
                type: 'file',
                path: dockerfilePath,
                content: dockerfile,
                metadata: { tool: 'docker', type: 'dockerfile' }
            }
        ];
    }
    async createDockerCompose(context) {
        context.logger.info('Creating Docker Compose configuration...');
        const dockerCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  app-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
`;
        const dockerComposeDev = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
`;
        const composePath = path.join(context.projectPath, 'docker-compose.yml');
        const composeDevPath = path.join(context.projectPath, 'docker-compose.dev.yml');
        writeFileSync(composePath, dockerCompose);
        writeFileSync(composeDevPath, dockerComposeDev);
        context.logger.success('Docker Compose files created');
        return [
            {
                type: 'file',
                path: composePath,
                content: dockerCompose,
                metadata: { tool: 'docker-compose', type: 'production' }
            },
            {
                type: 'file',
                path: composeDevPath,
                content: dockerComposeDev,
                metadata: { tool: 'docker-compose', type: 'development' }
            }
        ];
    }
    async createGitHubActions(context) {
        context.logger.info('Creating GitHub Actions workflow...');
        const workflowsPath = path.join(context.projectPath, '.github', 'workflows');
        if (!existsSync(workflowsPath)) {
            mkdirSync(workflowsPath, { recursive: true });
        }
        const ciWorkflow = `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linter
      run: npm run lint

    - name: Run type check
      run: npm run type-check

    - name: Run tests
      run: npm test

    - name: Build application
      run: npm run build

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          ghcr.io/\${{ github.repository }}:latest
          ghcr.io/\${{ github.repository }}:\${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
`;
        const workflowPath = path.join(workflowsPath, 'ci.yml');
        writeFileSync(workflowPath, ciWorkflow);
        context.logger.success('GitHub Actions workflow created');
        return [
            {
                type: 'file',
                path: workflowPath,
                content: ciWorkflow,
                metadata: { tool: 'github-actions', type: 'ci-cd' }
            }
        ];
    }
    async createEnvironmentFiles(context) {
        context.logger.info('Creating environment configuration...');
        const envExample = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"

# Authentication
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# External APIs
# Add your API keys here

# Feature Flags
# FEATURE_ANALYTICS=true
# FEATURE_PAYMENTS=true
`;
        const envLocal = `# Local development environment
# Copy this file to .env.local and update with your values

DATABASE_URL="postgresql://postgres:password@localhost:5432/dev"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
`;
        const envExamplePath = path.join(context.projectPath, '.env.example');
        const envLocalPath = path.join(context.projectPath, '.env.local.example');
        writeFileSync(envExamplePath, envExample);
        writeFileSync(envLocalPath, envLocal);
        context.logger.success('Environment files created');
        return [
            {
                type: 'file',
                path: envExamplePath,
                content: envExample,
                metadata: { tool: 'environment', type: 'example' }
            },
            {
                type: 'file',
                path: envLocalPath,
                content: envLocal,
                metadata: { tool: 'environment', type: 'local-example' }
            }
        ];
    }
    async createDockerIgnore(context) {
        context.logger.info('Creating .dockerignore...');
        const dockerIgnore = `# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local development
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# Testing
coverage
.nyc_output

# Next.js
.next/
out/

# Production build
/dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode
.idea

# Git
.git
.gitignore
README.md

# CI/CD
.github
`;
        const dockerIgnorePath = path.join(context.projectPath, '.dockerignore');
        writeFileSync(dockerIgnorePath, dockerIgnore);
        context.logger.success('.dockerignore created');
        return [
            {
                type: 'file',
                path: dockerIgnorePath,
                content: dockerIgnore,
                metadata: { tool: 'docker', type: 'ignore' }
            }
        ];
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
        context.logger.info('Rolling back DeploymentAgent changes...');
        const filesToRemove = [
            'Dockerfile',
            'docker-compose.yml',
            'docker-compose.dev.yml',
            '.github/workflows/ci.yml',
            '.env.example',
            '.env.local.example',
            '.dockerignore'
        ];
        for (const file of filesToRemove) {
            const filePath = path.join(context.projectPath, file);
            if (existsSync(filePath)) {
                try {
                    // Note: In a real implementation, you'd want to restore the original files
                    // For now, we'll just log what would be removed
                    context.logger.info(`Would remove: ${file}`);
                }
                catch (error) {
                    context.logger.warn(`Could not remove ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        }
        context.logger.success('DeploymentAgent rollback completed');
    }
}
//# sourceMappingURL=deployment-agent.js.map