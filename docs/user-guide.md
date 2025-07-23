# The Architech CLI User Guide

## Getting Started

### Installation

The Architech CLI can be installed globally or run directly with npx:

```bash
# Global installation (recommended)
npm install -g the-architech

# Or run directly
npx the-architech create my-app
```

### Prerequisites

- Node.js 16.0.0 or higher
- Any package manager (npm, yarn, pnpm, bun)
- Git (optional, for version control)

## Basic Usage

### Interactive Mode (Recommended)

The easiest way to get started is using interactive mode:

```bash
architech create
```

This will guide you through an intelligent, context-aware process:

1. **Project Description** - Describe what you want to build
2. **Approach Selection** - Choose between guided or selective approach
3. **Technology Recommendations** - Review intelligent suggestions
4. **Configuration** - Customize based on your needs
5. **Generation** - Create your project with all dependencies

### Quick Start with Defaults

For rapid prototyping, use the `--yes` flag to accept all defaults:

```bash
architech create my-app --yes
```

This creates a Next.js 14 project with:
- TypeScript
- Tailwind CSS
- ESLint
- Prettier
- Basic project structure

### Custom Configuration

Specify options directly for more control:

```bash
architech create my-app \
  --project-type ecommerce \
  --package-manager yarn \
  --no-git \
  --no-install
```

## Question System

### 🎯 Intelligent Question Flow

The Architech uses a modern, intelligent question system that adapts to your project type and expertise level.

#### 1. **Project Context Analysis**
The system analyzes your input to understand:
- Project type (e-commerce, blog, dashboard, etc.)
- User expertise level (beginner, intermediate, expert)
- Required features and requirements

#### 2. **Approach Selection**
Choose your preferred interaction style:

**Guided Approach (Recommended)**
- Shows intelligent technology recommendations
- Allows changing recommendations one category at a time
- Best for most users
- Faster setup with expert-curated choices

**Selective Approach**
- Full control over all technology choices
- No recommendations provided
- Best for expert users
- Complete customization

#### 3. **Progressive Questions**
Questions are asked progressively based on:
- Previous answers
- Project context
- User expertise level
- Technology dependencies

### 📋 Example Question Flow

#### E-commerce Project
```
1. "I want to build an e-commerce store for electronics"
   ↓
2. Approach: Guided (recommended)
   ↓
3. Recommendations:
   - Database: Drizzle + Neon (TypeScript-first, excellent performance)
   - Auth: Better Auth (modern, secure)
   - UI: Shadcn UI (beautiful, accessible)
   - Payments: Stripe (industry standard)
   ↓
4. Customize recommendations:
   - Change database to Supabase? [No]
   - Change auth to NextAuth? [No]
   - Change UI to MUI? [No]
   - Change payments to PayPal? [Yes]
   ↓
5. E-commerce specific questions:
   - Business type: B2C
   - Payment methods: Stripe, PayPal
   - Inventory management: Yes
   - Order processing: Automated
   ↓
6. Configuration details:
   - Database connection string
   - Stripe API keys
   - Email service setup
```

#### Blog Project
```
1. "I want to build a blog platform"
   ↓
2. Approach: Guided
   ↓
3. Recommendations:
   - Database: Drizzle + Neon
   - Auth: Better Auth
   - UI: Shadcn UI
   - Email: Resend (modern email API)
   ↓
4. Blog specific questions:
   - Content management: Markdown
   - Comments system: Yes
   - Newsletter integration: Yes
   - SEO requirements: Advanced
   ↓
5. Configuration details:
   - Database setup
   - Email service configuration
   - SEO optimization settings
```

## Project Types

### Quick Prototype (Default)

Single application structure for rapid development:

```bash
architech create my-app --project-type quick-prototype
```

**Features:**
- Single application structure
- Next.js 14 with App Router
- TypeScript support
- Tailwind CSS integration
- ESLint configuration
- Optimized build setup

