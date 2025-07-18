/**
 * Agent Adapter - Bridge between old command interface and new agent interface
 *
 * Provides compatibility layer to use new TypeScript agents with existing commands
 * while maintaining the old interface contract.
 */
import { BaseProjectAgent } from '../agents/base-project-agent.js';
import { UIAgent } from '../agents/ui-agent.js';
import { DBAgent } from '../agents/db-agent.js';
import { AuthAgent } from '../agents/auth-agent.js';
import { BaseArchitechAgent } from '../agents/base-architech-agent.js';
// Dynamic import for inquirer
let inquirerModule = null;
async function getInquirer() {
    if (!inquirerModule) {
        inquirerModule = await import('inquirer');
    }
    return inquirerModule.default;
}
// Simple logger implementation for compatibility
class SimpleLogger {
    info(message, data) {
        console.log(`ℹ️  ${message}`, data || '');
    }
    warn(message, data) {
        console.log(`⚠️  ${message}`, data || '');
    }
    error(message, error, data) {
        console.error(`❌ ${message}`, error?.message || '', data || '');
    }
    debug(message, data) {
        console.log(`🔍 ${message}`, data || '');
    }
    success(message, data) {
        console.log(`✅ ${message}`, data || '');
    }
    log(level, message, context) {
        switch (level) {
            case 'info':
                this.info(message, context?.data);
                break;
            case 'warn':
                this.warn(message, context?.data);
                break;
            case 'error':
                this.error(message, context?.error, context?.data);
                break;
            case 'debug':
                this.debug(message, context?.data);
                break;
            case 'success':
                this.success(message, context?.data);
                break;
            default:
                this.info(message, context?.data);
        }
    }
}
// Agent factory function
export function createAgent(agentType, runner) {
    const logger = new SimpleLogger();
    const baseContext = {
        projectName: '',
        projectPath: '',
        packageManager: runner.getPackageManager(),
        options: {
            skipGit: false,
            skipInstall: false,
            useDefaults: false,
            verbose: true,
            dryRun: false,
            force: false,
            timeout: 300000
        },
        config: {},
        runner,
        logger,
        state: new Map(),
        dependencies: [],
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            cwd: process.cwd(),
            env: process.env
        }
    };
    switch (agentType) {
        case 'BaseProjectAgent':
            return new BaseProjectAgent();
        case 'UIAgent':
            return new UIAgent();
        case 'DBAgent':
            return new DBAgent();
        case 'AuthAgent':
            return new AuthAgent();
        case 'BaseArchitechAgent':
            return new BaseArchitechAgent();
        default:
            throw new Error(`Unknown agent type: ${agentType}`);
    }
}
// Adapter function to execute agents with old interface
export async function executeAgentWithOldInterface(agentType, config, runner) {
    const agent = createAgent(agentType, runner);
    const logger = new SimpleLogger();
    // Create context from old config
    const context = {
        projectName: config.projectName || 'my-project',
        projectPath: config.projectPath || path.resolve(process.cwd(), config.projectName || 'my-project'),
        packageManager: runner.getPackageManager(),
        options: {
            skipGit: config.skipGit || config.noGit || false,
            skipInstall: config.skipInstall || config.noInstall || false,
            useDefaults: config.useDefaults || config.yes || false,
            verbose: true,
            dryRun: false,
            force: false,
            timeout: 300000
        },
        config: config,
        runner,
        logger,
        state: new Map(),
        dependencies: [],
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            cwd: process.cwd(),
            env: process.env
        }
    };
    try {
        logger.info(`Starting ${agentType}...`);
        const result = await agent.execute(context);
        if (result.success) {
            logger.success(`${agentType} completed successfully`);
            if (result.nextSteps && result.nextSteps.length > 0) {
                logger.info('Next steps:');
                result.nextSteps.forEach(step => logger.info(`  - ${step}`));
            }
        }
        else {
            logger.error(`${agentType} failed:`, new Error(result.errors?.[0]?.message || 'Unknown error'));
            throw new Error(result.errors?.[0]?.message || 'Agent execution failed');
        }
    }
    catch (error) {
        logger.error(`${agentType} execution failed:`, error);
        throw error;
    }
}
// Import path for compatibility
import * as path from 'path';
//# sourceMappingURL=agent-adapter.js.map