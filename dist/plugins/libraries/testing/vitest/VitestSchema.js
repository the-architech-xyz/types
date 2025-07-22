import { TestingFramework } from '../../../../types/plugin-interfaces.js';
import { PluginCategory } from '../../../../types/plugin.js';
export class VitestSchema {
    static getParameterSchema() {
        return {
            category: PluginCategory.TESTING,
            groups: [
                { id: 'environment', name: 'Test Environment', description: 'Configure the environment for running tests.', order: 1, parameters: ['environment', 'globals'] },
                { id: 'features', name: 'Features', description: 'Enable additional testing features.', order: 2, parameters: ['coverage', 'ui'] },
                { id: 'advanced', name: 'Advanced Configuration', description: 'Fine-tune the test runner behavior.', order: 3, parameters: ['reporters', 'testTimeout'] },
            ],
            parameters: [
                {
                    id: 'framework',
                    name: 'Testing Framework',
                    type: 'select',
                    description: 'The testing framework to use.',
                    required: true,
                    default: TestingFramework.VITEST,
                    options: [{ value: TestingFramework.VITEST, label: 'Vitest', recommended: true }],
                    group: 'environment'
                },
                {
                    id: 'environment',
                    name: 'Test Environment',
                    type: 'select',
                    description: 'The environment where your tests will be run.',
                    required: true,
                    default: 'jsdom',
                    options: [
                        { value: 'jsdom', label: 'JSDOM', description: 'A browser-like environment for testing web applications.' },
                        { value: 'node', label: 'Node.js', description: 'For testing server-side code.' },
                        { value: 'happy-dom', label: 'Happy DOM', description: 'A faster alternative to JSDOM.' }
                    ],
                    group: 'environment'
                },
                {
                    id: 'globals',
                    name: 'Enable Globals',
                    type: 'boolean',
                    description: 'Automatically import test functions like `describe` and `it` in all test files.',
                    required: true,
                    default: true,
                    group: 'environment'
                },
                {
                    id: 'coverage',
                    name: 'Enable Code Coverage',
                    type: 'boolean',
                    description: 'Generate a report showing how much of your code is covered by tests.',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'ui',
                    name: 'Enable Vitest UI',
                    type: 'boolean',
                    description: 'Use the interactive UI for running and debugging tests.',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'reporters',
                    name: 'Test Reporters',
                    type: 'multiselect',
                    description: 'The format for test run reports.',
                    required: false,
                    default: ['default', 'html'],
                    options: [
                        { value: 'default', label: 'Default' },
                        { value: 'verbose', label: 'Verbose' },
                        { value: 'dot', label: 'Dot' },
                        { value: 'json', label: 'JSON' },
                        { value: 'html', label: 'HTML Report' },
                    ],
                    group: 'advanced'
                },
                {
                    id: 'testTimeout',
                    name: 'Test Timeout (ms)',
                    type: 'number',
                    description: 'The maximum time a single test can run before timing out.',
                    required: true,
                    default: 5000,
                    group: 'advanced'
                }
            ],
            dependencies: [],
            validations: []
        };
    }
}
//# sourceMappingURL=VitestSchema.js.map