#!/usr/bin/env node

// Phase 0 Research: Cross-Platform Compatibility Test
// Goal: Validate path handling and command execution across platforms

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

class PlatformTester {
  constructor() {
    this.platform = os.platform();
    this.arch = os.arch();
    this.isWindows = this.platform === 'win32';
    this.testDir = path.join(os.tmpdir(), 'architech-platform-test');
  }

  displaySystemInfo() {
    console.log(chalk.bold.blue('🖥️  SYSTEM INFORMATION'));
    console.log('─'.repeat(30));
    console.log(chalk.cyan(`Platform: ${this.platform}`));
    console.log(chalk.cyan(`Architecture: ${this.arch}`));
    console.log(chalk.cyan(`Node.js: ${process.version}`));
    console.log(chalk.cyan(`OS Type: ${os.type()}`));
    console.log(chalk.cyan(`OS Release: ${os.release()}`));
    console.log(chalk.cyan(`Home Dir: ${os.homedir()}`));
    console.log(chalk.cyan(`Temp Dir: ${os.tmpdir()}`));
  }

  async testPathHandling() {
    console.log(chalk.bold.blue('\n📁 TESTING PATH HANDLING'));
    console.log('─'.repeat(30));
    
    const tests = [
      {
        name: 'Join paths',
        test: () => {
          const joined = path.join('src', 'components', 'ui', 'button.tsx');
          const expected = this.isWindows ? 'src\\components\\ui\\button.tsx' : 'src/components/ui/button.tsx';
          return { result: joined, expected, success: joined === expected };
        }
      },
      {
        name: 'Resolve absolute path',
        test: () => {
          const resolved = path.resolve('.', 'package.json');
          const exists = existsSync(resolved);
          return { result: resolved, success: typeof resolved === 'string' && resolved.length > 0 };
        }
      },
      {
        name: 'Parse path components',
        test: () => {
          const testPath = '/users/test/project/src/index.ts';
          const parsed = path.parse(testPath);
          return { 
            result: parsed, 
            success: parsed.name === 'index' && parsed.ext === '.ts' 
          };
        }
      },
      {
        name: 'Cross-platform basename',
        test: () => {
          const windowsPath = 'C:\\Users\\test\\file.txt';
          const unixPath = '/home/test/file.txt';
          const winBase = path.basename(windowsPath);
          const unixBase = path.basename(unixPath);
          return { 
            result: { winBase, unixBase }, 
            success: winBase === 'file.txt' && unixBase === 'file.txt' 
          };
        }
      }
    ];

    let passedTests = 0;
    
    for (const { name, test } of tests) {
      try {
        const { result, success, expected } = test();
        if (success) {
          console.log(chalk.green(`  ✅ ${name}`));
          passedTests++;
        } else {
          console.log(chalk.red(`  ❌ ${name}`));
          if (expected) {
            console.log(chalk.gray(`    Expected: ${expected}`));
            console.log(chalk.gray(`    Got: ${result}`));
          }
        }
      } catch (error) {
        console.log(chalk.red(`  ❌ ${name}: ${error.message}`));
      }
    }
    
    return { passed: passedTests, total: tests.length };
  }

  async testCommandExecution() {
    console.log(chalk.bold.blue('\n⚡ TESTING COMMAND EXECUTION'));
    console.log('─'.repeat(30));
    
    const commands = [
      {
        name: 'Node.js version',
        cmd: 'node',
        args: ['--version'],
        timeout: 5000
      },
      {
        name: 'npm version', 
        cmd: 'npm',
        args: ['--version'],
        timeout: 5000
      },
      {
        name: 'Directory listing',
        cmd: this.isWindows ? 'dir' : 'ls',
        args: this.isWindows ? ['.'] : ['-la', '.'],
        timeout: 5000
      }
    ];

    let passedCommands = 0;
    
    for (const { name, cmd, args, timeout } of commands) {
      try {
        console.log(chalk.cyan(`  Testing: ${cmd} ${args.join(' ')}`));
        
        const result = await this.execCommand(cmd, args, { timeout });
        
        if (result.code === 0) {
          console.log(chalk.green(`  ✅ ${name}: Success`));
          passedCommands++;
        } else {
          console.log(chalk.red(`  ❌ ${name}: Failed (exit code: ${result.code})`));
        }
      } catch (error) {
        console.log(chalk.red(`  ❌ ${name}: ${error.message}`));
      }
    }
    
    return { passed: passedCommands, total: commands.length };
  }

