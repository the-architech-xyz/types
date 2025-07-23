/**
 * Recommendation Engine
 *
 * Provides intelligent technology recommendations based on project context,
 * requirements, and best practices. This is the core intelligence of the system.
 */
export class RecommendationEngine {
    /**
     * Get recommendations for a project context
     */
    getRecommendations(context) {
        const recommendations = {};
        // Database recommendations
        recommendations.database = this.getDatabaseRecommendation(context);
        // Auth recommendations
        recommendations.auth = this.getAuthRecommendation(context);
        // UI recommendations
        recommendations.ui = this.getUIRecommendation(context);
        // Optional recommendations based on features
        if (context.features.includes('payments')) {
            recommendations.payment = this.getPaymentRecommendation(context);
        }
        if (context.features.includes('email')) {
            recommendations.email = this.getEmailRecommendation(context);
        }
        if (context.features.includes('testing')) {
            recommendations.testing = this.getTestingRecommendation(context);
        }
        if (context.features.includes('deployment')) {
            recommendations.deployment = this.getDeploymentRecommendation(context);
        }
        return recommendations;
    }
    /**
     * Get alternatives for a category
     */
    getAlternatives(category) {
        const alternatives = {
            database: [
                {
                    category: 'database',
                    plugin: 'drizzle',
                    provider: 'neon',
                    reason: 'TypeScript-first ORM with excellent performance',
                    confidence: 0.9,
                    alternatives: ['prisma', 'typeorm']
                },
                {
                    category: 'database',
                    plugin: 'prisma',
                    provider: 'neon',
                    reason: 'Popular ORM with great developer experience',
                    confidence: 0.8,
                    alternatives: ['drizzle', 'typeorm']
                },
                {
                    category: 'database',
                    plugin: 'supabase',
                    provider: 'supabase',
                    reason: 'Full-stack platform with built-in auth and real-time',
                    confidence: 0.7,
                    alternatives: ['neon', 'planetscale']
                }
            ],
            auth: [
                {
                    category: 'auth',
                    plugin: 'better-auth',
                    reason: 'Modern auth library with excellent TypeScript support',
                    confidence: 0.9,
                    alternatives: ['nextauth', 'clerk']
                },
                {
                    category: 'auth',
                    plugin: 'nextauth',
                    reason: 'Popular auth solution for Next.js applications',
                    confidence: 0.8,
                    alternatives: ['better-auth', 'clerk']
                },
                {
                    category: 'auth',
                    plugin: 'clerk',
                    reason: 'Complete auth solution with pre-built components',
                    confidence: 0.7,
                    alternatives: ['better-auth', 'nextauth']
                }
            ],
            ui: [
                {
                    category: 'ui',
                    plugin: 'shadcn-ui',
                    reason: 'Beautiful, accessible components built on Radix UI',
                    confidence: 0.9,
                    alternatives: ['chakra-ui', 'mui']
                },
                {
                    category: 'ui',
                    plugin: 'chakra-ui',
                    reason: 'Simple, modular and accessible component library',
                    confidence: 0.8,
                    alternatives: ['shadcn-ui', 'mui']
                },
                {
                    category: 'ui',
                    plugin: 'mui',
                    reason: 'Comprehensive React UI framework',
                    confidence: 0.7,
                    alternatives: ['shadcn-ui', 'chakra-ui']
                }
            ],
            payment: [
                {
                    category: 'payment',
                    plugin: 'stripe',
                    reason: 'Most popular payment processor with excellent docs',
                    confidence: 0.9,
                    alternatives: ['paypal', 'square']
                },
                {
                    category: 'payment',
                    plugin: 'paypal',
                    reason: 'Widely recognized payment solution',
                    confidence: 0.7,
                    alternatives: ['stripe', 'square']
                }
            ],
            email: [
                {
                    category: 'email',
                    plugin: 'resend',
                    reason: 'Developer-friendly email API with great deliverability',
                    confidence: 0.9,
                    alternatives: ['sendgrid', 'mailgun']
                },
                {
                    category: 'email',
                    plugin: 'sendgrid',
                    reason: 'Enterprise-grade email delivery platform',
                    confidence: 0.8,
                    alternatives: ['resend', 'mailgun']
                }
            ],
            testing: [
                {
                    category: 'testing',
                    plugin: 'vitest',
                    reason: 'Fast unit testing framework with excellent Vite integration',
                    confidence: 0.9,
                    alternatives: ['jest', 'playwright']
                },
                {
                    category: 'testing',
                    plugin: 'jest',
                    reason: 'Popular testing framework with extensive ecosystem',
                    confidence: 0.8,
                    alternatives: ['vitest', 'playwright']
                }
            ],
            deployment: [
                {
                    category: 'deployment',
                    plugin: 'vercel',
                    reason: 'Best-in-class platform for Next.js and React apps',
                    confidence: 0.9,
                    alternatives: ['railway', 'netlify']
                },
                {
                    category: 'deployment',
                    plugin: 'railway',
                    reason: 'Simple deployment platform with great developer experience',
                    confidence: 0.8,
                    alternatives: ['vercel', 'netlify']
                }
            ]
        };
        return alternatives[category] || [];
    }
    // ============================================================================
    // PRIVATE RECOMMENDATION METHODS
    // ============================================================================
    getDatabaseRecommendation(context) {
        const { type, requirements } = context;
        if (type === 'ecommerce') {
            return {
                category: 'database',
                plugin: 'drizzle',
                provider: 'neon',
                reason: 'PostgreSQL is ideal for e-commerce transactions and data integrity',
                confidence: 0.95,
                alternatives: ['prisma', 'supabase']
            };
        }
        if (type === 'blog') {
            return {
                category: 'database',
                plugin: 'drizzle',
                provider: 'neon',
                reason: 'Fast and reliable for content management',
                confidence: 0.9,
                alternatives: ['prisma', 'supabase']
            };
        }
        if (type === 'dashboard') {
            return {
                category: 'database',
                plugin: 'prisma',
                provider: 'neon',
                reason: 'Excellent for complex queries and data relationships',
                confidence: 0.9,
                alternatives: ['drizzle', 'supabase']
            };
        }
        // Default recommendation
        return {
            category: 'database',
            plugin: 'drizzle',
            provider: 'neon',
            reason: 'Modern TypeScript-first ORM with excellent performance',
            confidence: 0.85,
            alternatives: ['prisma', 'supabase']
        };
    }
    getAuthRecommendation(context) {
        const { type, requirements } = context;
        if (type === 'ecommerce') {
            return {
                category: 'auth',
                plugin: 'better-auth',
                reason: 'Excellent for user accounts and order management',
                confidence: 0.95,
                alternatives: ['nextauth', 'clerk']
            };
        }
        if (type === 'dashboard') {
            return {
                category: 'auth',
                plugin: 'clerk',
                reason: 'Pre-built components perfect for admin interfaces',
                confidence: 0.9,
                alternatives: ['better-auth', 'nextauth']
            };
        }
        // Default recommendation
        return {
            category: 'auth',
            plugin: 'better-auth',
            reason: 'Modern auth library with excellent TypeScript support',
            confidence: 0.9,
            alternatives: ['nextauth', 'clerk']
        };
    }
    getUIRecommendation(context) {
        const { type, requirements } = context;
        if (type === 'ecommerce') {
            return {
                category: 'ui',
                plugin: 'shadcn-ui',
                reason: 'Professional components perfect for e-commerce',
                confidence: 0.95,
                alternatives: ['chakra-ui', 'mui']
            };
        }
        if (type === 'dashboard') {
            return {
                category: 'ui',
                plugin: 'mui',
                reason: 'Comprehensive component library for data-heavy interfaces',
                confidence: 0.9,
                alternatives: ['shadcn-ui', 'chakra-ui']
            };
        }
        // Default recommendation
        return {
            category: 'ui',
            plugin: 'shadcn-ui',
            reason: 'Beautiful, accessible components built on Radix UI',
            confidence: 0.9,
            alternatives: ['chakra-ui', 'mui']
        };
    }
    getPaymentRecommendation(context) {
        return {
            category: 'payment',
            plugin: 'stripe',
            reason: 'Most popular payment processor with excellent documentation',
            confidence: 0.95,
            alternatives: ['paypal', 'square']
        };
    }
    getEmailRecommendation(context) {
        return {
            category: 'email',
            plugin: 'resend',
            reason: 'Developer-friendly email API with great deliverability',
            confidence: 0.9,
            alternatives: ['sendgrid', 'mailgun']
        };
    }
    getTestingRecommendation(context) {
        return {
            category: 'testing',
            plugin: 'vitest',
            reason: 'Fast unit testing framework with excellent Vite integration',
            confidence: 0.9,
            alternatives: ['jest', 'playwright']
        };
    }
    getDeploymentRecommendation(context) {
        return {
            category: 'deployment',
            plugin: 'vercel',
            reason: 'Best-in-class platform for Next.js and React applications',
            confidence: 0.9,
            alternatives: ['railway', 'netlify']
        };
    }
}
//# sourceMappingURL=recommendation-engine.js.map