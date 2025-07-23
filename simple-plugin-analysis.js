import fs from 'fs';
import path from 'path';

console.log('🔍 Simple Plugin Analysis - Actual Plugins\n');

// Check actual plugins
const plugins = [
  { name: 'drizzle', path: 'src/plugins/libraries/orm/drizzle/DrizzlePlugin.ts' },
  { name: 'prisma', path: 'src/plugins/libraries/orm/prisma/PrismaPlugin.ts' },
  { name: 'mongoose', path: 'src/plugins/libraries/orm/mongoose/MongoosePlugin.ts' },
  { name: 'better-auth', path: 'src/plugins/libraries/auth/better-auth/BetterAuthPlugin.ts' },
  { name: 'nextauth', path: 'src/plugins/libraries/auth/nextauth/NextAuthPlugin.ts' },
  { name: 'shadcn-ui', path: 'src/plugins/libraries/ui/shadcn-ui/ShadcnUIPlugin.ts' },
  { name: 'mui', path: 'src/plugins/libraries/ui/mui/MuiPlugin.ts' },
  { name: 'tamagui', path: 'src/plugins/libraries/ui/tamagui/TamaguiPlugin.ts' },
  { name: 'chakra-ui', path: 'src/plugins/libraries/ui/chakra-ui/ChakraUIPlugin.ts' },
  { name: 'nextjs', path: 'src/plugins/libraries/framework/nextjs/NextJSPlugin.ts' },
  { name: 'vitest', path: 'src/plugins/libraries/testing/vitest/VitestPlugin.ts' }
];

let total = 0;
let updated = 0;

console.log('Plugin Status:');
console.log('==============');

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
      console.log(`✅ ${plugin.name}: Fully updated`);
    } else {
      console.log(`⚠️  ${plugin.name}: Needs update`);
    }
  } else {
    console.log(`❌ ${plugin.name}: Missing`);
  }
}

console.log(`\nSummary:`);
console.log(`Total plugins: ${total}`);
console.log(`Fully updated: ${updated}`);
console.log(`Completion rate: ${((updated/total)*100).toFixed(1)}%`); 