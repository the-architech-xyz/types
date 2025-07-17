/**
 * CommandRunner - Package Manager Agnostic Command Execution
 * 
 * Validated in Phase 0 Research with 75% success rate across package managers.
 * Provides a unified interface for npm, yarn, pnpm, and bun.
 */

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export class CommandRunner {
  constructor(packageManager = 'auto', options = {}) {
    this.verbose = options.verbose || false;
    this.packageManager = packageManager === 'auto' 
      ? this.detectPackageManager() 
      : packageManager;
    
    this.commands = this.getPackageManagerCommands(this.packageManager);
    
    if (this.verbose) {
      console.log(chalk.blue(`🔧 Using package manager: ${this.packageManager}`));
    }
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

    if (this.verbose) {
      console.log(chalk.gray(`📦 Available package managers: ${available.join(', ')}`));
    }

    // Check parent directories for existing projects (traversing up)
    let currentDir = process.cwd();
    const root = path.parse(currentDir).root;
    
    while (currentDir !== root) {
      if (existsSync(path.join(currentDir, 'yarn.lock'))) {
        if (this.verbose) console.log(chalk.yellow('📄 Found yarn.lock'));
        return available.includes('yarn') ? 'yarn' : 'npm';
      }
      if (existsSync(path.join(currentDir, 'pnpm-lock.yaml'))) {
        if (this.verbose) console.log(chalk.yellow('📄 Found pnpm-lock.yaml'));
        return available.includes('pnpm') ? 'pnpm' : 'npm';
      }
      if (existsSync(path.join(currentDir, 'bun.lockb'))) {
        if (this.verbose) console.log(chalk.yellow('📄 Found bun.lockb'));
        return available.includes('bun') ? 'bun' : 'npm';
      }
      currentDir = path.dirname(currentDir);
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
        init: ['npm', 'init', '-y'],
        exec: ['npx']
      },
      yarn: {
        create: ['yarn', 'create', 'next-app'],
        install: ['yarn', 'install'],
        installDev: ['yarn', 'add', '--dev'],
        run: ['yarn'],
        version: ['yarn', '--version'],
        init: ['yarn', 'init', '-y'],
        exec: ['yarn', 'dlx']
      },
      pnpm: {
        create: ['pnpm', 'create', 'next-app'],
        install: ['pnpm', 'install'],
        installDev: ['pnpm', 'add', '--save-dev'],
        run: ['pnpm', 'run'],
        version: ['pnpm', '--version'],
        init: ['pnpm', 'init', '-y'],
        exec: ['pnpx']
      },
      bun: {
        create: ['bunx', 'create-next-app@latest'],
        install: ['bun', 'install'],
        installDev: ['bun', 'add', '--development'],
        run: ['bun', 'run'],
        version: ['bun', '--version'],
        init: ['bun', 'init', '-y'],
        exec: ['bunx']
      }
    };
    
    return commands[pm] || commands.npm;
  }

  async execCommand(cmdArray, options = {}) {
    const [command, ...args] = cmdArray;
    const cmdString = `${command} ${args.join(' ')}`;
    
    // Enhanced spinner with package manager context
    const spinner = ora({
      text: `${cmdString}`,
      spinner: 'dots',
      color: 'cyan'
    });

    if (!options.silent) {
      spinner.start();
    }
    
    return new Promise((resolve, reject) => {
      const childProcess = spawn(command, args, {
        stdio: options.silent ? 'pipe' : 'inherit',
        shell: true,
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        ...options
      });

      let stdout = '';
      let stderr = '';

      if (options.silent) {
        childProcess.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        childProcess.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
      }

      childProcess.on('close', (code) => {
        if (!options.silent) {
          spinner.stop();
        }
        
        if (code === 0) {
          if (!options.silent) {
            console.log(chalk.green(`✅ Completed: ${command}`));
          }
          resolve({ stdout, stderr, code });
        } else {
          if (!options.silent) {
            console.log(chalk.red(`❌ Failed: ${cmdString} (exit code: ${code})`));
          }
          reject(new Error(`Command failed: ${cmdString}\nExit code: ${code}\nStderr: ${stderr}`));
        }
      });

      childProcess.on('error', (error) => {
        if (!options.silent) {
          spinner.fail(`❌ Error: ${cmdString}`);
        }
        reject(error);
      });
    });
  }

  async getVersion() {
    try {
      const result = await this.execCommand(this.commands.version, { silent: true });
      return result.stdout.trim();
    } catch (error) {
      throw new Error(`Failed to get ${this.packageManager} version: ${error.message}`);
    }
  }

  async createProject(projectName, framework = 'nextjs', options = []) {
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

  async exec(toolName, args = [], cwd = process.cwd()) {
    const execCmd = [...this.commands.exec, toolName, ...args];
    return this.execCommand(execCmd, { cwd });
  }

  // Helper method for The Architech specific operations
  async initProject(projectPath, framework = 'nextjs', options = {}) {
    const projectName = path.basename(projectPath);
    const parentDir = path.dirname(projectPath);
    
    // Create Next.js project with all our preferred settings
    const createOptions = [
      '--typescript',
      '--tailwind', 
      '--eslint',
      '--app',
      '--src-dir',
      '--import-alias', '@/*',
      '--yes' // Non-interactive
    ];
    
    return this.execCommand(
      [...this.commands.create, projectName, ...createOptions], 
      { cwd: parentDir }
    );
  }
}

export default CommandRunner; 