#!/usr/bin/env node

// Phase 0 Research: Shadcn-ui Automation Test
// Goal: Prove we can automate shadcn-ui without interactive prompts

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testShadcnAutomation() {
  console.log(chalk.bold.blue('🧪 TESTING SHADCN-UI AUTOMATION\n'));
  
  const testDir = 'test-shadcn-project';
  const fullPath = path.join(process.cwd(), testDir);
  
  try {
    // Cleanup existing test
    if (existsSync(fullPath)) {
      console.log(chalk.yellow('🧹 Cleaning up existing test...'));
      execSync(`rm -rf ${fullPath}`);
    }
    
    // Step 1: Create Next.js project
    console.log(chalk.blue('1️⃣ Creating Next.js project with Tailwind...'));
    execSync(`npx create-next-app@latest ${testDir} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes`, {
      stdio: 'inherit'
    });
    console.log(chalk.green('✅ Next.js project created\n'));
    
    // Step 2: Copy components.json
    console.log(chalk.blue('2️⃣ Setting up shadcn-ui config...'));
    const templatePath = path.join(__dirname, 'components.json');
    const configPath = path.join(fullPath, 'components.json');
    const template = readFileSync(templatePath, 'utf8');
    writeFileSync(configPath, template);
    console.log(chalk.green('✅ components.json created\n'));
    
    // Step 3: Test component installation
    console.log(chalk.blue('3️⃣ Installing shadcn-ui components...'));
    
    process.chdir(fullPath);
    
    const components = ['button', 'card', 'input'];
    let successCount = 0;
    
    for (const component of components) {
      try {
        console.log(chalk.cyan(`  Installing ${component}...`));
        execSync(`npx shadcn-ui@latest add ${component} --yes`, { 
          stdio: 'pipe',
          timeout: 30000 
        });
        
        // Verify file was created
        const componentPath = path.join('src', 'components', 'ui', `${component}.tsx`);
        if (existsSync(componentPath)) {
          console.log(chalk.green(`  ✅ ${component} installed successfully`));
          successCount++;
        } else {
          console.log(chalk.red(`  ❌ ${component} file not found`));
        }
      } catch (error) {
        console.log(chalk.red(`  ❌ ${component} installation failed`));
      }
    }
    
    // Results
    console.log(chalk.bold.blue('\n📊 RESULTS:'));
    console.log(`Components installed: ${successCount}/${components.length}`);
    
    if (successCount === components.length) {
      console.log(chalk.bold.green('🎉 SHADCN AUTOMATION: SUCCESS!'));
      console.log(chalk.green('✅ Non-interactive installation works!'));
    } else {
      console.log(chalk.bold.yellow('⚠️ SHADCN AUTOMATION: PARTIAL SUCCESS'));
    }
    
    return successCount === components.length;
    
  } catch (error) {
    console.log(chalk.bold.red('❌ SHADCN AUTOMATION: FAILED'));
    console.log(chalk.red(`Error: ${error.message}`));
    return false;
  } finally {
    // Cleanup
    process.chdir('..');
    if (existsSync(fullPath)) {
      console.log(chalk.yellow('\n🧹 Cleaning up...'));
      execSync(`rm -rf ${fullPath}`);
    }
  }
}

// Run test
testShadcnAutomation()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error(chalk.red('Test failed:'), error);
    process.exit(1);
  }); 