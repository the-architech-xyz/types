/**
 * Path Selector
 *
 * Handles the initial path selection between guided and selective approaches.
 * This is the first step in the question flow.
 */
import { PathOption, ApproachType } from '../../types/questions.js';
export declare class PathSelector {
    /**
     * Present path selection to user
     */
    selectPath(): Promise<ApproachType>;
    /**
     * Get path option details
     */
    getPathOption(approach: ApproachType): PathOption;
    /**
     * Validate path selection
     */
    validatePath(approach: ApproachType): boolean;
}
