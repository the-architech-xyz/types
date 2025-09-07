import { Blueprint } from '../../types/adapter.js';

const dockerNextjsIntegrationBlueprint: Blueprint = {
  id: 'docker-nextjs-integration',
  name: 'Docker Next.js Integration',
  description: 'Complete Docker containerization for Next.js applications',
  version: '1.0.0',
  actions: [
    // Main Dockerfile
    {
      type: 'ADD_CONTENT',
      target: 'Dockerfile',
      condition: '{{#if integration.features.multiStageBuild}}',
      content: `# Multi-stage Dockerfile for Next.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
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
ENV NEXT_TELEMETRY_DISABLED 1

RUN \\
  if [ -f yarn.lock ]; then yarn run build; \\
  elif [ -f package-lock.json ]; then npm run build; \\
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm run build; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'Dockerfile.dev',
      condition: '{{#if integration.features.developmentMode}}',
      content: `# Development Dockerfile for Next.js application
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \\
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \\
  elif [ -f package-lock.json ]; then npm ci; \\
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD \\
  if [ -f yarn.lock ]; then yarn dev; \\
  elif [ -f package-lock.json ]; then npm run dev; \\
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm dev; \\
  else echo "Lockfile not found." && exit 1; \\
  fi
`
    },
    {
      type: 'ADD_CONTENT',
      target: '.dockerignore',
      condition: '{{#if integration.features.multiStageBuild}}',
      content: `# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'docker-compose.yml',
      condition: '{{#if integration.features.networking}}',
      content: `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/nextjs.conf:/etc/nginx/conf.d/nextjs.conf
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - app
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  app-data:
    driver: local
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'docker-compose.dev.yml',
      condition: '{{#if integration.features.developmentMode}}',
      content: `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    networks:
      - app-network
    restart: unless-stopped
    stdin_open: true
    tty: true

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/nextjs.conf:/etc/nginx/conf.d/nextjs.conf
    depends_on:
      - app
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'nginx/nginx.conf',
      condition: '{{#if integration.features.nginxReverseProxy}}',
      content: `user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Include additional configurations
    include /etc/nginx/conf.d/*.conf;
}
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'nginx/nextjs.conf',
      condition: '{{#if integration.features.nginxReverseProxy}}',
      content: `upstream nextjs_backend {
    server app:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json;

    # Static files caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @nextjs;
    }

    # Next.js static files
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://nextjs_backend;
    }

    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        access_log off;
        proxy_pass http://nextjs_backend;
    }

    # Main application
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Fallback to Next.js
    location @nextjs {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'scripts/docker-build.sh',
      condition: '{{#if integration.features.multiStageBuild}}',
      content: `#!/bin/bash

# Docker build script for Next.js application
set -e

# Default values
BUILD_TYPE="production"
TAG="latest"
PUSH=false
CLEAN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--type)
      BUILD_TYPE="$2"
      shift 2
      ;;
    --tag)
      TAG="$2"
      shift 2
      ;;
    --push)
      PUSH=true
      shift
      ;;
    --clean)
      CLEAN=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -t, --type TYPE    Build type (production, development) [default: production]"
      echo "  --tag TAG          Docker image tag [default: latest]"
      echo "  --push             Push image to registry after build"
      echo "  --clean            Clean up unused Docker resources"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Validate build type
if [[ "$BUILD_TYPE" != "production" && "$BUILD_TYPE" != "development" ]]; then
  echo "Error: Invalid build type. Must be 'production' or 'development'"
  exit 1
fi

echo "Building Docker image for $BUILD_TYPE..."

# Set Dockerfile based on build type
if [[ "$BUILD_TYPE" == "production" ]]; then
  DOCKERFILE="Dockerfile"
else
  DOCKERFILE="Dockerfile.dev"
fi

# Build the image
echo "Building image with tag: $TAG"
docker build -f "$DOCKERFILE" -t "nextjs-app:$TAG" .

if [ $? -eq 0 ]; then
  echo "Build successful!"
else
  echo "Build failed!"
  exit 1
fi

# Push image if requested
if [ "$PUSH" = true ]; then
  echo "Pushing image to registry..."
  docker push "nextjs-app:$TAG"
  
  if [ $? -eq 0 ]; then
    echo "Push successful!"
  else
    echo "Push failed!"
    exit 1
  fi
fi

# Clean up if requested
if [ "$CLEAN" = true ]; then
  echo "Cleaning up unused Docker resources..."
  docker system prune -f
  echo "Cleanup complete!"
fi

echo "Docker build process completed successfully!"
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'scripts/docker-run.sh',
      condition: '{{#if integration.features.productionMode}}',
      content: `#!/bin/bash

# Docker run script for Next.js application
set -e

# Default values
MODE="production"
PORT="3000"
DETACHED=false
CLEAN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -m|--mode)
      MODE="$2"
      shift 2
      ;;
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -d|--detached)
      DETACHED=true
      shift
      ;;
    --clean)
      CLEAN=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -m, --mode MODE    Run mode (production, development) [default: production]"
      echo "  -p, --port PORT    Port to expose [default: 3000]"
      echo "  -d, --detached     Run in detached mode"
      echo "  --clean            Clean up before running"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Validate mode
