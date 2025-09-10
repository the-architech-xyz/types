/**
 * Blueprint Analyzer Service
 * 
 * Analyzes blueprints to determine execution strategy and complexity.
 * This service is the foundation for intelligent blueprint execution
 * and future AI-powered analysis capabilities.
 */

import { Blueprint } from '../../../types/adapter.js';

export interface BlueprintAnalysis {
  needsVFS: boolean;
  reasons: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  actionTypes: string[];
  vfsRequiredActions: string[];
}

export class BlueprintAnalyzer {
  private static readonly VFS_REQUIRED_ACTIONS = [
    'ENHANCE_FILE',
    'MERGE_JSON', 
    'ADD_TS_IMPORT',
    'APPEND_TO_FILE',
    'PREPEND_TO_FILE',
    'WRAP_CONFIG',
    'EXTEND_SCHEMA'
  ];

  private static readonly SIMPLE_ACTIONS = [
    'CREATE_FILE',
    'RUN_COMMAND',
    'INSTALL_PACKAGES',
    'ADD_SCRIPT',
    'ADD_ENV_VAR'
  ];

  /**
   * Analyze a blueprint to determine execution strategy
   */
  analyze(blueprint: Blueprint): BlueprintAnalysis {
    const actionTypes = blueprint.actions.map(action => action.type);
    const vfsRequiredActions = actionTypes.filter(type => 
      BlueprintAnalyzer.VFS_REQUIRED_ACTIONS.includes(type)
    );
    
    const needsVFS = vfsRequiredActions.length > 0;
    
    let complexity: 'simple' | 'moderate' | 'complex';
    if (needsVFS) {
      complexity = vfsRequiredActions.length > 3 ? 'complex' : 'moderate';
    } else {
      complexity = 'simple';
    }

    const reasons = this.generateReasons(needsVFS, vfsRequiredActions, actionTypes);

    return {
      needsVFS,
      reasons,
      complexity,
      actionTypes,
      vfsRequiredActions
    };
  }

  /**
   * Generate human-readable reasons for the analysis
   */
  private generateReasons(
    needsVFS: boolean, 
    vfsRequiredActions: string[], 
    allActionTypes: string[]
  ): string[] {
    const reasons: string[] = [];

    if (needsVFS) {
      reasons.push(`Contains ${vfsRequiredActions.length} file modification action(s): ${vfsRequiredActions.join(', ')}`);
      reasons.push('Requires transactional VFS for safe file operations');
    } else {
      reasons.push('Only contains simple operations: ' + allActionTypes.join(', '));
      reasons.push('Can execute directly to disk for optimal performance');
    }

    return reasons;
  }

  /**
   * Check if a specific action type requires VFS
   */
  static requiresVFS(actionType: string): boolean {
    return BlueprintAnalyzer.VFS_REQUIRED_ACTIONS.includes(actionType);
  }

  /**
   * Get all VFS-required action types
   */
  static getVFSRequiredActions(): string[] {
    return [...BlueprintAnalyzer.VFS_REQUIRED_ACTIONS];
  }

  /**
   * Get all simple action types
   */
  static getSimpleActions(): string[] {
    return [...BlueprintAnalyzer.SIMPLE_ACTIONS];
  }
}
