/**
 * New Command
 *
 * Creates a new project from an architech.yaml recipe
 * Usage: architech new <recipe-file>
 */
import { Command } from 'commander';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { OrchestratorAgent } from '../agents/orchestrator-agent.js';
import { ProjectManager } from '../core/services/project/project-manager.js';
import { AgentLogger as Logger } from '../core/cli/logger.js';
export function createNewCommand() {
    const command = new Command('new');
    command
        .description('Create a new project from an architech.yaml recipe')
        .argument('<recipe-file>', 'Path to the architech.yaml recipe file')
        .option('-d, --dry-run', 'Show what would be created without executing', false)
        .option('-v, --verbose', 'Enable verbose logging', false)
        .action(async (recipeFile, options) => {
        const logger = new Logger(options.verbose);
        try {
            logger.info(`🚀 Creating new project from recipe: ${recipeFile}`);
            // Read and parse the recipe file
            const recipeContent = readFileSync(recipeFile, 'utf8');
            const recipe = yaml.load(recipeContent);
            if (!recipe) {
                logger.error('❌ Failed to parse recipe file');
                process.exit(1);
            }
            // Validate recipe structure
            const validation = validateRecipe(recipe);
            if (!validation.valid) {
                logger.error('❌ Invalid recipe structure:');
                validation.errors.forEach(error => logger.error(`  - ${error}`));
                process.exit(1);
            }
            logger.info(`📋 Recipe: ${recipe.project.name}`);
            logger.info(`📁 Project path: ${recipe.project.path}`);
            logger.info(`🔧 Modules: ${recipe.modules.length}`);
            if (options.dryRun) {
                logger.info('🔍 Dry run mode - showing what would be created:');
                showDryRunPreview(recipe, logger);
                return;
            }
            // Initialize project manager and orchestrator
            const projectManager = new ProjectManager(recipe.project);
            const orchestrator = new OrchestratorAgent(projectManager);
            // Execute the recipe
            logger.info('🎯 Starting project creation...');
            const result = await orchestrator.executeRecipe(recipe);
            if (result.success) {
                logger.success(`🎉 Project created successfully!`);
                logger.info(`✅ ${result.modulesExecuted} modules executed`);
                if (result.warnings && result.warnings.length > 0) {
                    logger.warn('⚠️ Warnings:');
                    result.warnings.forEach(warning => logger.warn(`  - ${warning}`));
                }
            }
            else {
                logger.error('💥 Project creation failed:');
                if (result.errors) {
                    result.errors.forEach(error => logger.error(`  - ${error}`));
                }
                process.exit(1);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`💥 Failed to create project: ${errorMessage}`);
            process.exit(1);
        }
    });
    return command;
}
/**
 * Validate recipe structure
 */
function validateRecipe(recipe) {
    const errors = [];
    if (!recipe) {
        errors.push('Recipe is null or undefined');
        return { valid: false, errors };
    }
    if (!recipe.project) {
        errors.push('Recipe must have a project section');
    }
    else {
        if (!recipe.project.name) {
            errors.push('Project must have a name');
        }
        if (!recipe.project.path) {
            errors.push('Project must have a path');
        }
    }
    if (!recipe.modules || !Array.isArray(recipe.modules)) {
        errors.push('Recipe must have a modules array');
    }
    else {
        recipe.modules.forEach((module, index) => {
            if (!module.id) {
                errors.push(`Module ${index} must have an id`);
            }
            if (!module.category) {
                errors.push(`Module ${index} must have a category`);
            }
            if (!module.version) {
                errors.push(`Module ${index} must have a version`);
            }
            if (!module.parameters) {
                errors.push(`Module ${index} must have parameters`);
            }
        });
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
/**
 * Show dry run preview
 */
function showDryRunPreview(recipe, logger) {
    logger.info(`📋 Project: ${recipe.project.name}`);
    logger.info(`📁 Path: ${recipe.project.path}`);
    logger.info(`🔧 Modules to be executed:`);
    recipe.modules.forEach((module, index) => {
        logger.info(`  ${index + 1}. ${module.id} (${module.category}) - v${module.version}`);
        if (module.parameters && Object.keys(module.parameters).length > 0) {
            logger.info(`     Parameters: ${JSON.stringify(module.parameters)}`);
        }
    });
    if (recipe.options?.skipInstall) {
        logger.info(`📦 Dependencies: Will be skipped (skipInstall: true)`);
    }
    else {
        logger.info(`📦 Dependencies: Will be installed automatically`);
    }
}
//# sourceMappingURL=new.js.map