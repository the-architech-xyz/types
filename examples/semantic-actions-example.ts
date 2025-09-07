/**
 * Semantic Actions Example Blueprint
 * 
 * Demonstrates the new high-level semantic actions approach
 * This is how contributors should write blueprints going forward
 */

import { Blueprint } from '../src/types/adapter.js';

export const semanticActionsExample: Blueprint = {
  id: 'semantic-actions-example',
  name: 'Semantic Actions Example',
  description: 'Example blueprint using high-level semantic actions',
  version: '1.0.0',
  actions: [
    // 1. INSTALL_PACKAGES - Install dependencies
    {
      type: 'INSTALL_PACKAGES',
      packages: ['stripe', '@stripe/stripe-js'],
      isDev: false
    },
    {
      type: 'INSTALL_PACKAGES',
      packages: ['vitest', '@testing-library/react'],
      isDev: true
    },

    // 2. ADD_SCRIPT - Add npm scripts
    {
      type: 'ADD_SCRIPT',
      name: 'stripe:listen',
      command: 'stripe listen --forward-to localhost:3000/api/stripe/webhook'
    },
    {
      type: 'ADD_SCRIPT',
      name: 'test',
      command: 'vitest'
    },

    // 3. ADD_ENV_VAR - Add environment variables
    {
      type: 'ADD_ENV_VAR',
      key: 'STRIPE_SECRET_KEY',
      value: 'sk_test_...',
      description: 'Stripe secret key for payment processing'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'STRIPE_PUBLISHABLE_KEY',
      value: 'pk_test_...',
      description: 'Stripe publishable key for client-side'
    },

    // 4. CREATE_FILE - Create new files
    {
      type: 'CREATE_FILE',
      path: 'src/lib/stripe.ts',
      content: `import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const stripeClient = new Stripe(process.env.STRIPE_PUBLISHABLE_KEY!);
`
    },
    {
      type: 'CREATE_FILE',
      path: 'src/lib/payments.ts',
      content: `import { stripe } from './stripe';

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  return await stripe.paymentIntents.create({
    amount,
    currency,
  });
}
`
    },

    // 5. UPDATE_TS_CONFIG - Update TypeScript configuration
    {
      type: 'UPDATE_TS_CONFIG',
      path: 'src/lib/config.ts',
      modifications: {
        stripe: {
          enabled: true,
          webhookSecret: 'process.env.STRIPE_WEBHOOK_SECRET'
        }
      }
    },

    // 6. APPEND_TO_FILE - Append to existing files
    {
      type: 'APPEND_TO_FILE',
      path: '.gitignore',
      content: `
# Stripe
.env.stripe
stripe.log
`
    },

    // 7. PREPEND_TO_FILE - Prepend to existing files
    {
      type: 'PREPEND_TO_FILE',
      path: 'src/lib/index.ts',
      content: `// Payment utilities
export * from './stripe';
export * from './payments';
`
    },

    // 8. RUN_COMMAND - Execute commands
    {
      type: 'RUN_COMMAND',
      command: 'npm run build',
      workingDir: '.'
    }
  ]
};

// Comparison: Before vs After

// BEFORE (Complex, Error-Prone):
const oldWay: Blueprint = {
  id: 'old-complex-way',
  name: 'Old Complex Way',
  actions: [
    {
      type: 'ADD_CONTENT',
      target: 'package.json',
      strategy: 'merge',
      fileType: 'json',
      content: `{
        "dependencies": {
          "stripe": "^1.0.0",
          "@stripe/stripe-js": "^2.0.0"
        },
        "scripts": {
          "stripe:listen": "stripe listen --forward-to localhost:3000/api/stripe/webhook"
        }
      }`
    },
    {
      type: 'ADD_CONTENT',
      target: '.env.example',
      strategy: 'append',
      fileType: 'env',
      content: `STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...`
    },
    {
      type: 'RUN_COMMAND',
      command: 'npm install stripe @stripe/stripe-js'
    }
  ]
};

// AFTER (Simple, Clear, Safe):
const newWay: Blueprint = {
  id: 'new-semantic-way',
  name: 'New Semantic Way',
  actions: [
    {
      type: 'INSTALL_PACKAGES',
      packages: ['stripe', '@stripe/stripe-js']
    },
    {
      type: 'ADD_SCRIPT',
      name: 'stripe:listen',
      command: 'stripe listen --forward-to localhost:3000/api/stripe/webhook'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'STRIPE_SECRET_KEY',
      value: 'sk_test_...',
      description: 'Stripe secret key'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'STRIPE_PUBLISHABLE_KEY',
      value: 'pk_test_...',
      description: 'Stripe publishable key'
    }
  ]
};

export { oldWay, newWay };
