/**
 * Agent Adapter - Bridge between old command interface and new agent interface
 *
 * Provides compatibility layer to use new TypeScript agents with existing commands
 * while maintaining the old interface contract.
 */
import { CommandRunner } from './command-runner.js';
import { BaseProjectAgent } from '../agents/base-project-agent.js';
import { UIAgent } from '../agents/ui-agent.js';
import { DBAgent } from '../agents/db-agent.js';
import { AuthAgent } from '../agents/auth-agent.js';
import { BaseArchitechAgent } from '../agents/base-architech-agent.js';
export declare function createAgent(agentType: string, runner: CommandRunner): BaseProjectAgent | UIAgent | DBAgent | AuthAgent | BaseArchitechAgent;
export declare function executeAgentWithOldInterface(agentType: string, config: any, runner: CommandRunner): Promise<void>;
