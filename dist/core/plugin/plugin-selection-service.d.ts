/**
 * Plugin Selection Service
 *
 * Handles interactive plugin selection and parameter collection
 * during project generation. This is the bridge between user input
 * and plugin configuration.
 */
import { PluginSystem } from './plugin-system.js';
import { PluginSelection } from '../../types/plugin-selection.js';
export declare class PluginSelectionService {
    private pluginSystem;
    constructor(pluginSystem: PluginSystem);
    selectPlugins(userInput: string): Promise<PluginSelection>;
    private selectDatabase;
    private selectAuthentication;
    private selectUI;
    private selectDeployment;
    private selectTesting;
    private selectEmail;
    private selectMonitoring;
    private selectPayment;
    private selectBlockchain;
    private getDatabaseProvidersForORM;
    private getDatabaseFeaturesForORM;
}
