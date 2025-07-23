/**
 * Corrected Plugin Architecture Analysis
 * 
 * This script analyzes the ACTUAL state of all plugin files based on what exists in the folders.
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Corrected Plugin Architecture Analysis\n');

// ============================================================================
// 1. ACTUAL PLUGIN INVENTORY
// ============================================================================

console.log('📁 1. ACTUAL PLUGIN INVENTORY');
console.log('================================');

const actualPlugins = [
  // Database/ORM Plugins
  { name: 'Drizzle', path: 'src/plugins/libraries/orm/drizzle/DrizzlePlugin.ts', category: 'Database/ORM' },
  { name: 'Prisma', path: 'src/plugins/libraries/orm/prisma/PrismaPlugin.ts', category: 'Database/ORM' },
  { name: 'Mongoose', path: 'src/plugins/libraries/orm/mongoose/MongoosePlugin.ts', category: 'Database/ORM' },
  
  // Authentication Plugins
  { name: 'Better Auth', path: 'src/plugins/libraries/auth/better-auth/BetterAuthPlugin.ts', category: 'Authentication' },
  { name: 'NextAuth', path: 'src/plugins/libraries/auth/nextauth/NextAuthPlugin.ts', category: 'Authentication' },
  
  // UI/Design System Plugins
  { name: 'Shadcn UI', path: 'src/plugins/libraries/ui/shadcn-ui/ShadcnUIPlugin.ts', category: 'UI/Design System' },
  { name: 'MUI', path: 'src/plugins/libraries/ui/mui/MuiPlugin.ts', category: 'UI/Design System' },
  { name: 'Tamagui', path: 'src/plugins/libraries/ui/tamagui/TamaguiPlugin.ts', category: 'UI/Design System' },
  { name: 'Chakra UI', path: 'src/plugins/libraries/ui/chakra-ui/ChakraUIPlugin.ts', category: 'UI/Design System' },
  
  // Framework Plugins
  { name: 'Next.js', path: 'src/plugins/libraries/framework/nextjs/NextJSPlugin.ts', category: 'Framework' },
  
  // Testing Plugins
  { name: 'Vitest', path: 'src/plugins/libraries/testing/vitest/VitestPlugin.ts', category: 'Testing' }
];

console.log('📊 Total Plugins Found: ' + actualPlugins.length);
console.log('');

// Group by category
const pluginsByCategory = {};
actualPlugins.forEach(plugin => {
  if (!pluginsByCategory[plugin.category]) {
    pluginsByCategory[plugin.category] = [];
  }
  pluginsByCategory[plugin.category].push(plugin);
});

Object.entries(pluginsByCategory).forEach(([category, plugins]) => {
  console.log(`${category}: ${plugins.length} plugins`);
  plugins.forEach(plugin => {
    console.log(`  - ${plugin.name}`);
  });
  console.log('');
});

// ============================================================================
// 2. PLUGIN ENTRY POINTS ANALYSIS
// ============================================================================

console.log('📁 2. PLUGIN ENTRY POINTS ANALYSIS');
console.log('=====================================');

let totalPlugins = 0;
let updatedPlugins = 0;
let missingPlugins = [];

Object.entries(pluginsByCategory).forEach(([category, plugins]) => {
  console.log(`\n${category}:`);
  
  plugins.forEach(plugin => {
    totalPlugins++;
    
    if (fs.existsSync(plugin.path)) {
      const content = fs.readFileSync(plugin.path, 'utf8');
      
      const usesBasePlugin = content.includes('extends BasePlugin');
      const implementsInterface = content.includes('implements IUI');
      const noQuestionGeneration = content.includes('getDynamicQuestions') && content.includes('return [];');
      const hasInstallMethod = content.includes('async install(');
      const hasParameterSchema = content.includes('getParameterSchema()');
      const hasUnifiedInterface = content.includes('generateUnifiedInterface(');
      const hasValidation = content.includes('validateConfiguration(');
      
      const isUpdated = usesBasePlugin && implementsInterface && noQuestionGeneration && 
                       hasInstallMethod && hasParameterSchema && hasUnifiedInterface && hasValidation;
      
      if (isUpdated) {
        updatedPlugins++;
        console.log(`  ✅ ${plugin.name}: Fully updated to new architecture`);
      } else {
        console.log(`  ⚠️  ${plugin.name}: Partially updated or needs review`);
        console.log(`     BasePlugin: ${usesBasePlugin ? '✅' : '❌'}`);
        console.log(`     Interface: ${implementsInterface ? '✅' : '❌'}`);
        console.log(`     No Questions: ${noQuestionGeneration ? '✅' : '❌'}`);
        console.log(`     Install Method: ${hasInstallMethod ? '✅' : '❌'}`);
        console.log(`     Parameter Schema: ${hasParameterSchema ? '✅' : '❌'}`);
        console.log(`     Unified Interface: ${hasUnifiedInterface ? '✅' : '❌'}`);
        console.log(`     Validation: ${hasValidation ? '✅' : '❌'}`);
      }
    } else {
      missingPlugins.push(plugin.name);
      console.log(`  ❌ ${plugin.name}: Plugin file not found`);
    }
  });
});

console.log(`\n📊 Plugin Entry Points Summary:`);
console.log(`Total plugins found: ${totalPlugins}`);
console.log(`Fully updated: ${updatedPlugins}`);
console.log(`Missing plugins: ${missingPlugins.length}`);

// ============================================================================
// 3. SCHEMA FILES ANALYSIS
// ============================================================================

console.log('\n\n📋 3. SCHEMA FILES ANALYSIS');
console.log('=============================');

const schemaPatterns = {
  hasParameterSchema: 0,
  hasValidationRules: 0,
  hasDefaultValues: 0,
  hasTypeDefinitions: 0,
  hasDocumentation: 0
};

let totalSchemas = 0;
let missingSchemas = [];

actualPlugins.forEach(plugin => {
  const schemaPath = plugin.path.replace('Plugin.ts', 'Schema.ts');
  
  if (fs.existsSync(schemaPath)) {
    totalSchemas++;
    const content = fs.readFileSync(schemaPath, 'utf8');
    
    if (content.includes('getParameterSchema')) schemaPatterns.hasParameterSchema++;
    if (content.includes('validation') || content.includes('required')) schemaPatterns.hasValidationRules++;
    if (content.includes('default') || content.includes('Default')) schemaPatterns.hasDefaultValues++;
    if (content.includes('interface') || content.includes('type')) schemaPatterns.hasTypeDefinitions++;
    if (content.includes('@description') || content.includes('description:')) schemaPatterns.hasDocumentation++;
    
    console.log(`✅ ${plugin.name}: Schema file exists`);
  } else {
    missingSchemas.push(plugin.name);
    console.log(`❌ ${plugin.name}: Schema file missing`);
  }
});

console.log(`\n📊 Schema Files Summary:`);
console.log(`Total schemas found: ${totalSchemas}`);
console.log(`Schemas with parameter definitions: ${schemaPatterns.hasParameterSchema}`);
console.log(`Schemas with validation rules: ${schemaPatterns.hasValidationRules}`);
console.log(`Schemas with default values: ${schemaPatterns.hasDefaultValues}`);
console.log(`Schemas with type definitions: ${schemaPatterns.hasTypeDefinitions}`);
console.log(`Schemas with documentation: ${schemaPatterns.hasDocumentation}`);

// ============================================================================
// 4. GENERATOR FILES ANALYSIS
// ============================================================================

console.log('\n\n⚙️ 4. GENERATOR FILES ANALYSIS');
console.log('==============================');

const generatorPatterns = {
  hasFileGeneration: 0,
  hasTemplateRendering: 0,
  hasPathResolution: 0,
  hasConfigurationHandling: 0,
  hasErrorHandling: 0
};

let totalGenerators = 0;
let missingGenerators = [];

actualPlugins.forEach(plugin => {
  const generatorPath = plugin.path.replace('Plugin.ts', 'Generator.ts');
  
  if (fs.existsSync(generatorPath)) {
    totalGenerators++;
    const content = fs.readFileSync(generatorPath, 'utf8');
    
    if (content.includes('generateAllFiles') || content.includes('generateFile')) generatorPatterns.hasFileGeneration++;
    if (content.includes('template') || content.includes('render')) generatorPatterns.hasTemplateRendering++;
    if (content.includes('path') || content.includes('resolve')) generatorPatterns.hasPathResolution++;
    if (content.includes('config') || content.includes('Config')) generatorPatterns.hasConfigurationHandling++;
    if (content.includes('try') && content.includes('catch')) generatorPatterns.hasErrorHandling++;
    
    console.log(`✅ ${plugin.name}: Generator file exists`);
  } else {
    missingGenerators.push(plugin.name);
    console.log(`❌ ${plugin.name}: Generator file missing`);
  }
});

console.log(`\n📊 Generator Files Summary:`);
console.log(`Total generators found: ${totalGenerators}`);
console.log(`Generators with file generation: ${generatorPatterns.hasFileGeneration}`);
console.log(`Generators with template rendering: ${generatorPatterns.hasTemplateRendering}`);
console.log(`Generators with path resolution: ${generatorPatterns.hasPathResolution}`);
console.log(`Generators with config handling: ${generatorPatterns.hasConfigurationHandling}`);
console.log(`Generators with error handling: ${generatorPatterns.hasErrorHandling}`);

// ============================================================================
// 5. ARCHITECTURE PATTERNS ANALYSIS
// ============================================================================

console.log('\n\n🏗️ 5. ARCHITECTURE PATTERNS ANALYSIS');
console.log('=====================================');

const architecturePatterns = {
  singleBaseClass: 0,
  interfaceImplementation: 0,
  noQuestionGeneration: 0,
  consistentValidation: 0,
  unifiedInterface: 0,
  properErrorHandling: 0,
  dependencyManagement: 0,
  configurationSchema: 0
};

let analyzedPlugins = 0;

actualPlugins.forEach(plugin => {
  if (fs.existsSync(plugin.path)) {
    analyzedPlugins++;
    const content = fs.readFileSync(plugin.path, 'utf8');
    
    if (content.includes('extends BasePlugin')) architecturePatterns.singleBaseClass++;
    if (content.includes('implements IUI')) architecturePatterns.interfaceImplementation++;
    if (content.includes('getDynamicQuestions') && content.includes('return []')) architecturePatterns.noQuestionGeneration++;
    if (content.includes('validateConfiguration')) architecturePatterns.consistentValidation++;
    if (content.includes('generateUnifiedInterface')) architecturePatterns.unifiedInterface++;
    if (content.includes('createErrorResult') || content.includes('createSuccessResult')) architecturePatterns.properErrorHandling++;
    if (content.includes('getDependencies') && content.includes('getDevDependencies')) architecturePatterns.dependencyManagement++;
    if (content.includes('getConfigSchema')) architecturePatterns.configurationSchema++;
  }
});

console.log(`\n📊 Architecture Patterns Summary:`);
console.log(`Plugins analyzed: ${analyzedPlugins}`);
console.log(`Using single base class: ${architecturePatterns.singleBaseClass}/${analyzedPlugins}`);
console.log(`Implementing interfaces: ${architecturePatterns.interfaceImplementation}/${analyzedPlugins}`);
console.log(`No question generation: ${architecturePatterns.noQuestionGeneration}/${analyzedPlugins}`);
console.log(`Consistent validation: ${architecturePatterns.consistentValidation}/${analyzedPlugins}`);
console.log(`Unified interface: ${architecturePatterns.unifiedInterface}/${analyzedPlugins}`);
console.log(`Proper error handling: ${architecturePatterns.properErrorHandling}/${analyzedPlugins}`);
console.log(`Dependency management: ${architecturePatterns.dependencyManagement}/${analyzedPlugins}`);
console.log(`Configuration schema: ${architecturePatterns.configurationSchema}/${analyzedPlugins}`);

// ============================================================================
// 6. FILE STRUCTURE ANALYSIS
// ============================================================================

console.log('\n\n📂 6. FILE STRUCTURE ANALYSIS');
console.log('==============================');

const fileStructurePatterns = {
  hasIndexFile: 0,
  hasReadme: 0,
  hasTests: 0,
  hasTypes: 0,
  hasUtils: 0
};

actualPlugins.forEach(plugin => {
  const pluginDir = path.dirname(plugin.path);
  
  if (fs.existsSync(pluginDir)) {
    const files = fs.readdirSync(pluginDir);
    
    if (files.includes('index.ts')) fileStructurePatterns.hasIndexFile++;
    if (files.includes('README.md')) fileStructurePatterns.hasReadme++;
    if (files.some(f => f.includes('test') || f.includes('spec'))) fileStructurePatterns.hasTests++;
    if (files.some(f => f.includes('types') || f.includes('Types'))) fileStructurePatterns.hasTypes++;
    if (files.some(f => f.includes('utils') || f.includes('Utils'))) fileStructurePatterns.hasUtils++;
  }
});

console.log(`\n📊 File Structure Summary:`);
console.log(`Plugins with index files: ${fileStructurePatterns.hasIndexFile}/${totalPlugins}`);
console.log(`Plugins with README: ${fileStructurePatterns.hasReadme}/${totalPlugins}`);
console.log(`Plugins with tests: ${fileStructurePatterns.hasTests}/${totalPlugins}`);
console.log(`Plugins with types: ${fileStructurePatterns.hasTypes}/${totalPlugins}`);
console.log(`Plugins with utils: ${fileStructurePatterns.hasUtils}/${totalPlugins}`);

// ============================================================================
// 7. OVERALL ASSESSMENT
// ============================================================================

console.log('\n\n🎯 7. OVERALL ASSESSMENT');
console.log('=========================');

const completionRate = (updatedPlugins / totalPlugins) * 100;
const schemaRate = (totalSchemas / totalPlugins) * 100;
const generatorRate = (totalGenerators / totalPlugins) * 100;

console.log(`\n📊 Completion Rates:`);
console.log(`Plugin entry points: ${completionRate.toFixed(1)}% (${updatedPlugins}/${totalPlugins})`);
console.log(`Schema files: ${schemaRate.toFixed(1)}% (${totalSchemas}/${totalPlugins})`);
console.log(`Generator files: ${generatorRate.toFixed(1)}% (${totalGenerators}/${totalPlugins})`);

console.log(`\n🏆 Architecture Quality Score:`);
const qualityScore = (
  (architecturePatterns.singleBaseClass / analyzedPlugins) * 25 +
  (architecturePatterns.interfaceImplementation / analyzedPlugins) * 20 +
  (architecturePatterns.noQuestionGeneration / analyzedPlugins) * 20 +
  (architecturePatterns.consistentValidation / analyzedPlugins) * 15 +
  (architecturePatterns.unifiedInterface / analyzedPlugins) * 20
);
console.log(`Overall quality: ${qualityScore.toFixed(1)}/100`);

console.log(`\n📋 Recommendations:`);
if (missingPlugins.length > 0) {
  console.log(`- Complete missing plugins: ${missingPlugins.join(', ')}`);
}
if (missingSchemas.length > 0) {
  console.log(`- Create missing schemas: ${missingSchemas.join(', ')}`);
}
if (missingGenerators.length > 0) {
  console.log(`- Create missing generators: ${missingGenerators.join(', ')}`);
}
if (qualityScore < 90) {
  console.log(`- Improve architecture consistency (current: ${qualityScore.toFixed(1)}%)`);
}

console.log(`\n🚀 The Architech CLI plugin architecture is ${qualityScore >= 90 ? 'EXCELLENT' : qualityScore >= 75 ? 'GOOD' : 'NEEDS IMPROVEMENT'}!`);

// ============================================================================
// 8. DETAILED PLUGIN STATUS
// ============================================================================

console.log('\n\n📋 8. DETAILED PLUGIN STATUS');
console.log('=============================');

actualPlugins.forEach(plugin => {
  console.log(`\n${plugin.name} (${plugin.category}):`);
  
  // Check plugin file
  if (fs.existsSync(plugin.path)) {
    const content = fs.readFileSync(plugin.path, 'utf8');
    const usesBasePlugin = content.includes('extends BasePlugin');
    const implementsInterface = content.includes('implements IUI');
    const noQuestionGeneration = content.includes('getDynamicQuestions') && content.includes('return [];');
    
    console.log(`  Plugin: ${usesBasePlugin && implementsInterface && noQuestionGeneration ? '✅ Updated' : '⚠️ Needs update'}`);
  } else {
    console.log(`  Plugin: ❌ Missing`);
  }
  
  // Check schema file
  const schemaPath = plugin.path.replace('Plugin.ts', 'Schema.ts');
  if (fs.existsSync(schemaPath)) {
    console.log(`  Schema: ✅ Exists`);
  } else {
    console.log(`  Schema: ❌ Missing`);
  }
  
  // Check generator file
  const generatorPath = plugin.path.replace('Plugin.ts', 'Generator.ts');
  if (fs.existsSync(generatorPath)) {
    console.log(`  Generator: ✅ Exists`);
  } else {
    console.log(`  Generator: ❌ Missing`);
  }
  
  // Check index file
  const indexPath = path.join(path.dirname(plugin.path), 'index.ts');
  if (fs.existsSync(indexPath)) {
    console.log(`  Index: ✅ Exists`);
  } else {
    console.log(`  Index: ❌ Missing`);
  }
}); 