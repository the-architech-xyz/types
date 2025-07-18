/**
 * Deployment Agent - DevOps Automation Specialist
 * 
 * Sets up production-ready deployment infrastructure:
 * - Multi-stage Dockerfile optimized for Next.js
 * - GitHub Actions CI/CD workflows
 * - Environment configuration
 * - Docker Compose for local development
 */

import chalk from 'chalk';
import path from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

export class DeploymentAgent {
  constructor(commandRunner) {
    this.runner = commandRunner;
    this.name = 'DeploymentAgent';
  }

  async execute(config) {
    const { projectPath } = config;
    
    console.log(chalk.cyan(`🔧 [${this.name}] Setting up deployment infrastructure...`));
    
    try {
      // Step 1: Create Dockerfile
      await this.createDockerfile(projectPath);
      
      // Step 2: Create Docker Compose files
      await this.createDockerCompose(projectPath);
      
      // Step 3: Create GitHub Actions workflow
      await this.createGitHubActions(projectPath);
      
      // Step 4: Create environment files
      await this.createEnvironmentFiles(projectPath);
      
      // Step 5: Create .dockerignore
      await this.createDockerIgnore(projectPath);
      
      console.log(chalk.green(`✅ [${this.name}] Deployment infrastructure configured successfully`));
      
    } catch (error) {
      console.log(chalk.red(`❌ [${this.name}] Failed: ${error.message}`));
      throw error;
    }
  }

  async createDockerfile(projectPath) {
    console.log(chalk.blue(`🐳 Creating optimized Dockerfile...`));
    
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
    
    writeFileSync(path.join(projectPath, 'Dockerfile'), dockerfile);
    console.log(chalk.green(`✅ Dockerfile created`));
  }

  async createDockerCompose(projectPath) {
    console.log(chalk.blue(`🐳 Creating Docker Compose configuration...`));
    
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
    
    writeFileSync(path.join(projectPath, 'docker-compose.yml'), dockerCompose);
    writeFileSync(path.join(projectPath, 'docker-compose.dev.yml'), dockerComposeDev);
    console.log(chalk.green(`✅ Docker Compose files created`));
  }

  async createGitHubActions(projectPath) {
    console.log(chalk.blue(`⚙️  Creating GitHub Actions workflow...`));
    
    const workflowsPath = path.join(projectPath, '.github', 'workflows');
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
    
    writeFileSync(path.join(workflowsPath, 'ci.yml'), ciWorkflow);
    console.log(chalk.green(`✅ GitHub Actions workflow created`));
  }

  async createEnvironmentFiles(projectPath) {
    console.log(chalk.blue(`🌍 Creating environment configuration...`));
    
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
    
    writeFileSync(path.join(projectPath, '.env.example'), envExample);
    writeFileSync(path.join(projectPath, '.env.local.example'), envLocal);
    console.log(chalk.green(`✅ Environment files created`));
  }

  async createDockerIgnore(projectPath) {
    console.log(chalk.blue(`📝 Creating .dockerignore...`));
    
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
    
    writeFileSync(path.join(projectPath, '.dockerignore'), dockerIgnore);
    console.log(chalk.green(`✅ .dockerignore created`));
  }
} 