/**
 * New Command - Project Generation
 *
 * Handles the creation of new projects with intelligent template selection
 * and guided customization.
 */

import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { OrchestratorAgent } from '../agents/orchestrator-agent.js';
import { ContextFactory } from '../core/project/context-factory.js';
import { WorkflowTemplateService, WorkflowTemplate } from '../core/workflow/workflow-templates.js';
import { KeywordAnalyzer, TemplateSuggestion } from '../core/workflow/keyword-analyzer.js';
import fsExtra from 'fs-extra';
import { structureService } from '../core/project/structure-service.js';

// ============================================================================
// INTERFACES
// ============================================================================

export interface NewOptions {
  packageManager?: string;
  noGit?: boolean;
  noInstall?: boolean;
  yes?: boolean;
  projectType?: 'quick-prototype' | 'scalable-monorepo';
  template?: string;
}

export interface NewConfig {
  projectName: string;
  projectType: 'quick-prototype' | 'scalable-monorepo';
  packageManager: string;
  skipGit: boolean;
  skipInstall: boolean;
  useDefaults: boolean;
  userInput?: string;
  template: string;
  selectedTemplate?: WorkflowTemplate;
  customizations?: Record<string, any>;
}

// ============================================================================
// MAIN COMMAND
// ============================================================================

export async function newCommand(projectName?: string, options: NewOptions = {}): Promise<void> {
  console.log(chalk.blue.bold('🎭 Welcome to The Architech!\n'));
  
  try {
    // Step 1: Gather project configuration with template-based workflow
    const config = await gatherProjectConfig(projectName, options);
    
    // Step 2: Validate project doesn't exist
    await validateProject(config);
    
    // Step 3: Create enhanced context with template information
    const context = createEnhancedContext(config);
    
    // Step 4: Execute orchestrator agent with enhanced context
    await executeOrchestrator(context);
    
    // Step 5: Display success summary with next steps
    displayProjectSummary(config);
    
  } catch (error) {
    displayError(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// ============================================================================
// CONFIGURATION GATHERING
// ============================================================================

async function gatherProjectConfig(projectName?: string, options: NewOptions = {}): Promise<NewConfig> {
  let config: NewConfig = {
    projectName: projectName || '',
    projectType: options.projectType || 'quick-prototype',
    packageManager: options.packageManager || 'auto',
    skipGit: options.noGit || false,
    skipInstall: options.noInstall || false,
    useDefaults: options.yes || false,
    template: options.template || 'nextjs-14',
    userInput: ''
  };

  // If using interactive mode (not --yes flag)
  if (!options.yes) {
    // Step 1: Get user input for intelligent template suggestions
    const { userInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'userInput',
        message: chalk.yellow('🤖 What are you building? (optional):'),
        default: '',
        description: 'Describe your project, e.g., "A blog with payments" or "Quick prototype"'
      }
    ]);

    config.userInput = userInput;

    // Step 2: Get intelligent template suggestions
    const suggestions = KeywordAnalyzer.analyzeInput(userInput);
    const allTemplates = WorkflowTemplateService.getTemplates();
    const customTemplate = WorkflowTemplateService.getCustomTemplate();

    // Step 3: Let user choose template
    const { selectedTemplateId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTemplateId',
        message: chalk.yellow('🎯 Choose your project template:'),
        choices: [
          // Show intelligent suggestions first
          ...(suggestions.length > 0 ? [
            new inquirer.Separator(chalk.cyan('💡 Recommended for you:')),
            ...suggestions.map(suggestion => ({
              name: `${suggestion.template.name} ${chalk.gray(`(${suggestion.template.questions} questions, ${suggestion.template.estimatedTime})`)}`,
              value: suggestion.template.id,
              description: `${suggestion.reason} - ${suggestion.template.description}`
            }))
          ] : []),
          
          // Show all available templates
          new inquirer.Separator(chalk.cyan('📋 All templates:')),
          ...allTemplates.map(template => ({
            name: `${template.name} ${chalk.gray(`(${template.questions} questions, ${template.estimatedTime})`)}`,
            value: template.id,
            description: template.description
          })),
          
          // Custom option
          new inquirer.Separator(chalk.cyan('⚙️  Advanced:')),
          {
            name: `${customTemplate.name} ${chalk.gray(`(${customTemplate.questions} questions, ${customTemplate.estimatedTime})`)}`,
            value: customTemplate.id,
            description: customTemplate.description
          }
        ],
        default: suggestions.length > 0 ? suggestions[0]?.template.id : 'quick-start'
      }
    ]);

    // Step 4: Get selected template and gather customizations
    const selectedTemplate = selectedTemplateId === 'custom' 
      ? customTemplate 
      : WorkflowTemplateService.getTemplate(selectedTemplateId);

    if (!selectedTemplate) {
      throw new Error(`Template not found: ${selectedTemplateId}`);
    }

    config.selectedTemplate = selectedTemplate;
    config.template = selectedTemplateId;

    // Step 5: Gather template-specific customizations
    if (selectedTemplate.customizations.length > 0) {
      console.log(chalk.blue(`\n📝 Customizing your ${selectedTemplate.name} project...\n`));
      
      const customizationAnswers = await inquirer.prompt(
        selectedTemplate.customizations.map(customization => {
          const question: any = {
            type: customization.type === 'boolean' ? 'confirm' : 
                  customization.type === 'choice' ? 'list' : 'input',
            name: customization.id,
            message: chalk.yellow(customization.name),
            description: customization.description
          };

          if (customization.type === 'choice' && customization.options) {
            question.choices = customization.options;
          }

          if (customization.default !== undefined) {
            question.default = customization.default;
          }

          if (customization.required) {
            question.validate = (input: string) => {
              if (!input || input.trim().length === 0) {
                return `${customization.name} is required`;
              }
              return true;
            };
          }

          return question;
        })
      );

      config.customizations = customizationAnswers;
      config.projectName = customizationAnswers?.projectName || config.projectName;
    }

    // Step 6: Additional configuration for non-custom templates
    if (selectedTemplateId !== 'custom') {
      const additionalConfig = await inquirer.prompt([
        {
          type: 'list',
          name: 'packageManager',
          message: chalk.yellow('📦 Choose your package manager:'),
          choices: [
            { name: 'npm - Default Node.js package manager', value: 'npm' },
            { name: 'yarn - Fast, reliable, and secure', value: 'yarn' },
            { name: 'pnpm - Fast, disk space efficient', value: 'pnpm' },
            { name: 'bun - All-in-one JavaScript runtime & toolkit', value: 'bun' },
            { name: 'Auto-detect (recommended)', value: 'auto' }
          ],
          default: 'auto'
        },
        {
          type: 'confirm',
          name: 'skipGit',
          message: chalk.yellow('🚫 Skip git repository initialization?'),
          default: false
        },
        {
          type: 'confirm',
          name: 'skipInstall',
          message: chalk.yellow('🚫 Skip dependency installation?'),
          default: false
        }
      ]);

      config = {
        ...config,
        packageManager: additionalConfig.packageManager || config.packageManager,
        skipGit: additionalConfig.skipGit !== undefined ? additionalConfig.skipGit : config.skipGit,
        skipInstall: additionalConfig.skipInstall !== undefined ? additionalConfig.skipInstall : config.skipInstall
      };
    }
  } else {
    // For --yes flag, use default template based on project name or type
    const defaultTemplate = WorkflowTemplateService.getTemplate('quick-start');
    if (defaultTemplate) {
      config.selectedTemplate = defaultTemplate;
      config.template = 'quick-start';
      config.userInput = `Template-based project: ${defaultTemplate.name}`;
      
      // Set default project name if not provided
      if (!config.projectName) {
        config.projectName = 'my-architech-app';
      }
    }
  }

  return config;
}

