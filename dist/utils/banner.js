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
export function displayBanner() {
    console.log(chalk.cyan(BANNER));
    console.log(chalk.yellow.bold('🚀 Revolutionary AI-Powered Application Generator'));
    console.log(chalk.gray('   Transform weeks of work into minutes\n'));
}
export function displaySuccess(message) {
    console.log(chalk.green.bold(`\n✨ ${message}`));
}
export function displayError(message) {
    console.log(chalk.red.bold(`\n❌ ${message}`));
}
export function displayWarning(message) {
    console.log(chalk.yellow.bold(`\n⚠️  ${message}`));
}
export function displayInfo(message) {
    console.log(chalk.blue.bold(`\nℹ️  ${message}`));
}
//# sourceMappingURL=banner.js.map