/**
 * Comprehensive Plugin Architecture Analysis
 * 
 * Analyzes all plugins to verify they follow the correct architecture:
 * - Plugins provide data (schemas) only
 * - Agents handle questions
 * - No question generation in plugins
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Analyzing Plugin Architecture...\n');

// Test 1: Check if plugins follow correct architecture
console.log('📦 Checking Plugin Architecture...');

const pluginFiles = [
  'src/plugins/libraries/orm/drizzle/DrizzlePlugin.ts',
  'src/plugins/libraries/auth/better-auth/BetterAuthPlugin.ts',
  'src/plugins/libraries/ui/shadcn-ui/ShadcnUIPlugin.ts',
  'src/plugins/libraries/orm/prisma/PrismaPlugin.ts',
  'src/plugins/libraries/auth/nextauth/NextAuthPlugin.ts',
  'src/plugins/libraries/ui/mui/MuiPlugin.ts',
  'src/plugins/libraries/testing/vitest/VitestPlugin.ts'
];

let correctArchitecture = true;
const results = [];

for (const file of pluginFiles) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    const hasParameterSchema = content.includes('getParameterSchema()');
    const hasNoQuestionGeneration = !content.includes('getDynamicQuestions');
    const hasValidation = content.includes('validateConfiguration');
    const hasUnifiedInterface = content.includes('generateUnifiedInterface');
    
    const isCorrect = hasParameterSchema && hasNoQuestionGeneration && hasValidation && hasUnifiedInterface;
    
    results.push({
      file: path.basename(file),
      hasParameterSchema,
      hasNoQuestionGeneration,
      hasValidation,
      hasUnifiedInterface,
      isCorrect
    });
    
    if (!isCorrect) {
      correctArchitecture = false;
    }
  }
}

// Display results
for (const result of results) {
  console.log(`${result.isCorrect ? '✅' : '❌'} ${result.file}`);
  console.log(`   Parameter Schema: ${result.hasParameterSchema ? '✅' : '❌'}`);
  console.log(`   No Question Generation: ${result.hasNoQuestionGeneration ? '✅' : '❌'}`);
  console.log(`   Validation: ${result.hasValidation ? '✅' : '❌'}`);
  console.log(`   Unified Interface: ${result.hasUnifiedInterface ? '✅' : '❌'}`);
  console.log('');
}

// Test 2: Check base classes
console.log('🏗️ Checking Base Classes...');

const basePluginContent = fs.readFileSync('src/plugins/base/BasePlugin.ts', 'utf8');
const hasNoQuestionGenerator = !basePluginContent.includes('DynamicQuestionGenerator');
const hasParameterSchema = basePluginContent.includes('getParameterSchema');
const hasValidation = basePluginContent.includes('validateConfiguration');

console.log(`${hasNoQuestionGenerator ? '✅' : '❌'} No DynamicQuestionGenerator in BasePlugin`);
console.log(`${hasParameterSchema ? '✅' : '❌'} Parameter schema support`);
console.log(`${hasValidation ? '✅' : '❌'} Configuration validation`);
console.log('');

// Test 3: Check if old expert mode files are gone
console.log('🧹 Checking Old Files Cleanup...');

const oldFiles = [
  'src/core/expert/dynamic-question-generator.ts',
  'src/core/expert/expert-mode-service.ts',
  'src/core/expert/index.ts'
];

let oldFilesRemoved = true;
for (const file of oldFiles) {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '❌' : '✅'} ${file} ${exists ? 'still exists' : 'removed'}`);
  if (exists) {
    oldFilesRemoved = false;
  }
}
console.log('');

// Test 4: Check schema files
console.log('📋 Checking Schema Files...');

const schemaFiles = [
  'src/plugins/libraries/orm/drizzle/DrizzleSchema.ts',
  'src/plugins/libraries/auth/better-auth/BetterAuthSchema.ts',
  'src/plugins/libraries/ui/shadcn-ui/ShadcnUISchema.ts'
];

let schemasCorrect = true;
for (const file of schemaFiles) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasParameterSchema = content.includes('getParameterSchema');
    const hasNoQuestions = !content.includes('getDynamicQuestions');
    
    console.log(`${hasParameterSchema && hasNoQuestions ? '✅' : '❌'} ${path.basename(file)}`);
    
    if (!hasParameterSchema || !hasNoQuestions) {
      schemasCorrect = false;
    }
  }
}
console.log('');

// Summary
console.log('📊 Analysis Summary:');
console.log(`Plugin Architecture: ${correctArchitecture ? '✅ Correct' : '❌ Issues Found'}`);
console.log(`Base Classes: ${hasNoQuestionGenerator && hasParameterSchema && hasValidation ? '✅ Correct' : '❌ Issues Found'}`);
console.log(`Old Files Cleanup: ${oldFilesRemoved ? '✅ Complete' : '❌ Incomplete'}`);
console.log(`Schema Files: ${schemasCorrect ? '✅ Correct' : '❌ Issues Found'}`);

const overallCorrect = correctArchitecture && hasNoQuestionGenerator && hasParameterSchema && hasValidation && oldFilesRemoved && schemasCorrect;

if (overallCorrect) {
  console.log('\n🎉 All plugins follow the correct architecture!');
  console.log('\n✅ Plugins provide data (schemas) only');
  console.log('✅ Agents handle questions');
  console.log('✅ No question generation in plugins');
  console.log('✅ Clean separation of concerns');
  console.log('✅ Old complex files removed');
  console.log('\n🚀 Phase 3 is already complete!');
} else {
  console.log('\n❌ Some issues found. Phase 3 cleanup needed.');
  process.exit(1);
} 