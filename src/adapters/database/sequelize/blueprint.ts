/**
 * Sequelize ORM Blueprint
 * 
 * Sets up Sequelize ORM with basic configuration
 */

import { Blueprint } from '../../../types/adapter.js';

export const sequelizeBlueprint: Blueprint = {
  id: 'sequelize-base-setup',
  name: 'Sequelize Base Setup',
  actions: [
    {
      type: 'INSTALL_PACKAGES',
      packages: ['sequelize', '{{module.parameters.databaseType}}']
    },
    {
      type: 'INSTALL_PACKAGES',
      packages: ['sequelize-cli', '@types/sequelize'],
      isDev: true
    },
    {
      type: 'CREATE_FILE',
      path: '{{paths.database_config}}/sequelize.ts',
      content: `import { Sequelize } from 'sequelize';

// Database configuration
const config = {
  development: {
    username: '{{module.parameters.username}}',
    password: '{{module.parameters.password}}',
    database: '{{module.parameters.databaseName}}_dev',
    host: '{{module.parameters.host}}',
    port: {{module.parameters.port}},
    dialect: '{{module.parameters.databaseType}}',
    logging: {{module.parameters.logging}},
    pool: {{#if module.parameters.pool}}{
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }{{else}}false{{/if}}
  },
  test: {
    username: '{{module.parameters.username}}',
    password: '{{module.parameters.password}}',
    database: '{{module.parameters.databaseName}}_test',
    host: '{{module.parameters.host}}',
    port: {{module.parameters.port}},
    dialect: '{{module.parameters.databaseType}}',
    logging: false,
    pool: false
  },
  production: {
    username: process.env.DB_USERNAME || '{{module.parameters.username}}',
    password: process.env.DB_PASSWORD || '{{module.parameters.password}}',
    database: process.env.DB_NAME || '{{module.parameters.databaseName}}',
    host: process.env.DB_HOST || '{{module.parameters.host}}',
    port: parseInt(process.env.DB_PORT || '{{module.parameters.port}}'),
    dialect: '{{module.parameters.databaseType}}',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(
  config[process.env.NODE_ENV as keyof typeof config] || config.development
);

export { sequelize, config };
export default sequelize;`
    },
    {
      type: 'ADD_CONTENT',
      target: '{{paths.database_config}}/index.ts',
      content: `import sequelize from './config.js';

// Test the connection
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

// Close the connection
export async function closeConnection() {
  try {
    await sequelize.close();
    console.log('✅ Database connection has been closed.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

export { sequelize };
export default sequelize;`
    },
    {
      type: 'ADD_CONTENT',
      target: '.sequelizerc',
      content: `const path = require('path');

module.exports = {
  'config': path.resolve('src', 'lib', 'database', 'config.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};`
    },
    {
      type: 'ADD_CONTENT',
      target: '.env.example',
      strategy: 'append',
      fileType: 'env',
      content: `# Database Configuration
DB_HOST={{module.parameters.host}}
DB_PORT={{module.parameters.port}}
DB_USERNAME={{module.parameters.username}}
DB_PASSWORD={{module.parameters.password}}
DB_NAME={{module.parameters.databaseName}}

# Sequelize Configuration
DB_LOGGING={{module.parameters.logging}}
DB_POOL={{module.parameters.pool}}

# Add your environment variables here`
    }
  ]
};
