/**
 * Docker Deployment Plugin - Pure Technology Implementation
 *
 * Provides Docker containerization and deployment setup.
 * Focuses only on containerization technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import { templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class DockerPlugin {
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
            id: 'docker',
            name: 'Docker Deployment',
            version: '1.0.0',
            description: 'Containerization and deployment with Docker',
            author: 'The Architech Team',
            category: PluginCategory.DEPLOYMENT,
            tags: ['deployment', 'containerization', 'docker', 'kubernetes', 'microservices'],
            license: 'Apache-2.0',
            repository: 'https://github.com/docker/docker-ce',
            homepage: 'https://www.docker.com',
            documentation: 'https://docs.docker.com'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Docker deployment...');
            // Step 1: Create Docker configuration files
            await this.createDockerFiles(context);
            // Step 2: Create deployment scripts
            await this.createDeploymentScripts(context);
            // Step 3: Create Kubernetes manifests (optional)
            await this.createKubernetesManifests(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'Dockerfile')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, '.dockerignore')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'docker-compose.yml')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'scripts', 'docker-build.sh')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'scripts', 'docker-deploy.sh')
                    }
                ],
                dependencies: [],
                scripts: [
                    {
                        name: 'docker:build',
                        command: './scripts/docker-build.sh',
                        description: 'Build Docker image',
                        category: 'dev'
                    },
                    {
                        name: 'docker:run',
                        command: 'docker-compose up -d',
                        description: 'Run Docker containers',
                        category: 'dev'
                    },
                    {
                        name: 'docker:stop',
                        command: 'docker-compose down',
                        description: 'Stop Docker containers',
                        category: 'dev'
                    },
                    {
                        name: 'docker:deploy',
                        command: './scripts/docker-deploy.sh',
                        description: 'Deploy to production',
                        category: 'deploy'
                    }
                ],
                configs: [
                    {
                        file: '.env',
                        content: this.generateEnvConfig(pluginConfig),
                        mergeStrategy: 'append'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Docker deployment', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Docker deployment...');
            // Remove Docker files
            const filesToRemove = [
                path.join(projectPath, 'Dockerfile'),
                path.join(projectPath, '.dockerignore'),
                path.join(projectPath, 'docker-compose.yml'),
                path.join(projectPath, 'scripts', 'docker-build.sh'),
                path.join(projectPath, 'scripts', 'docker-deploy.sh'),
                path.join(projectPath, 'k8s')
            ];
            for (const file of filesToRemove) {
                if (await fsExtra.pathExists(file)) {
                    await fsExtra.remove(file);
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
                warnings: ['Docker files removed. You may need to manually remove Docker images and containers'],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Docker deployment', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Updating Docker deployment...');
            // Update Docker files with latest best practices
            await this.createDockerFiles(context);
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
            return this.createErrorResult('Failed to update Docker deployment', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            // Check if Dockerfile exists
            const dockerfilePath = path.join(context.projectPath, 'Dockerfile');
            if (!await fsExtra.pathExists(dockerfilePath)) {
                errors.push({
                    field: 'docker.dockerfile',
                    message: 'Dockerfile not found',
                    code: 'MISSING_DOCKERFILE',
                    severity: 'error'
                });
            }
            // Check if docker-compose.yml exists
            const composePath = path.join(context.projectPath, 'docker-compose.yml');
            if (!await fsExtra.pathExists(composePath)) {
                errors.push({
                    field: 'docker.compose',
                    message: 'docker-compose.yml not found',
                    code: 'MISSING_COMPOSE',
                    severity: 'error'
                });
            }
            // Check if Docker is installed
            try {
                await this.runner.execCommand(['docker', '--version']);
            }
            catch {
                warnings.push('Docker is not installed or not accessible');
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [{
                        field: 'validation',
                        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        code: 'VALIDATION_ERROR',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'angular'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['postgresql', 'mysql', 'sqlite', 'mongodb'],
            conflicts: []
        };
    }
    getDependencies() {
        return [];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'binary',
                name: 'docker',
                description: 'Docker runtime',
                version: '>=20.0.0'
            },
            {
                type: 'binary',
                name: 'docker-compose',
                description: 'Docker Compose',
                version: '>=2.0.0'
            }
        ];
    }
    getDefaultConfig() {
        return {
            imageName: 'myapp',
            imageTag: 'latest',
            port: 3000,
            enableMultiStage: true,
            enableHealthCheck: true,
            enableOptimization: true,
            nodeVersion: '18-alpine'
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                imageName: {
                    type: 'string',
                    description: 'Docker image name',
                    default: 'myapp'
                },
                imageTag: {
                    type: 'string',
                    description: 'Docker image tag',
                    default: 'latest'
                },
                port: {
                    type: 'number',
                    description: 'Application port',
                    default: 3000
                },
                enableMultiStage: {
                    type: 'boolean',
                    description: 'Enable multi-stage build',
                    default: true
                },
                enableHealthCheck: {
                    type: 'boolean',
                    description: 'Enable health checks',
                    default: true
                },
                enableOptimization: {
                    type: 'boolean',
                    description: 'Enable build optimization',
                    default: true
                },
                nodeVersion: {
                    type: 'string',
                    description: 'Node.js version for Docker',
                    default: '18-alpine'
                }
            },
            required: ['imageName', 'port']
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async createDockerFiles(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Creating Docker files...');
        // Generate Dockerfile
        const dockerfileContent = this.generateDockerfile(pluginConfig);
        await fsExtra.writeFile(path.join(projectPath, 'Dockerfile'), dockerfileContent);
        // Generate .dockerignore
        const dockerignoreContent = this.generateDockerignore();
        await fsExtra.writeFile(path.join(projectPath, '.dockerignore'), dockerignoreContent);
        // Generate docker-compose.yml
        const composeContent = this.generateDockerCompose(pluginConfig);
        await fsExtra.writeFile(path.join(projectPath, 'docker-compose.yml'), composeContent);
    }
    async createDeploymentScripts(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Creating deployment scripts...');
        // Create scripts directory
        const scriptsDir = path.join(projectPath, 'scripts');
        await fsExtra.ensureDir(scriptsDir);
        // Generate build script
        const buildScriptContent = this.generateBuildScript(pluginConfig);
        await fsExtra.writeFile(path.join(scriptsDir, 'docker-build.sh'), buildScriptContent);
        // Generate deploy script
        const deployScriptContent = this.generateDeployScript(pluginConfig);
        await fsExtra.writeFile(path.join(scriptsDir, 'docker-deploy.sh'), deployScriptContent);
        // Make scripts executable
        await this.runner.execCommand(['chmod', '+x', path.join(scriptsDir, 'docker-build.sh')]);
        await this.runner.execCommand(['chmod', '+x', path.join(scriptsDir, 'docker-deploy.sh')]);
    }
    async createKubernetesManifests(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Creating Kubernetes manifests...');
        // Create k8s directory
        const k8sDir = path.join(projectPath, 'k8s');
        await fsExtra.ensureDir(k8sDir);
        // Generate deployment manifest
        const deploymentContent = this.generateK8sDeployment(pluginConfig);
        await fsExtra.writeFile(path.join(k8sDir, 'deployment.yml'), deploymentContent);
        // Generate service manifest
        const serviceContent = this.generateK8sService(pluginConfig);
        await fsExtra.writeFile(path.join(k8sDir, 'service.yml'), serviceContent);
        // Generate ingress manifest
        const ingressContent = this.generateK8sIngress(pluginConfig);
        await fsExtra.writeFile(path.join(k8sDir, 'ingress.yml'), ingressContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        context.logger.info('Generating unified interface files...');
        const deployDir = path.join(projectPath, 'src', 'lib', 'deploy');
        await fsExtra.ensureDir(deployDir);
        // Generate unified deployment interface
        const unifiedContent = this.generateUnifiedIndex();
        await fsExtra.writeFile(path.join(deployDir, 'index.ts'), unifiedContent);
    }
    generateDockerfile(config) {
        const enableMultiStage = config.enableMultiStage !== false;
        const enableHealthCheck = config.enableHealthCheck !== false;
        const enableOptimization = config.enableOptimization !== false;
        const nodeVersion = config.nodeVersion || '18-alpine';
        const port = config.port || 3000;
        if (enableMultiStage) {
            return `# Multi-stage build for optimization
FROM node:${nodeVersion} AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE ${port}

${enableHealthCheck ? `
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/api/health || exit 1` : ''}

# Start the application
CMD ["node", "server.js"]`;
        }
        else {
            return `# Simple single-stage build
FROM node:${nodeVersion}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE ${port}

${enableHealthCheck ? `
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/api/health || exit 1` : ''}

# Start the application
CMD ["npm", "start"]`;
        }
    }
    generateDockerignore() {
        return `# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
.next
out
dist
build

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode
.idea
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Git
.git
.gitignore

# Docker
Dockerfile
.dockerignore
docker-compose.yml

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage

# Temporary folders
tmp
temp`;
    }
    generateDockerCompose(config) {
        const imageName = config.imageName || 'myapp';
        const imageTag = config.imageTag || 'latest';
        const port = config.port || 3000;
        return `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: ${imageName}:${imageTag}
    container_name: ${imageName}-app
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=production
      - PORT=${port}
    env_file:
      - .env
    restart: unless-stopped
    ${config.enableHealthCheck ? `
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${port}/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s` : ''}
    networks:
      - app-network

  # Database service (if needed)
  # db:
  #   image: postgres:15-alpine
  #   container_name: ${imageName}-db
  #   environment:
  #     POSTGRES_DB: myapp
  #     POSTGRES_USER: postgres
  #     POSTGRES_PASSWORD: password
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   networks:
  #     - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:`;
    }
    generateBuildScript(config) {
        const imageName = config.imageName || 'myapp';
        const imageTag = config.imageTag || 'latest';
        return `#!/bin/bash

# Docker build script
set -e

echo "🐳 Building Docker image..."

# Build the image
docker build -t ${imageName}:${imageTag} .

echo "✅ Docker image built successfully!"
echo "Image: ${imageName}:${imageTag}"

# Optional: Push to registry
# echo "📤 Pushing to registry..."
# docker push ${imageName}:${imageTag}

echo "🎉 Build completed!"`;
    }
    generateDeployScript(config) {
        const imageName = config.imageName || 'myapp';
        const imageTag = config.imageTag || 'latest';
        return `#!/bin/bash

# Docker deployment script
set -e

echo "🚀 Deploying application..."

# Pull latest image
docker pull ${imageName}:${imageTag}

# Stop existing containers
docker-compose down

# Start new containers
docker-compose up -d

echo "✅ Application deployed successfully!"

# Health check
echo "🏥 Checking application health..."
sleep 10
curl -f http://localhost:${config.port || 3000}/api/health || echo "⚠️  Health check failed"

echo "🎉 Deployment completed!"`;
    }
    generateK8sDeployment(config) {
        const imageName = config.imageName || 'myapp';
        const imageTag = config.imageTag || 'latest';
        const port = config.port || 3000;
        return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${imageName}-deployment
  labels:
    app: ${imageName}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${imageName}
  template:
    metadata:
      labels:
        app: ${imageName}
    spec:
      containers:
      - name: ${imageName}
        image: ${imageName}:${imageTag}
        ports:
        - containerPort: ${port}
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "${port}"
        ${config.enableHealthCheck ? `
        livenessProbe:
          httpGet:
            path: /api/health
            port: ${port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: ${port}
          initialDelaySeconds: 5
          periodSeconds: 5` : ''}
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"`;
    }
    generateK8sService(config) {
        const imageName = config.imageName || 'myapp';
        const port = config.port || 3000;
        return `apiVersion: v1
kind: Service
metadata:
  name: ${imageName}-service
spec:
  selector:
    app: ${imageName}
  ports:
    - protocol: TCP
      port: 80
      targetPort: ${port}
  type: LoadBalancer`;
    }
    generateK8sIngress(config) {
        const imageName = config.imageName || 'myapp';
        return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${imageName}-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: ${imageName}.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${imageName}-service
            port:
              number: 80`;
    }
    generateUnifiedIndex() {
        return `/**
 * Unified Deployment Interface - Docker Implementation
 * 
 * This file provides a unified interface for deployment operations
 * that works with Docker. It abstracts away Docker-specific details
 * and provides a clean API for deployment operations.
 */

