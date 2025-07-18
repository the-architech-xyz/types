#!/usr/bin/env node

/**
 * Build Script for The Architech
 * 
 * Compiles TypeScript files and sets up the project structure.
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync, copyFileSync } from 'fs';
import * as path from 'path';

console.log('🏗️  Building The Architech...\n');

try {
  // Clean dist directory
  if (existsSync('dist')) {
    console.log('🧹 Cleaning dist directory...');
    rmSync('dist', { recursive: true, force: true });
  }

  // Create dist directory
  console.log('📁 Creating dist directory...');
  mkdirSync('dist', { recursive: true });

  // Compile TypeScript files
  console.log('🔧 Compiling TypeScript files...');
  execSync('npx tsc', { stdio: 'inherit' });

  // Copy bin directory
  console.log('📦 Copying bin directory...');
  if (existsSync('bin')) {
    execSync('cp -r bin dist/', { stdio: 'inherit' });
  }

  // Copy package.json
  console.log('📄 Copying package.json...');
  copyFileSync('package.json', 'dist/package.json');

  // Copy README
  if (existsSync('README.md')) {
    console.log('📖 Copying README.md...');
    copyFileSync('README.md', 'dist/README.md');
  }

  console.log('\n✅ Build completed successfully!');
  console.log('📁 Output directory: dist/');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
} 