/**
 * Mongoose Plugin Index
 *
 * Exports all Mongoose plugin components.
 */
export { MongoosePlugin } from './mongoose.plugin.js';
export type { MongooseConfig } from './MongooseSchema.js';
export { MongooseConfigSchema, MongooseDefaultConfig } from './MongooseSchema.js';
export { MongooseGenerator } from './MongooseGenerator.js';
import { MongoosePlugin } from './mongoose.plugin.js';
export default MongoosePlugin;