  async testFileOperations() {
    console.log(chalk.bold.blue('\n📝 TESTING FILE OPERATIONS'));
    console.log('─'.repeat(30));
    
    try {
      // Create test directory
      if (existsSync(this.testDir)) {
        execSync(this.isWindows ? `rmdir /s /q "${this.testDir}"` : `rm -rf "${this.testDir}"`);
      }
      
      mkdirSync(this.testDir, { recursive: true });
      console.log(chalk.green('  ✅ Directory creation'));
      
      // Test file creation
      const testFile = path.join(this.testDir, 'test.json');
      const testContent = JSON.stringify({ test: 'data', platform: this.platform }, null, 2);
      writeFileSync(testFile, testContent);
      
      if (existsSync(testFile)) {
        console.log(chalk.green('  ✅ File creation'));
      } else {
        console.log(chalk.red('  ❌ File creation'));
        return { passed: 1, total: 3 };
      }
      
      // Test nested directory creation
      const nestedDir = path.join(this.testDir, 'src', 'components', 'ui');
      mkdirSync(nestedDir, { recursive: true });
      
      if (existsSync(nestedDir)) {
        console.log(chalk.green('  ✅ Nested directory creation'));
        return { passed: 3, total: 3 };
      } else {
        console.log(chalk.red('  ❌ Nested directory creation'));
        return { passed: 2, total: 3 };
      }
      
    } catch (error) {
      console.log(chalk.red(`  ❌ File operations failed: ${error.message}`));
      return { passed: 0, total: 3 };
    }
  }

  async execCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        ...options
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      const timeoutId = options.timeout ? setTimeout(() => {
        proc.kill();
        reject(new Error(`Command timeout: ${command}`));
      }, options.timeout) : null;

      proc.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({ stdout, stderr, code });
      });

      proc.on('error', (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  cleanup() {
    try {
      if (existsSync(this.testDir)) {
        execSync(this.isWindows ? `rmdir /s /q "${this.testDir}"` : `rm -rf "${this.testDir}"`);
        console.log(chalk.green('  ✅ Cleanup completed'));
      }
    } catch (error) {
      console.log(chalk.yellow(`  ⚠️  Cleanup warning: ${error.message}`));
    }
  }

  async runAllTests() {
    console.log(chalk.bold.blue('🧪 CROSS-PLATFORM COMPATIBILITY TEST\n'));
    
    this.displaySystemInfo();
    
    try {
      const pathResults = await this.testPathHandling();
      const commandResults = await this.testCommandExecution();
      const fileResults = await this.testFileOperations();
      
      // Summary
      console.log(chalk.bold.blue('\n📊 TEST RESULTS SUMMARY'));
      console.log('═'.repeat(40));
      
      const totalPassed = pathResults.passed + commandResults.passed + fileResults.passed;
      const totalTests = pathResults.total + commandResults.total + fileResults.total;
      
      console.log(chalk.bold(`Path Handling: ${pathResults.passed}/${pathResults.total}`));
      console.log(chalk.bold(`Command Execution: ${commandResults.passed}/${commandResults.total}`));
      console.log(chalk.bold(`File Operations: ${fileResults.passed}/${fileResults.total}`));
      console.log(chalk.bold(`Overall: ${totalPassed}/${totalTests}`));
      
      const successRate = (totalPassed / totalTests) * 100;
      
      if (successRate === 100) {
        console.log(chalk.bold.green('\n🎉 PLATFORM COMPATIBILITY: EXCELLENT!'));
        console.log(chalk.green('✅ All tests passed on ' + this.platform));
      } else if (successRate >= 80) {
        console.log(chalk.bold.yellow('\n⚠️ PLATFORM COMPATIBILITY: GOOD'));
        console.log(chalk.yellow(`✅ ${successRate.toFixed(0)}% tests passed on ${this.platform}`));
      } else {
        console.log(chalk.bold.red('\n❌ PLATFORM COMPATIBILITY: NEEDS WORK'));
        console.log(chalk.red(`❌ Only ${successRate.toFixed(0)}% tests passed on ${this.platform}`));
      }
      
      return successRate >= 80; // 80% success rate threshold
      
    } finally {
      console.log(chalk.bold.blue('\n🧹 CLEANUP'));
      console.log('─'.repeat(30));
      this.cleanup();
    }
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PlatformTester();
  
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(chalk.red('Platform test failed:'), error);
      process.exit(1);
    });
}

export { PlatformTester }; 