// ============================================================================
// UNIFIED DEPLOYMENT INTERFACE
// ============================================================================

export interface UnifiedDeployment {
  // Build operations
  build: (options?: BuildOptions) => Promise<BuildResult>;
  
  // Deploy operations
  deploy: (options?: DeployOptions) => Promise<DeployResult>;
  
  // Health checks
  healthCheck: () => Promise<HealthResult>;
  
  // Utility
  getStatus: () => Promise<DeploymentStatus>;
  rollback: (version: string) => Promise<RollbackResult>;
}

export interface BuildOptions {
  imageName?: string;
  imageTag?: string;
  platform?: string;
  push?: boolean;
}

export interface DeployOptions {
  environment?: string;
  replicas?: number;
  strategy?: 'rolling' | 'recreate';
}

export interface BuildResult {
  success: boolean;
  imageId: string;
  imageName: string;
  imageTag: string;
  duration: number;
  errors: string[];
}

export interface DeployResult {
  success: boolean;
  deploymentId: string;
  status: string;
  duration: number;
  errors: string[];
}

export interface HealthResult {
  healthy: boolean;
  status: string;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  message?: string;
}

export interface DeploymentStatus {
  status: 'running' | 'stopped' | 'error' | 'unknown';
  replicas: number;
  availableReplicas: number;
  version: string;
  uptime: number;
}

