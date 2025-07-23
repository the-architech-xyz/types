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

### Example Question Flow

```
User Input: "I want to build an e-commerce store for electronics"

1. Context Analysis:
   - Project Type: ecommerce
   - Expertise: intermediate
   - Features: payments, inventory, shipping

2. Approach Selection:
   - Guided (recommended) vs Selective

3. Technology Recommendations:
   - Database: Drizzle + Neon (TypeScript-first, excellent performance)
   - Auth: Better Auth (modern, secure)
   - UI: Shadcn UI (beautiful, accessible)
   - Payments: Stripe (industry standard)

4. Progressive Questions:
   - Business type (B2B, B2C, marketplace)
   - Payment methods (Stripe, PayPal, etc.)
   - Inventory management
   - Order processing
   - Shipping options
```

## Project Types

### E-commerce Projects

**Best for:** Online stores, marketplaces, retail applications

**Features:**
- Product catalog management
- Shopping cart functionality
- Payment processing
- Order management
- Inventory tracking
- Shipping integration

**Recommended Stack:**
- Database: Drizzle + Neon
- Auth: Better Auth
- UI: Shadcn UI
- Payments: Stripe
- Email: Resend

### Blog Projects

**Best for:** Content management, publishing, media sites

**Features:**
- Content management system
- Comments and discussions
- Newsletter integration
- SEO optimization
- Social sharing
- Analytics

**Recommended Stack:**
- Database: Drizzle + Neon
- Auth: Better Auth
- UI: Shadcn UI
- Email: Resend
- CMS: Custom or headless

### Dashboard Projects

**Best for:** Admin panels, analytics, business intelligence

**Features:**
- Data visualization
- User management
- Role-based access
- Real-time updates
- Export capabilities
- Advanced filtering

**Recommended Stack:**
- Database: Prisma + Supabase
- Auth: Clerk
- UI: MUI
- Email: Resend
- Charts: Recharts or Chart.js

### API Projects

**Best for:** Backend services, microservices, APIs

**Features:**
- RESTful API endpoints
- Authentication middleware
- Rate limiting
- API documentation
- Testing framework
- Deployment configuration

**Recommended Stack:**
- Database: Drizzle + Neon
- Auth: Better Auth
- Framework: Next.js API routes
- Testing: Vitest
- Documentation: Swagger/OpenAPI

### Fullstack Projects

**Best for:** Complete applications, MVPs, prototypes

**Features:**
- Full frontend and backend
- Database integration
- Authentication system
- UI components
- Deployment ready
- Testing setup

**Recommended Stack:**
- Database: Drizzle + Neon
- Auth: Better Auth
- UI: Shadcn UI
- Framework: Next.js 14
- Testing: Vitest + Playwright

## Technology Stack

### Database Options

#### Drizzle ORM
- **Best for:** TypeScript-first development
- **Features:** Type-safe queries, excellent performance
- **Providers:** Neon, Supabase, PlanetScale, local SQLite

#### Prisma
- **Best for:** Rich ecosystem and tooling
- **Features:** Auto-generated client, migrations
- **Providers:** PostgreSQL, MySQL, SQLite, MongoDB

#### Mongoose
- **Best for:** MongoDB applications
- **Features:** Schema validation, middleware
- **Providers:** MongoDB Atlas, local MongoDB

### Authentication Options

#### Better Auth
- **Best for:** Modern, secure authentication
- **Features:** OAuth, email/password, session management
- **Providers:** GitHub, Google, Discord, custom

#### NextAuth.js
- **Best for:** Complete authentication solution
- **Features:** Extensive provider support, callbacks
- **Providers:** 50+ providers including social logins

#### Clerk
- **Best for:** User management platform
- **Features:** Dashboard, user profiles, multi-tenancy
- **Providers:** Social logins, email/password, magic links

### UI Libraries

#### Shadcn UI
- **Best for:** Beautiful, accessible components
- **Features:** Copy-paste components, Tailwind CSS
- **Customization:** Full control over styling

#### Material-UI (MUI)
- **Best for:** Comprehensive component library
- **Features:** 100+ components, theming system
- **Customization:** Theme-based customization

#### Tamagui
- **Best for:** Cross-platform development
- **Features:** Universal UI kit, performance optimized
- **Customization:** Design token system

## Advanced Usage

### Enterprise Monorepo

Create a scalable monorepo structure:

```bash
architech my-enterprise
```

This generates:
- Turborepo configuration
- Multiple applications
- Shared packages
- TypeScript end-to-end
- Consistent tooling

### Custom Configuration

Override default settings:

```bash
architech create my-app \
  --database drizzle \
  --auth better-auth \
  --ui shadcn \
  --package-manager pnpm \
  --no-git \
  --no-install
```

### Environment Variables

The generated project includes environment variable templates:

```bash
# .env.local
DATABASE_URL="your-database-url"
AUTH_SECRET="your-auth-secret"
STRIPE_SECRET_KEY="your-stripe-key"
RESEND_API_KEY="your-resend-key"
```

## Troubleshooting

### Common Issues

#### TypeScript Errors
```bash
# Ensure you're using the latest version
npm update -g the-architech

# Check Node.js version
node --version  # Should be >= 16.0.0
```

#### Plugin Issues
```bash
# Clear cache and reinstall
npm cache clean --force
npm install -g the-architech
```

#### Path Issues
```bash
# Verify project structure
ls -la my-app/
# Should show: src/, package.json, etc.
```

### Getting Help

1. **Check Documentation** - Start with this guide
2. **GitHub Issues** - Search existing issues
3. **Community** - Join discussions
4. **Examples** - Look at generated projects

## Best Practices

### Project Setup

1. **Use Interactive Mode** - Let the AI guide your choices
2. **Review Recommendations** - Understand why technologies are suggested
3. **Customize Gradually** - Start with defaults, then customize
4. **Version Control** - Initialize git for your project

### Development Workflow

1. **Understand the Architecture** - Read the generated code
2. **Use Unified Interfaces** - Leverage the technology-agnostic APIs
3. **Follow Patterns** - Use the established project structure
4. **Test Thoroughly** - Use the included testing setup

### Deployment

1. **Environment Variables** - Configure all required secrets
2. **Database Setup** - Initialize your database
3. **Domain Configuration** - Set up your domain and SSL
4. **Monitoring** - Add error tracking and analytics

---

*For detailed technical information, see the [Architecture Overview](./architecture-overview.md) and [Plugin Development](./plugin-development.md) guides.* 