if [[ "$MODE" != "production" && "$MODE" != "development" ]]; then
  echo "Error: Invalid mode. Must be 'production' or 'development'"
  exit 1
fi

# Clean up if requested
if [ "$CLEAN" = true ]; then
  echo "Cleaning up existing containers..."
  docker-compose down -v
  docker system prune -f
fi

# Set environment variables
export NODE_ENV=$MODE
export PORT=$PORT

echo "Starting Next.js application in $MODE mode..."

# Run the application
if [ "$DETACHED" = true ]; then
  docker-compose up -d
  echo "Application started in detached mode!"
  echo "To view logs: docker-compose logs -f"
  echo "To stop: docker-compose down"
else
  docker-compose up
fi
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'scripts/healthcheck.sh',
      condition: '{{#if integration.features.healthChecks}}',
      content: `#!/bin/bash

# Health check script for Next.js application
set -e

# Default values
URL="http://localhost:3000"
TIMEOUT=30
RETRIES=3
INTERVAL=10

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--url)
      URL="$2"
      shift 2
      ;;
    -t|--timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -r|--retries)
      RETRIES="$2"
      shift 2
      ;;
    -i|--interval)
      INTERVAL="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -u, --url URL      Health check URL [default: http://localhost:3000]"
      echo "  -t, --timeout SEC  Timeout in seconds [default: 30]"
      echo "  -r, --retries NUM  Number of retries [default: 3]"
      echo "  -i, --interval SEC Interval between retries [default: 10]"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "Starting health check for $URL..."

# Health check function
check_health() {
  local url=$1
  local timeout=$2
  
  if command -v curl >/dev/null 2>&1; then
    curl -f -s --max-time $timeout "$url/api/health" >/dev/null 2>&1
  elif command -v wget >/dev/null 2>&1; then
    wget -q --timeout=$timeout -O /dev/null "$url/api/health" >/dev/null 2>&1
  else
    echo "Error: Neither curl nor wget is available"
    return 1
  fi
}

# Perform health checks
for ((i=1; i<=RETRIES; i++)); do
  echo "Health check attempt $i/$RETRIES..."
  
  if check_health "$URL" "$TIMEOUT"; then
    echo "Health check passed!"
    exit 0
  else
    echo "Health check failed!"
    
    if [ $i -lt $RETRIES ]; then
      echo "Waiting $INTERVAL seconds before retry..."
      sleep $INTERVAL
    fi
  fi
done

echo "Health check failed after $RETRIES attempts!"
exit 1
`
    }
  ]
};

export const blueprint = dockerNextjsIntegrationBlueprint;