/**
 * Framework Agent - Framework Orchestrator
 *
 * Handles framework selection and installation (Next.js, React, Vue, etc.).
 * This agent is responsible for setting up the core application framework.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability } from '../types/agents.js';
export declare class FrameworkAgent extends AbstractAgent {
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private determineFrameworkType;
    private executeFrameworkPlugin;
}