export interface RollbackResult {
  success: boolean;
  previousVersion: string;
  currentVersion: string;
  duration: number;
  errors: string[];
}

// ============================================================================
// DOCKER IMPLEMENTATION
// ============================================================================

export const createUnifiedDeployment = (): UnifiedDeployment => {
  return {
    // Build operations
    async build(options = {}): Promise<BuildResult> {
      const startTime = Date.now();
      
      try {
        // Implementation would use Docker API or CLI
        console.log('Building Docker image...');
        
        return {
          success: true,
          imageId: 'docker-image-id',
          imageName: options.imageName || 'myapp',
          imageTag: options.imageTag || 'latest',
          duration: Date.now() - startTime,
          errors: []
        };
      } catch (error) {
        return {
          success: false,
          imageId: '',
          imageName: options.imageName || 'myapp',
          imageTag: options.imageTag || 'latest',
          duration: Date.now() - startTime,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        };
      }
    },

    // Deploy operations
    async deploy(options = {}): Promise<DeployResult> {
      const startTime = Date.now();
      
      try {
        // Implementation would use Docker Compose or Kubernetes API
        console.log('Deploying application...');
        
        return {
          success: true,
          deploymentId: 'deployment-id',
          status: 'running',
          duration: Date.now() - startTime,
          errors: []
        };
      } catch (error) {
        return {
          success: false,
          deploymentId: '',
          status: 'error',
          duration: Date.now() - startTime,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        };
      }
    },

    // Health checks
    async healthCheck(): Promise<HealthResult> {
      try {
        // Implementation would check container health
        return {
          healthy: true,
          status: 'healthy',
          checks: [
            {
              name: 'container',
              status: 'healthy',
              message: 'Container is running'
            }
          ]
        };
      } catch (error) {
        return {
          healthy: false,
          status: 'unhealthy',
          checks: [
            {
              name: 'container',
              status: 'unhealthy',
              message: error instanceof Error ? error.message : 'Unknown error'
            }
          ]
        };
      }
    },

    // Utility
    async getStatus(): Promise<DeploymentStatus> {
      try {
        // Implementation would get deployment status
        return {
          status: 'running',
          replicas: 3,
          availableReplicas: 3,
          version: 'latest',
          uptime: Date.now()
        };
      } catch (error) {
        return {
          status: 'unknown',
          replicas: 0,
          availableReplicas: 0,
          version: 'unknown',
          uptime: 0
        };
      }
    },

    async rollback(version: string): Promise<RollbackResult> {
      const startTime = Date.now();
      
      try {
        // Implementation would rollback to previous version
        console.log(\`Rolling back to version: \${version}\`);
        
        return {
          success: true,
          previousVersion: 'current',
          currentVersion: version,
          duration: Date.now() - startTime,
          errors: []
        };
      } catch (error) {
        return {
          success: false,
          previousVersion: 'unknown',
          currentVersion: version,
          duration: Date.now() - startTime,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        };
      }
    },
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const deployment = createUnifiedDeployment();
export default deployment;
`;
    }
    generateEnvConfig(config) {
        return `# Docker Deployment Configuration
DOCKER_IMAGE_NAME="${config.imageName || 'myapp'}"
DOCKER_IMAGE_TAG="${config.imageTag || 'latest'}"
DOCKER_PORT="${config.port || 3000}"

# Registry configuration (optional)
# DOCKER_REGISTRY="your-registry.com"
# DOCKER_USERNAME="your-username"
# DOCKER_PASSWORD="your-password"
`;
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'DOCKER_INSTALL_ERROR',
                    message,
                    details: originalError,
                    severity: 'error'
                },
                ...errors
            ],
            warnings: [],
            duration
        };
    }
}
//# sourceMappingURL=docker.plugin.js.map