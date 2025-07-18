/**
 * Logger Implementation
 *
 * Provides structured logging for agents with different verbosity levels
 * and context-aware formatting.
 */
import { Logger, LogLevel, LogContext } from '../types/agent.js';
export declare class AgentLogger implements Logger {
    private verbose;
    private agentName?;
    constructor(verbose?: boolean, agentName?: string);
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: Error, data?: any): void;
    debug(message: string, data?: any): void;
    success(message: string, data?: any): void;
    log(level: LogLevel, message: string, context?: LogContext): void;
    private formatMessage;
    logStep(step: string, message: string, data?: any): void;
    logProgress(current: number, total: number, message: string): void;
    logArtifact(type: string, path: string): void;
    logDependency(name: string, version?: string): void;
}
