/**
 * Path Selector
 *
 * Handles the initial path selection between guided and selective approaches.
 * This is the first step in the question flow.
 */
import { PATH_OPTIONS } from '../../types/questions.js';
import inquirer from 'inquirer';
export class PathSelector {
    /**
     * Present path selection to user
     */
    async selectPath() {
        const { approach } = await inquirer.prompt([
            {
                type: 'list',
                name: 'approach',
                message: 'How would you like to set up your project?',
                choices: PATH_OPTIONS.map(option => ({
                    name: `${option.name}${option.recommended ? ' (Recommended)' : ''}`,
                    value: option.id,
                    description: option.description
                })),
                default: 'guided'
            }
        ]);
        return approach;
    }
    /**
     * Get path option details
     */
    getPathOption(approach) {
        return PATH_OPTIONS.find(option => option.id === approach);
    }
    /**
     * Validate path selection
     */
    validatePath(approach) {
        return PATH_OPTIONS.some(option => option.id === approach);
    }
}
//# sourceMappingURL=path-selector.js.map