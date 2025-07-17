#!/usr/bin/env node

// Phase 0 Research: Package Manager Agnostic Command Runner
// Testing compatibility with npm, yarn, pnpm, and bun

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';

class CommandRunner {
  constructor(packageManager = 'auto') {
    this.packageManager = packageManager === 'auto' 
      ? this.detectPackageManager() 
      : packageManager;
    
    this.commands = this.getPackageManagerCommands(this.packageManager);
    console.log(chalk.blue(`🔧 Using package manager: ${this.packageManager}`));
  }

  detectPackageManager() {
    // Check which package managers are available
    const available = [];
    
    try {
      execSync('npm --version', { stdio: 'ignore' });
      available.push('npm');
    } catch {}
    
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      available.push('yarn');
    } catch {}
    
    try {
      execSync('pnpm --version', { stdio: 'ignore' });
      available.push('pnpm');
    } catch {}
    
    try {
      execSync('bun --version', { stdio: 'ignore' });
      available.push('bun');
    } catch {}

    console.log(chalk.gray(`📦 Available package managers: ${available.join(', ')}`));

    // Check parent directory for existing projects
    const parentDir = process.cwd();
    if (existsSync(path.join(parentDir, 'yarn.lock'))) {
      console.log(chalk.yellow('📄 Found yarn.lock in parent directory'));
      return available.includes('yarn') ? 'yarn' : 'npm';
    }
    if (existsSync(path.join(parentDir, 'pnpm-lock.yaml'))) {
      console.log(chalk.yellow('📄 Found pnpm-lock.yaml in parent directory'));
      return available.includes('pnpm') ? 'pnpm' : 'npm';
    }
    if (existsSync(path.join(parentDir, 'bun.lockb'))) {
      console.log(chalk.yellow('📄 Found bun.lockb in parent directory'));
      return available.includes('bun') ? 'bun' : 'npm';
    }

    // Default preference order: yarn > npm > pnpm > bun
    if (available.includes('yarn')) return 'yarn';
    if (available.includes('npm')) return 'npm';
    if (available.includes('pnpm')) return 'pnpm';
    if (available.includes('bun')) return 'bun';
    
    throw new Error('No package manager found! Please install npm, yarn, pnpm, or bun.');
  }

  getPackageManagerCommands(pm) {
    const commands = {
      npm: {
        create: ['npx', 'create-next-app@latest'],
        install: ['npm', 'install'],
        installDev: ['npm', 'install', '--save-dev'],
        run: ['npm', 'run'],
        version: ['npm', '--version'],
        init: ['npm', 'init', '-y']
      },
      yarn: {
        create: ['yarn', 'create', 'next-app'],
        install: ['yarn', 'install'],
        installDev: ['yarn', 'add', '--dev'],
        run: ['yarn'],
        version: ['yarn', '--version'],
        init: ['yarn', 'init', '-y']
      },
      pnpm: {
        create: ['pnpm', 'create', 'next-app'],
        install: ['pnpm', 'install'],
        installDev: ['pnpm', 'add', '--save-dev'],
        run: ['pnpm', 'run'],
        version: ['pnpm', '--version'],
        init: ['pnpm', 'init', '-y']
      },
      bun: {
        create: ['bunx', 'create-next-app@latest'], // bun uses bunx for npx equivalent
        install: ['bun', 'install'],
        installDev: ['bun', 'add', '--development'],
        run: ['bun', 'run'],
        version: ['bun', '--version'],
        init: ['bun', 'init', '-y']
      }
    };
    
    return commands[pm] || commands.npm;
  }

  async execCommand(cmdArray, options = {}) {
    const [command, ...args] = cmdArray;
    const cmdString = `${command} ${args.join(' ')}`;
    
    console.log(chalk.cyan(`▶️  Executing: ${cmdString}`));
    
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        ...options
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green(`✅ Success: ${cmdString}`));
          resolve({ stdout, stderr, code });
        } else {
          console.log(chalk.red(`❌ Failed: ${cmdString} (exit code: ${code})`));
          reject(new Error(`Command failed: ${cmdString}\nStderr: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        console.log(chalk.red(`❌ Error: ${cmdString}`));
        reject(error);
      });
    });
  }

  async getVersion() {
    try {
      const result = await this.execCommand(this.commands.version);
      return result.stdout.trim();
    } catch (error) {
      throw new Error(`Failed to get ${this.packageManager} version: ${error.message}`);
    }
  }

  async createProject(projectName, options = []) {
    const createCmd = [...this.commands.create, projectName, ...options];
    return this.execCommand(createCmd);
  }

  async install(packages = [], isDev = false, cwd = process.cwd()) {
    const installCmd = isDev ? this.commands.installDev : this.commands.install;
    const fullCmd = packages.length > 0 ? [...installCmd, ...packages] : installCmd;
    
    return this.execCommand(fullCmd, { cwd });
  }

  async runScript(scriptName, cwd = process.cwd()) {
    const runCmd = [...this.commands.run, scriptName];
    return this.execCommand(runCmd, { cwd });
  }
}

// Export for use in other modules
export { CommandRunner };

// If run directly, perform tests
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(chalk.bold.blue('🧪 Testing Package Manager Command Runner\n'));
  
  async function testPackageManager(pm) {
    console.log(chalk.bold.yellow(`\n📦 Testing ${pm.toUpperCase()}`));
    console.log('─'.repeat(40));
    
    try {
      const runner = new CommandRunner(pm);
      
      // Test 1: Get version
      console.log(chalk.blue('\n1️⃣ Testing version command...'));
      const version = await runner.getVersion();
      console.log(chalk.green(`✅ Version: ${version}`));
      
      return { success: true, version };
    } catch (error) {
      console.log(chalk.red(`❌ ${pm} test failed: ${error.message}`));
      return { success: false, error: error.message };
    }
  }

  async function runAllTests() {
    const packageManagers = ['npm', 'yarn', 'pnpm', 'bun'];
    const results = {};
    
    for (const pm of packageManagers) {
      results[pm] = await testPackageManager(pm);
    }
    
    // Summary
    console.log(chalk.bold.blue('\n📊 TEST RESULTS SUMMARY'));
    console.log('═'.repeat(50));
    
    Object.entries(results).forEach(([pm, result]) => {
      if (result.success) {
        console.log(chalk.green(`✅ ${pm.padEnd(6)}: ${result.version}`));
      } else {
        console.log(chalk.red(`❌ ${pm.padEnd(6)}: ${result.error}`));
      }
    });
    
    const successCount = Object.values(results).filter(r => r.success).length;
    console.log(chalk.bold(`\n🎯 Success Rate: ${successCount}/${packageManagers.length} package managers`));
    
    // Test auto-detection
    console.log(chalk.bold.blue('\n🔍 Testing Auto-Detection'));
    console.log('─'.repeat(30));
    
    try {
      const autoRunner = new CommandRunner('auto');
      console.log(chalk.green(`✅ Auto-detected: ${autoRunner.packageManager}`));
    } catch (error) {
      console.log(chalk.red(`❌ Auto-detection failed: ${error.message}`));
    }
  }

  runAllTests().catch(console.error);
} 