/**
 * Validation Agent - Post-Generation Quality Checker
 *
 * Validates the generated project structure and configuration:
 * - Checks TypeScript compilation
 * - Validates workspace dependencies
 * - Tests import paths
 * - Verifies configuration files
 * - Provides detailed feedback
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { execa } from 'execa';
export class ValidationAgent extends AbstractAgent {
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'ValidationAgent',
            version: '1.0.0',
            description: 'Post-generation quality checker that validates project structure and configuration',
            author: 'The Architech Team',
            category: AgentCategory.TESTING,
            tags: ['validation', 'quality', 'testing', 'verification'],
            dependencies: [],
            conflicts: [],
            requirements: [
                {
                    type: 'package',
                    name: 'typescript',
                    description: 'TypeScript for compilation checks'
                }
            ],
            license: 'MIT',
            repository: 'https://github.com/the-architech/cli'
        };
    }
    getAgentCapabilities() {
        return [
            {
                name: 'project-structure-validation',
                description: 'Validates the overall project structure and required files',
                parameters: [],
                examples: [
                    {
                        name: 'Structure Validation',
                        description: 'Checks for required directories and files',
                        parameters: {},
                        expectedResult: 'Validation report of project structure'
                    }
                ],
                category: CapabilityCategory.VALIDATION
            },
            {
                name: 'dependency-validation',
                description: 'Validates workspace dependencies and package.json files',
                parameters: [],
                examples: [
                    {
                        name: 'Dependency Check',
                        description: 'Verifies workspace dependencies are properly configured',
                        parameters: {},
                        expectedResult: 'Validation report of dependencies'
                    }
                ],
                category: CapabilityCategory.VALIDATION
            },
            {
                name: 'typescript-compilation-check',
                description: 'Runs TypeScript compilation to check for type errors',
                parameters: [],
                examples: [
                    {
                        name: 'TypeScript Check',
                        description: 'Compiles TypeScript files to detect type errors',
                        parameters: {},
                        expectedResult: 'TypeScript compilation report'
                    }
                ],
                category: CapabilityCategory.VALIDATION
            }
        ];
    }
    // ============================================================================
    // CORE EXECUTION
    // ============================================================================
    async executeInternal(context) {
        const { projectPath } = context;
        context.logger.info('Running project validation checks');
        try {
            // Run validation checks
            const results = await this.runValidationChecks(projectPath, context);
            // Display validation results
            this.displayValidationResults(results);
            context.logger.success(`Validation completed with ${results.totalIssues} issues found`);
            return this.createSuccessResult(results, [], this.getNextSteps(results.totalIssues));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Validation failed: ${errorMessage}`, error);
            return this.createErrorResult('VALIDATION_FAILED', `Validation failed: ${errorMessage}`, [], 0, error);
        }
    }
    async validate(context) {
        // Validation agent doesn't require specific validation
        return {
            valid: true,
            errors: [],
            warnings: []
        };
    }
    async rollback(context) {
        // Validation agent doesn't create files, so no rollback needed
    }
    async runValidationChecks(projectPath, context) {
        const results = {
            structure: await this.validateProjectStructure(projectPath),
            dependencies: await this.validateDependencies(projectPath, context),
            configuration: await this.validateConfiguration(projectPath),
            imports: await this.validateImportPaths(projectPath, context),
            typescript: await this.validateTypeScript(projectPath),
            totalIssues: 0
        };
        // Count total issues
        results.totalIssues = Object.values(results).reduce((total, result) => {
            if (typeof result === 'object' && 'issues' in result) {
                return total + result.issues.length;
            }
            return total;
        }, 0);
        return results;
    }
    async validateProjectStructure(projectPath) {
        const issues = [];
        const requiredDirs = [
            'apps/web',
            'packages/ui',
            'packages/db',
            'packages/auth',
            'packages/config'
        ];
        const requiredFiles = [
            'package.json',
            'turbo.json',
            'tsconfig.json',
            '.eslintrc.json',
            '.prettierrc.json',
            'tailwind.config.js',
            'components.json'
        ];
        // Check directories
        for (const dir of requiredDirs) {
            if (!(await fsExtra.pathExists(path.join(projectPath, dir)))) {
                issues.push(`Missing directory: ${dir}`);
            }
        }
        // Check files
        for (const file of requiredFiles) {
            if (!(await fsExtra.pathExists(path.join(projectPath, file)))) {
                issues.push(`Missing file: ${file}`);
            }
        }
        return {
            name: 'Project Structure',
            issues,
            status: issues.length === 0 ? '✅' : '⚠️'
        };
    }
    async validateDependencies(projectPath, context) {
        const issues = [];
        try {
            const rootPackageJson = await fsExtra.readJSON(path.join(projectPath, 'package.json'));
            const webPackageJson = await fsExtra.readJSON(path.join(projectPath, 'apps', 'web', 'package.json'));
            // Check workspace dependencies
            const expectedWorkspaceDeps = [
                `@${context.projectName}/ui`,
                `@${context.projectName}/db`,
                `@${context.projectName}/auth`
            ];
            for (const dep of expectedWorkspaceDeps) {
                if (!webPackageJson.dependencies?.[dep]) {
                    issues.push(`Missing workspace dependency: ${dep}`);
                }
            }
            // Check required root dependencies
            const requiredRootDeps = ['turbo', 'typescript', 'prettier'];
            for (const dep of requiredRootDeps) {
                if (!rootPackageJson.devDependencies?.[dep]) {
                    issues.push(`Missing root dependency: ${dep}`);
                }
            }
        }
        catch (error) {
            issues.push(`Failed to read package.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        return {
            name: 'Dependencies',
            issues,
            status: issues.length === 0 ? '✅' : '⚠️'
        };
    }
    async validateConfiguration(projectPath) {
        const issues = [];
        try {
            // Validate TypeScript config
            const tsConfig = await fsExtra.readJSON(path.join(projectPath, 'tsconfig.json'));
            if (!tsConfig.compilerOptions?.paths) {
                issues.push('TypeScript paths not configured');
            }
            // Validate ESLint config
            const eslintConfig = await fsExtra.readJSON(path.join(projectPath, '.eslintrc.json'));
            if (!eslintConfig.extends?.includes('@typescript-eslint/recommended')) {
                issues.push('ESLint TypeScript rules not configured');
            }
            // Validate Prettier config
            const prettierConfig = await fsExtra.readJSON(path.join(projectPath, '.prettierrc.json'));
            if (!prettierConfig.plugins?.includes('prettier-plugin-tailwindcss')) {
                issues.push('Prettier Tailwind plugin not configured');
            }
            // Validate Tailwind config
            const tailwindConfigPath = path.join(projectPath, 'tailwind.config.js');
            if (!(await fsExtra.pathExists(tailwindConfigPath))) {
                issues.push('Tailwind config missing');
            }
            // Validate Shadcn config
            const componentsConfig = await fsExtra.readJSON(path.join(projectPath, 'components.json'));
            if (!componentsConfig.aliases?.components) {
                issues.push('Shadcn components alias not configured');
            }
        }
        catch (error) {
            issues.push(`Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        return {
            name: 'Configuration',
            issues,
            status: issues.length === 0 ? '✅' : '⚠️'
        };
    }
    async validateImportPaths(projectPath, context) {
        const issues = [];
        try {
            // Check if import paths work by testing a simple import
            const testFiles = [
                {
                    path: path.join(projectPath, 'apps', 'web', 'src', 'app', 'page.tsx'),
                    imports: [
                        `import { Button } from "@/ui";`,
                        `import { db } from "@/db";`,
                        `import { auth } from "@/auth";`
                    ]
                }
            ];
            for (const testFile of testFiles) {
                if (await fsExtra.pathExists(testFile.path)) {
                    const content = await fsExtra.readFile(testFile.path, 'utf8');
                    for (const importStatement of testFile.imports) {
                        const importPart = importStatement.split(' from ')[0];
                        if (importPart && !content.includes(importPart)) {
                            issues.push(`Import path not tested: ${importStatement}`);
                        }
                    }
                }
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            issues.push(`Import validation failed: ${errorMessage}`);
        }
        return {
            name: 'Import Paths',
            issues,
            status: issues.length === 0 ? '✅' : '⚠️'
        };
    }
    async validateTypeScript(projectPath) {
        const issues = [];
        try {
            // Check if TypeScript can compile the project
            const originalCwd = process.cwd();
            try {
                process.chdir(projectPath);
                // Try to run TypeScript check
                await execa('npx', ['tsc', '--noEmit'], {
                    timeout: 30000,
                    stdio: 'pipe'
                });
            }
            catch (error) {
                if (error instanceof Error && 'exitCode' in error && error.exitCode !== 0) {
                    const stderr = error.stderr || '';
                    const stderrMessage = typeof stderr === 'string' ? stderr.slice(0, 200) : '';
                    issues.push(`TypeScript compilation failed: ${stderrMessage}...`);
                }
            }
            finally {
                process.chdir(originalCwd);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            issues.push(`TypeScript validation failed: ${errorMessage}`);
        }
        return {
            name: 'TypeScript',
            issues,
            status: issues.length === 0 ? '✅' : '⚠️'
        };
    }
    displayValidationResults(results) {
        console.log('\n🔍 VALIDATION RESULTS');
        console.log('─'.repeat(50));
        const categories = [
            results.structure,
            results.dependencies,
            results.configuration,
            results.imports,
            results.typescript
        ];
        for (const category of categories) {
            console.log(`${category.status} ${category.name}`);
            if (category.issues.length > 0) {
                for (const issue of category.issues) {
                    console.log(`  • ${issue}`);
                }
            }
            else {
                console.log(`  All checks passed`);
            }
            console.log('');
        }
        // Summary
        if (results.totalIssues === 0) {
            console.log('🎉 All validations passed! Your project is ready to use.');
        }
        else {
            console.log(`⚠️  Found ${results.totalIssues} issue(s) that may need attention.`);
            console.log('Most issues can be resolved by running the suggested commands.');
        }
        // Next steps
        console.log('\n🚀 NEXT STEPS:');
        console.log('─'.repeat(50));
        console.log('1. cd your-project-name');
        console.log('2. npm install (or your preferred package manager)');
        console.log('3. npm run dev');
        console.log('4. Open http://localhost:3000');
        if (results.totalIssues > 0) {
            console.log('\n🔧 If you encounter issues:');
            console.log('• Check the validation results above');
            console.log('• Run npm run type-check for TypeScript issues');
            console.log('• Run npm run lint for code quality issues');
        }
    }
    getNextSteps(totalIssues) {
        const steps = [
            'cd your-project-name',
            'npm install (or your preferred package manager)',
            'npm run dev',
            'Open http://localhost:3000'
        ];
        if (totalIssues > 0) {
            steps.push('Run npm run type-check for TypeScript issues');
            steps.push('Run npm run lint for code quality issues');
        }
        return steps;
    }
}
//# sourceMappingURL=validation-agent.js.map