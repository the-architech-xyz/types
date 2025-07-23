import fs from 'fs';
import path from 'path';

console.log('🔍 Comprehensive Plugin Analysis - All 24 Plugins\n');

// All plugins found in the codebase
const allPlugins = [
  // Libraries - ORM (3)
  { name: 'drizzle', path: 'src/plugins/libraries/orm/drizzle/DrizzlePlugin.ts', category: 'Database/ORM' },
  { name: 'prisma', path: 'src/plugins/libraries/orm/prisma/PrismaPlugin.ts', category: 'Database/ORM' },
  { name: 'mongoose', path: 'src/plugins/libraries/orm/mongoose/MongoosePlugin.ts', category: 'Database/ORM' },
  
  // Libraries - Auth (2)
  { name: 'better-auth', path: 'src/plugins/libraries/auth/better-auth/BetterAuthPlugin.ts', category: 'Authentication' },
  { name: 'nextauth', path: 'src/plugins/libraries/auth/nextauth/NextAuthPlugin.ts', category: 'Authentication' },
  
  // Libraries - UI (4)
  { name: 'shadcn-ui', path: 'src/plugins/libraries/ui/shadcn-ui/ShadcnUIPlugin.ts', category: 'UI/Design System' },
  { name: 'mui', path: 'src/plugins/libraries/ui/mui/MuiPlugin.ts', category: 'UI/Design System' },
  { name: 'tamagui', path: 'src/plugins/libraries/ui/tamagui/TamaguiPlugin.ts', category: 'UI/Design System' },
  { name: 'chakra-ui', path: 'src/plugins/libraries/ui/chakra-ui/ChakraUIPlugin.ts', category: 'UI/Design System' },
  
  // Libraries - Framework (1)
  { name: 'nextjs', path: 'src/plugins/libraries/framework/nextjs/NextJSPlugin.ts', category: 'Framework' },
  
  // Libraries - Testing (1)
  { name: 'vitest', path: 'src/plugins/libraries/testing/vitest/VitestPlugin.ts', category: 'Testing' },
  
  // Infrastructure - Database (3)
  { name: 'mongodb', path: 'src/plugins/infrastructure/database/mongodb/MongoDBPlugin.ts', category: 'Infrastructure/Database' },
  { name: 'supabase', path: 'src/plugins/infrastructure/database/supabase/SupabasePlugin.ts', category: 'Infrastructure/Database' },
  { name: 'neon', path: 'src/plugins/infrastructure/database/neon/NeonPlugin.ts', category: 'Infrastructure/Database' },
  
  // Infrastructure - Hosting (2)
  { name: 'docker', path: 'src/plugins/infrastructure/hosting/docker/DockerPlugin.ts', category: 'Infrastructure/Hosting' },
  { name: 'railway', path: 'src/plugins/infrastructure/hosting/railway/RailwayPlugin.ts', category: 'Infrastructure/Hosting' },
  
  // Infrastructure - Monitoring (2)
  { name: 'google-analytics', path: 'src/plugins/infrastructure/monitoring/google-analytics/GoogleAnalyticsPlugin.ts', category: 'Infrastructure/Monitoring' },
  { name: 'sentry', path: 'src/plugins/infrastructure/monitoring/sentry/SentryPlugin.ts', category: 'Infrastructure/Monitoring' },
  
  // Services - Payment (2)
  { name: 'paypal', path: 'src/plugins/services/payment/paypal/PayPalPlugin.ts', category: 'Services/Payment' },
  { name: 'stripe', path: 'src/plugins/services/payment/stripe/StripePlugin.ts', category: 'Services/Payment' },
  
  // Services - Blockchain (1)
  { name: 'ethereum', path: 'src/plugins/services/blockchain/ethereum/EthereumPlugin.ts', category: 'Services/Blockchain' },
  
  // Services - Email (2)
  { name: 'sendgrid', path: 'src/plugins/services/email/sendgrid/SendGridPlugin.ts', category: 'Services/Email' },
  { name: 'resend', path: 'src/plugins/services/email/resend/ResendPlugin.ts', category: 'Services/Email' }
];

// Group plugins by category
const pluginsByCategory = {};
allPlugins.forEach(plugin => {
  if (!pluginsByCategory[plugin.category]) {
    pluginsByCategory[plugin.category] = [];
  }
  pluginsByCategory[plugin.category].push(plugin);
});

let total = 0;
let updated = 0;
let missing = 0;
let needsUpdate = 0;

console.log('📊 PLUGIN STATUS BY CATEGORY');
console.log('============================');

for (const [category, plugins] of Object.entries(pluginsByCategory)) {
  console.log(`\n${category}:`);
  
  for (const plugin of plugins) {
    if (fs.existsSync(plugin.path)) {
      total++;
      const content = fs.readFileSync(plugin.path, 'utf8');
      
      const usesBasePlugin = content.includes('extends BasePlugin');
      const implementsInterface = content.includes('implements IUI');
      const noQuestions = content.includes('getDynamicQuestions') && content.includes('return [];');
      const hasInstall = content.includes('async install(');
      const hasSchema = content.includes('getParameterSchema()');
      const hasInterface = content.includes('generateUnifiedInterface(');
      const hasValidation = content.includes('validateConfiguration(');
      
      const isUpdated = usesBasePlugin && implementsInterface && noQuestions && 
                       hasInstall && hasSchema && hasInterface && hasValidation;
      
      if (isUpdated) {
        updated++;
        console.log(`  ✅ ${plugin.name}: Fully updated`);
      } else {
        needsUpdate++;
        console.log(`  ⚠️  ${plugin.name}: Needs update`);
      }
    } else {
      missing++;
      console.log(`  ❌ ${plugin.name}: Missing`);
    }
  }
}

console.log(`\n📊 COMPREHENSIVE SUMMARY`);
console.log(`========================`);
console.log(`Total plugins: ${total}`);
console.log(`Fully updated: ${updated}`);
console.log(`Needs update: ${needsUpdate}`);
console.log(`Missing: ${missing}`);
console.log(`Completion rate: ${((updated/total)*100).toFixed(1)}%`);

console.log(`\n📋 PLUGIN INVENTORY BY CATEGORY:`);
console.log(`Libraries:`);
console.log(`  - Database/ORM: 3 plugins (drizzle, prisma, mongoose)`);
console.log(`  - Authentication: 2 plugins (better-auth, nextauth)`);
console.log(`  - UI/Design System: 4 plugins (shadcn-ui, mui, tamagui, chakra-ui)`);
console.log(`  - Framework: 1 plugin (nextjs)`);
console.log(`  - Testing: 1 plugin (vitest)`);
console.log(`Infrastructure:`);
console.log(`  - Database: 3 plugins (mongodb, supabase, neon)`);
console.log(`  - Hosting: 2 plugins (docker, railway)`);
console.log(`  - Monitoring: 2 plugins (google-analytics, sentry)`);
console.log(`Services:`);
console.log(`  - Payment: 2 plugins (paypal, stripe)`);
console.log(`  - Blockchain: 1 plugin (ethereum)`);
console.log(`  - Email: 2 plugins (sendgrid, resend)`);

console.log(`\n🎯 TOTAL: 24 plugins across 10 categories`); 