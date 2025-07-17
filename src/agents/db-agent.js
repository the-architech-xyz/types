/**
 * DB Agent - Database Package Generator
 * 
 * Sets up the packages/db database layer with:
 * - Drizzle ORM configuration
 * - Neon PostgreSQL integration
 * - Database schema definitions
 * - Migration scripts and utilities
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import fsExtra from 'fs-extra';
import path from 'path';

const { writeFile, writeJSON, ensureDir } = fsExtra;

export class DBAgent {
  async execute(config, runner) {
    const spinner = ora({
      text: chalk.blue('🗄️  Setting up database package with Drizzle ORM...'),
      color: 'blue'
    }).start();

    try {
      const projectPath = path.resolve(process.cwd(), config.projectName);
      const dbPackagePath = path.join(projectPath, 'packages', 'db');
      
      // Pause spinner for user input
      spinner.stop();
      
      // Get database configuration
      const dbConfig = await this.getDatabaseConfig(config);
      
      // Resume spinner
      spinner.start();
      
      // Update package.json with dependencies
      await this.updatePackageJson(dbPackagePath, config);
      
      // Create Drizzle configuration
      await this.createDrizzleConfig(dbPackagePath, dbConfig);
      
      // Create database schema
      await this.createDatabaseSchema(dbPackagePath);
      
      // Create database connection
      await this.createDatabaseConnection(dbPackagePath);
      
      // Create migration utilities
      await this.createMigrationUtils(dbPackagePath);
      
      // Create environment configuration
      await this.createEnvConfig(projectPath, dbConfig);
      
      spinner.succeed(chalk.green('✅ Database package configured'));
      
      // Display next steps
      this.displayDatabaseSetupInstructions(dbConfig);
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to configure database package'));
      throw error;
    }
  }

  async getDatabaseConfig(config) {
    if (config.useDefaults) {
      return {
        provider: 'neon',
        connectionString: 'NEON_DATABASE_URL_PLACEHOLDER'
      };
    }

    console.log(chalk.blue.bold('\n🗄️  Database Configuration\n'));
    
    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: chalk.yellow('Choose your database provider:'),
        choices: [
          { name: 'Neon PostgreSQL (Recommended - Serverless)', value: 'neon' },
          { name: 'Local PostgreSQL', value: 'local' },
          { name: 'Vercel Postgres', value: 'vercel' }
        ],
        default: 'neon'
      }
    ]);

    let connectionString = '';
    
    if (provider === 'neon') {
      console.log(chalk.cyan('\n📋 To set up Neon PostgreSQL:'));
      console.log(chalk.gray('1. Go to https://neon.tech'));
      console.log(chalk.gray('2. Create a new project'));
      console.log(chalk.gray('3. Copy your connection string'));
      console.log(chalk.gray('4. Paste it below (or leave empty to configure later)\n'));
      
      const { neonUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'neonUrl',
          message: chalk.yellow('Neon connection string (optional):'),
          validate: (input) => {
            if (!input) return true;
            if (!input.startsWith('postgresql://')) {
              return 'Connection string should start with postgresql://';
            }
            return true;
          }
        }
      ]);
      
      connectionString = neonUrl || 'NEON_DATABASE_URL_PLACEHOLDER';
    } else if (provider === 'local') {
      connectionString = 'postgresql://localhost:5432/myapp';
    } else if (provider === 'vercel') {
      connectionString = 'POSTGRES_URL_PLACEHOLDER';
    }

    return { provider, connectionString };
  }

  async updatePackageJson(dbPackagePath, config) {
    const packageJson = {
      name: `@${config.projectName}/db`,
      version: "0.1.0",
      private: true,
      description: "Database layer with Drizzle ORM",
      main: "index.ts",
      types: "index.ts",
      scripts: {
        "build": "tsc",
        "dev": "tsc --watch",
        "lint": "eslint . --ext .ts",
        "type-check": "tsc --noEmit",
        "db:generate": "drizzle-kit generate:pg",
        "db:migrate": "tsx migrate.ts",
        "db:push": "drizzle-kit push:pg",
        "db:studio": "drizzle-kit studio"
      },
      dependencies: {
        "drizzle-orm": "^0.29.0",
        "@neondatabase/serverless": "^0.6.0",
        "postgres": "^3.4.3"
      },
      devDependencies: {
        "drizzle-kit": "^0.20.4",
        "tsx": "^4.1.0",
        "@types/postgres": "^3.0.0",
        "typescript": "^5.2.2",
        "dotenv": "^16.3.1"
      }
    };

    await writeJSON(path.join(dbPackagePath, 'package.json'), packageJson, { spaces: 2 });
  }

  async createDrizzleConfig(dbPackagePath, dbConfig) {
    const drizzleConfig = `import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../../.env.local" });

export default {
  schema: "./schema/*",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "${dbConfig.connectionString}",
  },
  verbose: true,
  strict: true,
} satisfies Config;`;

    await writeFile(path.join(dbPackagePath, 'drizzle.config.ts'), drizzleConfig);
  }

  async createDatabaseSchema(dbPackagePath) {
    await ensureDir(path.join(dbPackagePath, 'schema'));
    
    // Create example users table schema
    const usersSchema = `import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;`;

    await writeFile(path.join(dbPackagePath, 'schema', 'users.ts'), usersSchema);

    // Create main schema index
    const schemaIndex = `export * from "./users";

// Import all your schema files here
// export * from "./posts";
// export * from "./comments";`;

    await writeFile(path.join(dbPackagePath, 'schema', 'index.ts'), schemaIndex);
  }

  async createDatabaseConnection(dbPackagePath) {
    const connectionFile = `import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please add it to your .env.local file."
  );
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export * from "./schema";`;

    await writeFile(path.join(dbPackagePath, 'index.ts'), connectionFile);
  }

  async createMigrationUtils(dbPackagePath) {
    await ensureDir(path.join(dbPackagePath, 'migrations'));
    
    const migrateScript = `import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "./index";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../../.env.local" });

async function main() {
  console.log("🗄️ Running migrations...");
  
  try {
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();`;

    await writeFile(path.join(dbPackagePath, 'migrate.ts'), migrateScript);

    // Create a seed script
    const seedScript = `import { db } from "./index";
import { users } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Insert sample data
    await db.insert(users).values([
      {
        name: "John Doe",
        email: "john@example.com",
        image: "https://avatars.githubusercontent.com/u/1?v=4",
      },
      {
        name: "Jane Smith", 
        email: "jane@example.com",
        image: "https://avatars.githubusercontent.com/u/2?v=4",
      },
    ]);

    console.log("✅ Database seeded successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();`;

    await writeFile(path.join(dbPackagePath, 'seed.ts'), seedScript);
  }

  async createEnvConfig(projectPath, dbConfig) {
    const envExample = `# Database Configuration
DATABASE_URL="${dbConfig.connectionString}"

# Note: Copy this file to .env.local and update with your actual values
# Never commit .env.local to version control`;

    await writeFile(path.join(projectPath, '.env.example'), envExample);

    if (dbConfig.connectionString !== 'NEON_DATABASE_URL_PLACEHOLDER' && 
        dbConfig.connectionString !== 'POSTGRES_URL_PLACEHOLDER') {
      const envLocal = `# Database Configuration
DATABASE_URL="${dbConfig.connectionString}"`;

      await writeFile(path.join(projectPath, '.env.local'), envLocal);
    }
  }

  displayDatabaseSetupInstructions(dbConfig) {
    console.log(chalk.blue.bold('\n🗄️  DATABASE SETUP INSTRUCTIONS'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (dbConfig.provider === 'neon') {
      if (dbConfig.connectionString.includes('PLACEHOLDER')) {
        console.log(chalk.yellow('📋 Complete your Neon setup:'));
        console.log(chalk.gray('1. Visit https://neon.tech and create a project'));
        console.log(chalk.gray('2. Copy your connection string'));
        console.log(chalk.gray('3. Update DATABASE_URL in .env.local'));
      } else {
        console.log(chalk.green('✅ Neon PostgreSQL configured'));
      }
    }
    
    console.log(chalk.yellow('\n🔧 Next steps:'));
    console.log(chalk.gray('1. cd packages/db'));
    console.log(chalk.gray('2. npm run db:generate  # Generate migrations'));
    console.log(chalk.gray('3. npm run db:migrate   # Run migrations'));
    console.log(chalk.gray('4. npm run db:studio    # Open Drizzle Studio'));
    
    console.log(chalk.blue.bold('\n💡 Database Features:'));
    console.log(chalk.green('✅ Drizzle ORM with TypeScript'));
    console.log(chalk.green('✅ Automatic migrations'));
    console.log(chalk.green('✅ Type-safe database queries'));
    console.log(chalk.green('✅ Database branching (Neon)'));
    console.log(chalk.green('✅ Visual database studio'));
  }
} 