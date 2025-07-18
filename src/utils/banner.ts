/**
 * Banner Utilities
 * 
 * Provides consistent messaging and visual feedback for the CLI
 */

import chalk from 'chalk';

const BANNER = `
████████╗██╗  ██╗███████╗
╚══██╔══╝██║  ██║██╔════╝
   ██║   ███████║█████╗  
   ██║   ██╔══██║██╔══╝  
   ██║   ██║  ██║███████╗
   ╚═╝   ╚═╝  ╚═╝╚══════╝

 █████╗ ██████╗  ██████╗██╗  ██╗██╗████████╗███████╗ ██████╗██╗  ██╗
██╔══██╗██╔══██╗██╔════╝██║  ██║██║╚══██╔══╝██╔════╝██╔════╝██║  ██║
███████║██████╔╝██║     ███████║██║   ██║   █████╗  ██║     ███████║
██╔══██║██╔══██╗██║     ██╔══██║██║   ██║   ██╔══╝  ██║     ██╔══██║
██║  ██║██║  ██║╚██████╗██║  ██║██║   ██║   ███████╗╚██████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝
  `;

export function displayBanner(): void {
  console.log(chalk.cyan(BANNER));
  console.log(chalk.yellow.bold('🚀 Revolutionary AI-Powered Application Generator'));
  console.log(chalk.gray('   Transform weeks of work into minutes\n'));
}

export function displaySuccess(message: string): void {
  console.log(chalk.green.bold(`\n✨ ${message}`));
}

export function displayError(message: string): void {
  console.log(chalk.red.bold(`\n❌ ${message}`));
}

export function displayWarning(message: string): void {
  console.log(chalk.yellow.bold(`\n⚠️  ${message}`));
}

export function displayInfo(message: string): void {
  console.log(chalk.blue.bold(`\nℹ️  ${message}`));
} 