### E-commerce

Complete e-commerce solution with all necessary features:

```bash
architech create my-store --project-type ecommerce
```

**Features:**
- Product catalog management
- Shopping cart functionality
- Payment processing (Stripe, PayPal)
- Order management
- Inventory tracking
- User authentication
- Admin dashboard

### Blog Platform

Content management system for publishing:

```bash
architech create my-blog --project-type blog
```

**Features:**
- Markdown content management
- Comment system
- Newsletter integration
- SEO optimization
- Social sharing
- Analytics integration
- Author management

### Dashboard Application

Data visualization and analytics platform:

```bash
architech create my-dashboard --project-type dashboard
```

**Features:**
- Data visualization components
- Chart libraries integration
- Real-time data updates
- User role management
- Export capabilities
- Custom widgets
- Performance monitoring

### API Service

Backend API development:

```bash
architech create my-api --project-type api
```

**Features:**
- RESTful API structure
- Database integration
- Authentication middleware
- Rate limiting
- API documentation
- Testing setup
- Deployment configuration

### Fullstack Application

Complete application with frontend and backend:

```bash
architech create my-app --project-type fullstack
```

**Features:**
- Frontend and backend in one project
- Shared types and utilities
- Database integration
- Authentication system
- API routes
- Real-time features
- Deployment ready

### Custom Configuration

For specialized requirements:

```bash
architech create my-app --project-type custom
```

**Features:**
- Full customization control
- Technology selection
- Feature configuration
- Custom integrations
- Specialized setup

## Enterprise Monorepo

For large-scale projects and teams:

```bash
architech my-enterprise
```

**Features:**
- Monorepo structure with Turborepo
- Shared packages for UI, database, and auth
- Multiple applications
- TypeScript end-to-end
- Consistent code quality tools
- Shared configuration
- Optimized builds

### Monorepo Structure

```
my-enterprise/
├── apps/
│   ├── web/              # Main web application
│   ├── admin/            # Admin dashboard
│   └── api/              # Backend API
├── packages/
│   ├── ui/               # Shared UI components
│   ├── database/         # Database schemas and utilities
│   ├── auth/             # Authentication utilities
│   └── config/           # Shared configuration
├── turbo.json            # Turborepo configuration
└── package.json          # Root package.json
```

## Technology Stack

### Database Options

| Technology | Description | Best For |
|------------|-------------|----------|
| **Drizzle ORM** | TypeScript-first ORM | TypeScript projects, performance |
| **Prisma** | Database toolkit | Full-stack applications |
| **Mongoose** | MongoDB ODM | NoSQL databases |

### Authentication Options

| Technology | Description | Best For |
|------------|-------------|----------|
| **Better Auth** | Modern auth library | Next.js applications |
| **NextAuth.js** | Complete auth solution | Full authentication needs |
| **Clerk** | User management platform | Enterprise applications |

### UI Libraries

| Technology | Description | Best For |
|------------|-------------|----------|
| **Shadcn UI** | Beautiful components | Modern, accessible UIs |
| **Material-UI** | Comprehensive library | Enterprise applications |
| **Tamagui** | Universal UI kit | Cross-platform development |

### Payment Processing

| Technology | Description | Best For |
|------------|-------------|----------|
| **Stripe** | Industry standard | Most e-commerce |
| **PayPal** | Global reach | International sales |
| **Square** | Point of sale | Physical + online |

### Email Services

| Technology | Description | Best For |
|------------|-------------|----------|
| **Resend** | Modern email API | Transactional emails |
| **SendGrid** | Enterprise email | High volume |
| **Mailgun** | Developer friendly | Custom email needs |

## Configuration Options

### Command Line Options

```bash
architech create <project-name> [options]

Options:
  --project-type <type>     Project type (ecommerce, blog, dashboard, api, fullstack, custom)
  --package-manager <pm>    Package manager (npm, yarn, pnpm, bun)
  --yes                     Accept all defaults
  --no-git                  Skip Git initialization
  --no-install              Skip dependency installation
  --template <template>     Use specific template
  --output <path>           Output directory
  --verbose                 Verbose output
  --help                    Show help
```