// ============================================================================
// VALIDATION
// ============================================================================

async function validateProject(config: NewConfig): Promise<void> {
  const projectPath = path.resolve(config.projectName);
  
  if (await fsExtra.pathExists(projectPath)) {
    throw new Error(`Project directory already exists: ${config.projectName}`);
  }
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

function createEnhancedContext(config: NewConfig) {
  // Determine project structure based on template
  const isCustom = config.selectedTemplate?.id === 'custom';
  const structureType = isCustom ? 
    (config.projectType === 'quick-prototype' ? 'single-app' : 'monorepo') :
    'single-app'; // Templates default to single-app for simplicity

  // Create enhanced context with template information
  const context = ContextFactory.createContext(
    config.projectName,
    {
      packageManager: config.packageManager as any,
      skipGit: config.skipGit,
      skipInstall: config.skipInstall,
      useDefaults: config.useDefaults,
      verbose: true
    },
    {
      template: config.template,
      structure: structureType,
      modules: [],
      userInput: config.userInput,
      projectType: config.projectType
    }
  );

  // Add template information to context
  context.state.set('selectedTemplate', config.selectedTemplate);
  context.state.set('customizations', config.customizations);
  context.state.set('isTemplateBased', !isCustom);

  // Enhance the context with project structure information
  context.projectStructure = structureService.createStructureInfo(config.projectType, config.template);

  return context;
}

// ============================================================================
// ORCHESTRATION
// ============================================================================

async function executeOrchestrator(context: any): Promise<void> {
  console.log(chalk.blue('\n🚀 Starting project generation...\n'));
  
  const orchestrator = new OrchestratorAgent();
  const result = await orchestrator.execute(context);
  
  if (!result.success) {
    throw new Error(`Orchestration failed: ${result.errors?.map(e => e.message).join(', ')}`);
  }
}

// ============================================================================
// SUCCESS DISPLAY
// ============================================================================

function displayProjectSummary(config: NewConfig): void {
  const template = config.selectedTemplate;
  
  console.log(chalk.green.bold('\n🎉 Project generated successfully!\n'));
  
  if (template) {
    console.log(chalk.blue(`📋 Template: ${template.name}`));
    console.log(chalk.gray(`   ${template.description}`));
    console.log(chalk.gray(`   Questions answered: ${template.questions}`));
    console.log(chalk.gray(`   Estimated time: ${template.estimatedTime}\n`));
  }
  
  console.log(chalk.yellow('📁 Next steps:'));
  console.log(`   cd ${config.projectName}`);
  
  if (!config.skipInstall) {
    console.log(`   npm install`);
  }
  
  console.log(`   npm run dev`);
  console.log(`   npm run build`);
  
  if (template?.id === 'custom') {
    console.log(chalk.blue('\n🔧 Custom setup complete!'));
    console.log(chalk.gray('   You can now customize your project further.'));
  } else if (template) {
    console.log(chalk.blue('\n✨ Your project is ready!'));
    console.log(chalk.gray(`   Built with ${template.name} template.`));
  }
  
  console.log(chalk.green('\n🚀 Happy coding!\n'));
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

function displayError(message: string): void {
  console.error(chalk.red(`\n❌ ${message}\n`));
} 