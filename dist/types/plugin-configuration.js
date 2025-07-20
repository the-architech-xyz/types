/**
 * Plugin Configuration Schema System
 *
 * Defines the structure for plugin configuration schemas, parameter collection,
 * and validation. This enables any developer to create plugins with their own
 * configuration requirements.
 */
import { PluginCategory } from './plugin.js';
// ============================================================================
// BUILT-IN CONFIGURATION SCHEMAS
// ============================================================================
export const DATABASE_PLUGIN_SCHEMAS = {
    drizzle: {
        pluginId: 'drizzle',
        pluginName: 'Drizzle ORM',
        pluginCategory: PluginCategory.ORM,
        schema: {
            type: 'object',
            properties: {
                provider: {
                    type: 'string',
                    title: 'Database Provider',
                    description: 'Choose your database provider',
                    enum: ['neon', 'supabase', 'vercel', 'local'],
                    default: 'neon'
                },
                features: {
                    type: 'object',
                    title: 'Database Features',
                    description: 'Select which database features to enable',
                    properties: {
                        migrations: {
                            type: 'boolean',
                            description: 'Enable database migrations',
                            default: true
                        },
                        seeding: {
                            type: 'boolean',
                            description: 'Enable database seeding',
                            default: true
                        },
                        backup: {
                            type: 'boolean',
                            description: 'Enable database backup',
                            default: false
                        }
                    }
                },
                schema: {
                    type: 'object',
                    title: 'Schema Configuration',
                    description: 'Configure your database schema',
                    properties: {
                        tables: {
                            type: 'array',
                            description: 'Default tables to create',
                            items: {
                                type: 'string'
                            },
                            default: ['users', 'posts', 'comments']
                        },
                        relationships: {
                            type: 'boolean',
                            description: 'Enable foreign key relationships',
                            default: true
                        }
                    }
                }
            },
            required: ['provider']
        },
        defaults: {
            provider: 'neon',
            features: {
                migrations: true,
                seeding: true,
                backup: false
            },
            schema: {
                tables: ['users', 'posts', 'comments'],
                relationships: true
            }
        },
        validation: {
            customValidators: [
                {
                    name: 'providerValidation',
                    description: 'Validate database provider configuration',
                    validate: (value, config) => {
                        const errors = [];
                        if (config.provider === 'neon' && !config.connection?.url) {
                            errors.push({
                                field: 'connection.url',
                                message: 'Neon database requires a connection URL',
                                code: 'MISSING_CONNECTION_URL',
                                severity: 'error'
                            });
                        }
                        return {
                            valid: errors.length === 0,
                            errors,
                            warnings: []
                        };
                    }
                }
            ]
        },
        documentation: {
            name: 'Drizzle ORM',
            description: 'Type-safe SQL toolkit with TypeScript',
            version: '0.44.3',
            author: 'The Architech Team',
            overview: 'Drizzle ORM is a TypeScript ORM with excellent type safety and performance.',
            features: [
                'Type-safe SQL queries',
                'Automatic migrations',
                'Schema validation',
                'Excellent TypeScript support'
            ],
            benefits: [
                'Prevents SQL injection',
                'Catch errors at compile time',
                'Great developer experience',
                'High performance'
            ],
            useCases: [
                'Web applications',
                'API development',
                'Full-stack applications',
                'Microservices'
            ],
            configurationGuide: 'Configure your database connection and schema preferences.',
            parameterDescriptions: {
                provider: {
                    name: 'Database Provider',
                    description: 'Choose your database hosting provider',
                    type: 'string',
                    required: true,
                    examples: ['neon', 'supabase', 'vercel'],
                    notes: 'Neon is recommended for serverless applications'
                }
            },
            examples: [
                {
                    name: 'Basic Setup',
                    description: 'Minimal configuration for a new project',
                    configuration: {
                        provider: 'neon',
                        features: { migrations: true, seeding: true }
                    },
                    useCase: 'Quick prototype or MVP'
                }
            ],
            integrationGuide: 'Drizzle integrates seamlessly with Next.js and other frameworks.',
            compatibilityNotes: [
                'Works best with PostgreSQL',
                'Requires TypeScript',
                'Compatible with all major frameworks'
            ],
            troubleshooting: [
                {
                    problem: 'Connection timeout',
                    solution: 'Check your database URL and network connection',
                    code: 'DATABASE_URL=postgresql://...'
                }
            ]
        },
        requirements: {
            system: {
                nodeVersion: '>=16.0.0',
                npmVersion: '>=8.0.0'
            },
            dependencies: [
                {
                    name: 'drizzle-orm',
                    version: '^0.44.3',
                    description: 'Core Drizzle ORM package',
                    required: true,
                    category: 'production'
                },
                {
                    name: 'drizzle-kit',
                    version: '^0.31.4',
                    description: 'Drizzle CLI and migration tools',
                    required: true,
                    category: 'development'
                }
            ],
            peerDependencies: [],
            devDependencies: [],
            runtime: {
                environment: ['node'],
                features: ['typescript'],
                permissions: []
            },
            platforms: [
                { platform: 'web', supported: true },
                { platform: 'server', supported: true }
            ],
            versionConstraints: []
        }
    }
};
export const AUTH_PLUGIN_SCHEMAS = {
    'better-auth': {
        pluginId: 'better-auth',
        pluginName: 'Better Auth',
        pluginCategory: PluginCategory.AUTHENTICATION,
        schema: {
            type: 'object',
            properties: {
                providers: {
                    type: 'array',
                    title: 'Authentication Providers',
                    description: 'Select which authentication providers to enable',
                    items: {
                        type: 'string',
                        enum: ['email', 'github', 'google', 'discord', 'twitter']
                    },
                    default: ['email']
                },
                features: {
                    type: 'object',
                    title: 'Authentication Features',
                    description: 'Configure authentication features',
                    properties: {
                        emailVerification: {
                            type: 'boolean',
                            description: 'Require email verification',
                            default: true
                        },
                        passwordReset: {
                            type: 'boolean',
                            description: 'Enable password reset',
                            default: true
                        },
                        socialLogin: {
                            type: 'boolean',
                            description: 'Enable social login',
                            default: true
                        },
                        sessionManagement: {
                            type: 'boolean',
                            description: 'Enable session management',
                            default: true
                        }
                    }
                },
                database: {
                    type: 'object',
                    title: 'Database Configuration',
                    description: 'Configure database adapter',
                    properties: {
                        adapter: {
                            type: 'string',
                            description: 'Database adapter to use',
                            enum: ['drizzle', 'prisma', 'mongodb'],
                            default: 'drizzle'
                        }
                    }
                },
                session: {
                    type: 'object',
                    title: 'Session Configuration',
                    description: 'Configure session settings',
                    properties: {
                        strategy: {
                            type: 'string',
                            description: 'Session strategy',
                            enum: ['jwt', 'database'],
                            default: 'jwt'
                        },
                        maxAge: {
                            type: 'number',
                            description: 'Session max age in seconds',
                            default: 30 * 24 * 60 * 60 // 30 days
                        }
                    }
                }
            },
            required: ['providers']
        },
        defaults: {
            providers: ['email'],
            features: {
                emailVerification: true,
                passwordReset: true,
                socialLogin: true,
                sessionManagement: true
            },
            database: {
                adapter: 'drizzle'
            },
            session: {
                strategy: 'jwt',
                maxAge: 30 * 24 * 60 * 60
            }
        },
        validation: {
            customValidators: [
                {
                    name: 'providerValidation',
                    description: 'Validate authentication providers',
                    validate: (value, config) => {
                        const errors = [];
                        if (config.providers.includes('email') && !config.features?.emailVerification) {
                            errors.push({
                                field: 'features.emailVerification',
                                message: 'Email verification is recommended when using email provider',
                                code: 'EMAIL_VERIFICATION_RECOMMENDED',
                                severity: 'warning'
                            });
                        }
                        return {
                            valid: errors.length === 0,
                            errors,
                            warnings: []
                        };
                    }
                }
            ]
        },
        documentation: {
            name: 'Better Auth',
            description: 'Modern, type-safe authentication for Next.js',
            version: '1.3.0',
            author: 'The Architech Team',
            overview: 'Better Auth provides a modern, type-safe authentication solution for Next.js applications.',
            features: [
                'Type-safe authentication',
                'Multiple provider support',
                'Session management',
                'Email verification'
            ],
            benefits: [
                'Excellent TypeScript support',
                'Built-in security features',
                'Easy to customize',
                'Great developer experience'
            ],
            useCases: [
                'User authentication',
                'Social login',
                'Email verification',
                'Password reset'
            ],
            configurationGuide: 'Configure your authentication providers and features.',
            parameterDescriptions: {
                providers: {
                    name: 'Authentication Providers',
                    description: 'Choose which authentication methods to enable',
                    type: 'array',
                    required: true,
                    examples: [['email'], ['email', 'github'], ['google', 'discord']],
                    notes: 'Email provider is always recommended for basic authentication'
                }
            },
            examples: [
                {
                    name: 'Email Only',
                    description: 'Basic email/password authentication',
                    configuration: {
                        providers: ['email'],
                        features: { emailVerification: true, passwordReset: true }
                    },
                    useCase: 'Simple user registration and login'
                }
            ],
            integrationGuide: 'Better Auth integrates seamlessly with Next.js and Drizzle ORM.',
            compatibilityNotes: [
                'Requires a database',
                'Works best with Drizzle ORM',
                'Compatible with Next.js 13+'
            ],
            troubleshooting: [
                {
                    problem: 'Database connection error',
                    solution: 'Ensure your database is properly configured and accessible',
                    code: 'DATABASE_URL=postgresql://...'
                }
            ]
        },
        requirements: {
            system: {
                nodeVersion: '>=16.0.0',
                npmVersion: '>=8.0.0'
            },
            dependencies: [
                {
                    name: 'better-auth',
                    version: '^1.3.0',
                    description: 'Core Better Auth package',
                    required: true,
                    category: 'production'
                }
            ],
            peerDependencies: [],
            devDependencies: [],
            runtime: {
                environment: ['node'],
                features: ['typescript', 'database'],
                permissions: []
            },
            platforms: [
                { platform: 'web', supported: true },
                { platform: 'server', supported: true }
            ],
            versionConstraints: []
        }
    }
};
export const UI_PLUGIN_SCHEMAS = {
    shadcn: {
        pluginId: 'shadcn',
        pluginName: 'Shadcn/ui',
        pluginCategory: PluginCategory.DESIGN_SYSTEM,
        schema: {
            type: 'object',
            properties: {
                theme: {
                    type: 'string',
                    title: 'Theme Preference',
                    description: 'Choose your theme preference',
                    enum: ['light', 'dark', 'system'],
                    default: 'system'
                },
                components: {
                    type: 'array',
                    title: 'UI Components',
                    description: 'Select which components to include',
                    items: {
                        type: 'string',
                        enum: [
                            'button', 'input', 'card', 'dialog', 'dropdown-menu', 'form',
                            'table', 'data-table', 'calendar', 'date-picker', 'select',
                            'textarea', 'checkbox', 'radio-group', 'switch', 'slider'
                        ]
                    },
                    default: ['button', 'input', 'card', 'dialog', 'form']
                },
                features: {
                    type: 'object',
                    title: 'UI Features',
                    description: 'Configure UI features',
                    properties: {
                        animations: {
                            type: 'boolean',
                            description: 'Enable animations',
                            default: true
                        },
                        icons: {
                            type: 'boolean',
                            description: 'Include icon library',
                            default: true
                        },
                        responsive: {
                            type: 'boolean',
                            description: 'Enable responsive design',
                            default: true
                        }
                    }
                },
                styling: {
                    type: 'object',
                    title: 'Styling Configuration',
                    description: 'Configure styling options',
                    properties: {
                        framework: {
                            type: 'string',
                            description: 'CSS framework to use',
                            enum: ['tailwind'],
                            default: 'tailwind'
                        },
                        cssVariables: {
                            type: 'boolean',
                            description: 'Use CSS variables for theming',
                            default: true
                        },
                        darkMode: {
                            type: 'boolean',
                            description: 'Enable dark mode support',
                            default: true
                        }
                    }
                }
            },
            required: ['theme', 'components']
        },
        defaults: {
            theme: 'system',
            components: ['button', 'input', 'card', 'dialog', 'form'],
            features: {
                animations: true,
                icons: true,
                responsive: true
            },
            styling: {
                framework: 'tailwind',
                cssVariables: true,
                darkMode: true
            }
        },
        validation: {
            customValidators: [
                {
                    name: 'componentValidation',
                    description: 'Validate component selection',
                    validate: (value, config) => {
                        const errors = [];
                        if (config.components.length === 0) {
                            errors.push({
                                field: 'components',
                                message: 'At least one component must be selected',
                                code: 'NO_COMPONENTS_SELECTED',
                                severity: 'error'
                            });
                        }
                        return {
                            valid: errors.length === 0,
                            errors,
                            warnings: []
                        };
                    }
                }
            ]
        },
        documentation: {
            name: 'Shadcn/ui',
            description: 'Beautiful, accessible components built with Radix UI and Tailwind CSS',
            version: '0.294.0',
            author: 'The Architech Team',
            overview: 'Shadcn/ui provides a collection of reusable components that you can copy and paste into your apps.',
            features: [
                'Beautiful, accessible components',
                'Built on Radix UI primitives',
                'Customizable with Tailwind CSS',
                'TypeScript support'
            ],
            benefits: [
                'Excellent accessibility',
                'Highly customizable',
                'Great developer experience',
                'No vendor lock-in'
            ],
            useCases: [
                'Web applications',
                'Design systems',
                'Component libraries',
                'Rapid prototyping'
            ],
            configurationGuide: 'Choose your theme and select the components you need.',
            parameterDescriptions: {
                theme: {
                    name: 'Theme Preference',
                    description: 'Choose how your app handles theming',
                    type: 'string',
                    required: true,
                    examples: ['light', 'dark', 'system'],
                    notes: 'System theme follows the user\'s OS preference'
                }
            },
            examples: [
                {
                    name: 'Basic Components',
                    description: 'Essential components for most applications',
                    configuration: {
                        theme: 'system',
                        components: ['button', 'input', 'card', 'dialog', 'form']
                    },
                    useCase: 'Standard web application'
                }
            ],
            integrationGuide: 'Shadcn/ui integrates seamlessly with Next.js and Tailwind CSS.',
            compatibilityNotes: [
                'Requires Tailwind CSS',
                'Built on Radix UI',
                'Compatible with all React frameworks'
            ],
            troubleshooting: [
                {
                    problem: 'Components not styling correctly',
                    solution: 'Ensure Tailwind CSS is properly configured',
                    code: 'npx tailwindcss init'
                }
            ]
        },
        requirements: {
            system: {
                nodeVersion: '>=16.0.0',
                npmVersion: '>=8.0.0'
            },
            dependencies: [
                {
                    name: '@radix-ui/react-dialog',
                    version: '^1.0.5',
                    description: 'Dialog component',
                    required: false,
                    category: 'production'
                },
                {
                    name: '@radix-ui/react-label',
                    version: '^2.0.2',
                    description: 'Label component',
                    required: false,
                    category: 'production'
                },
                {
                    name: 'class-variance-authority',
                    version: '^0.7.0',
                    description: 'Component variant utilities',
                    required: true,
                    category: 'production'
                },
                {
                    name: 'clsx',
                    version: '^2.0.0',
                    description: 'Conditional className utility',
                    required: true,
                    category: 'production'
                },
                {
                    name: 'tailwind-merge',
                    version: '^2.0.0',
                    description: 'Tailwind CSS class merging',
                    required: true,
                    category: 'production'
                }
            ],
            peerDependencies: [
                {
                    name: 'react',
                    version: '^18.0.0',
                    description: 'React framework',
                    required: true,
                    category: 'peer'
                },
                {
                    name: 'tailwindcss',
                    version: '^3.0.0',
                    description: 'Tailwind CSS framework',
                    required: true,
                    category: 'peer'
                }
            ],
            devDependencies: [],
            runtime: {
                environment: ['browser'],
                features: ['react', 'tailwind'],
                permissions: []
            },
            platforms: [
                { platform: 'web', supported: true }
            ],
            versionConstraints: []
        }
    }
};
//# sourceMappingURL=plugin-configuration.js.map