export class DockerGenerator {
    static generateDockerfile(config) {
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
    static generateDockerignore() {
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
    static generateDockerCompose(config) {
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
    static generateBuildScript(config) {
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
    static generateDeployScript(config) {
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
    static generateK8sDeployment(config) {
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
    static generateK8sService(config) {
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
    static generateK8sIngress(config) {
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
    static generateUnifiedIndex() {
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
    static generateEnvConfig(config) {
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
    static generatePackageJson(config) {
        const imageName = config.imageName || 'myapp';
        return `{
  "scripts": {
    "docker:build": "docker build -t ${imageName}:latest .",
    "docker:run": "docker run -p ${config.port || 3000}:${config.port || 3000} ${imageName}:latest",
    "docker:compose": "docker-compose up -d",
    "docker:compose:down": "docker-compose down",
    "docker:push": "docker push ${imageName}:latest",
    "docker:clean": "docker system prune -f"
  }
}`;
    }
    static generateReadme() {
        return `# Docker Deployment

This project includes Docker configuration for containerized deployment.

## Quick Start

1. **Build the image:**
   \`\`\`bash
   npm run docker:build
   \`\`\`

2. **Run with Docker Compose:**
   \`\`\`bash
   npm run docker:compose
   \`\`\`

3. **Run standalone:**
   \`\`\`bash
   npm run docker:run
   \`\`\`

## Configuration

The Docker configuration can be customized through environment variables:

- \`DOCKER_IMAGE_NAME\`: Name of the Docker image
- \`DOCKER_IMAGE_TAG\`: Tag for the Docker image
- \`DOCKER_PORT\`: Port to expose in the container

## Files

- \`Dockerfile\`: Multi-stage build configuration
- \`.dockerignore\`: Files to exclude from build context
- \`docker-compose.yml\`: Multi-service deployment
- \`scripts/build.sh\`: Build script
- \`scripts/deploy.sh\`: Deployment script

## Kubernetes

Kubernetes manifests are included for production deployment:

- \`k8s/deployment.yaml\`: Application deployment
- \`k8s/service.yaml\`: Service configuration
- \`k8s/ingress.yaml\`: Ingress configuration

## Health Checks

The container includes health checks that verify the application is running properly.

## Security

The container runs as a non-root user for enhanced security.
`;
    }
}
//# sourceMappingURL=DockerGenerator.js.map