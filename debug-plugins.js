#!/usr/bin/env node

import { PluginSystem } from './dist/utils/plugin-system.js';

async function debugPlugins() {
  console.log('🔍 Debugging Plugin Selection...\n');
  
  const pluginSystem = PluginSystem.getInstance();
  const registry = pluginSystem.getRegistry();
  
  console.log('📋 All Registered Plugins:');
  const allPlugins = registry.getAll();
  allPlugins.forEach(plugin => {
    const metadata = plugin.getMetadata();
    console.log(`  - ${metadata.id}: ${metadata.name} (${metadata.category})`);
  });
  
  console.log('\n🎨 UI Plugins:');
  const uiPlugins = allPlugins.filter(plugin => {
    const metadata = plugin.getMetadata();
    return metadata.category === 'ui-library' || metadata.category === 'design-system';
  });
  uiPlugins.forEach(plugin => {
    const metadata = plugin.getMetadata();
    console.log(`  - ${metadata.id}: ${metadata.name} (${metadata.category})`);
  });
  
  console.log('\n🗄️ Database Plugins:');
  const dbPlugins = allPlugins.filter(plugin => {
    const metadata = plugin.getMetadata();
    return metadata.category === 'orm' || metadata.category === 'database';
  });
  dbPlugins.forEach(plugin => {
    const metadata = plugin.getMetadata();
    console.log(`  - ${metadata.id}: ${metadata.name} (${metadata.category})`);
  });
  
  console.log('\n🔧 Testing Plugin Retrieval:');
  const testPlugins = ['shadcn-ui', 'tamagui', 'drizzle', 'prisma'];
  testPlugins.forEach(pluginId => {
    const plugin = registry.get(pluginId);
    if (plugin) {
      const metadata = plugin.getMetadata();
      console.log(`  ✅ ${pluginId}: Found (${metadata.category})`);
    } else {
      console.log(`  ❌ ${pluginId}: Not found`);
    }
  });
}

debugPlugins().catch(console.error); 