### Environment Variables

```bash
# Database configuration
DATABASE_URL=your-database-url

# Authentication
AUTH_SECRET=your-auth-secret
NEXTAUTH_URL=your-app-url

# Payment processing
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable

# Email service
RESEND_API_KEY=your-resend-api-key
```

## Advanced Usage

### Custom Templates

Create custom project templates:

```bash
# Create template directory
mkdir -p ~/.architech/templates/my-template

# Add template files
cp -r my-project/* ~/.architech/templates/my-template/

# Use custom template
architech create my-app --template my-template
```

### Plugin Development

Create custom plugins for specific technologies:

```bash
# Create plugin directory
mkdir -p src/plugins/libraries/custom/my-plugin

# Implement plugin interface
# See Plugin Development Guide for details

# Register plugin
# Add to plugin registry
```

### Configuration Files

The Architech generates configuration files for your project:

```json
// architech.config.json
{
  "project": {
    "name": "my-app",
    "type": "ecommerce",
    "template": "nextjs-14"
  },
  "plugins": {
    "database": "drizzle",
    "auth": "better-auth",
    "ui": "shadcn-ui",
    "payment": "stripe"
  },
  "config": {
    "database": {
      "provider": "neon",
      "connectionString": "postgresql://..."
    },
    "auth": {
      "provider": "better-auth",
      "secret": "your-secret"
    }
  }
}
```

## Troubleshooting

### Common Issues

#### TypeScript Errors
```bash
# Ensure you're using the latest version
npm update -g the-architech

# Check TypeScript version compatibility
npx tsc --version
```

#### Plugin Issues
```bash
# Check plugin compatibility
architech plugins list

# Update plugins
architech plugins update

# Clear cache
architech cache clear
```

#### Path Issues
```bash
# Verify project structure
ls -la my-project/

# Check for existing files
find . -name "package.json"

# Use different output directory
architech create my-app --output /path/to/directory
```

#### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Use npx instead of global install
npx the-architech create my-app
```

### Getting Help

1. **Documentation** - Check this guide and other documentation
2. **Issues** - Search existing issues on GitHub
3. **Discussions** - Join community discussions
4. **Examples** - Look at example projects in the repository

### Debug Mode

Enable verbose output for debugging:

```bash
architech create my-app --verbose
```

This will show:
- Detailed question flow
- Plugin execution steps
- File generation process
- Error details

## Best Practices

### 🎯 Project Setup

1. **Start with Guided Approach**
   - Use recommendations for faster setup
   - Customize only what you need
   - Leverage expert-curated choices

2. **Choose Appropriate Project Type**
   - Match project type to your needs
   - Consider scalability requirements
   - Plan for future growth

3. **Configure Environment Variables**
   - Set up database connections
   - Configure authentication secrets
   - Add API keys for services

### 🔧 Development Workflow

1. **Use TypeScript**
   - Better type safety
   - Improved developer experience
   - Easier refactoring

2. **Follow Project Structure**
   - Use generated file structure
   - Maintain consistency
   - Follow naming conventions

3. **Leverage Generated APIs**
   - Use unified interface files
   - Consistent API patterns
   - Technology-agnostic code

### 🚀 Deployment

1. **Environment Configuration**
   - Set production environment variables
   - Configure database connections
   - Add service API keys

2. **Build Optimization**
   - Use generated build scripts
   - Optimize for production
   - Configure CDN and caching

3. **Monitoring and Analytics**
   - Set up error tracking
   - Configure performance monitoring
   - Add user analytics

---

*This guide covers using The Architech CLI. For development and customization, see the [Plugin Development Guide](./plugin-development.md) and [Architecture Overview](./architecture-overview.md).* 