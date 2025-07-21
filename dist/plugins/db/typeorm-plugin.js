/**
 * TypeORM Plugin - Pure Technology Implementation
 *
 * Provides TypeORM ORM integration using the latest v0.3.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../core/templates/template-service.js';
import { CommandRunner } from '../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService } from '../../core/project/structure-service.js';
export class TypeORMPlugin {
    templateService;
    runner;
    constructor() {
        this.templateService = templateService;
        this.runner = new CommandRunner();
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'typeorm',
            name: 'TypeORM',
            version: '1.0.0',
            description: 'TypeScript ORM for Node.js with excellent TypeScript support',
            author: 'The Architech Team',
            category: PluginCategory.ORM,
            tags: ['database', 'orm', 'typescript', 'sql', 'migrations'],
            license: 'MIT',
            repository: 'https://github.com/typeorm/typeorm',
            homepage: 'https://typeorm.io'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectPath, pluginConfig } = context;
            context.logger.info('Installing TypeORM ORM...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Create TypeORM configuration
            await this.createTypeORMConfig(context);
            // Step 3: Create database structure
            await this.createDatabaseStructure(context);
            // Step 4: Create package exports
            await this.createPackageExports(context);
            // Step 5: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'database', 'index.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'database', 'connection.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'entities', 'user.entity.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'entities', 'base.entity.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'repositories', 'user.repository.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'migrations', 'initial.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'typeorm.config.ts')
                    }
                ],
                dependencies: [
                    {
                        name: 'typeorm',
                        version: '^0.3.20',
                        type: 'production',
                        category: PluginCategory.ORM
                    },
                    {
                        name: 'reflect-metadata',
                        version: '^0.2.1',
                        type: 'production',
                        category: PluginCategory.ORM
                    },
                    {
                        name: 'pg',
                        version: '^8.11.0',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    },
                    {
                        name: '@types/pg',
                        version: '^8.10.0',
                        type: 'development',
                        category: PluginCategory.DATABASE
                    },
                    {
                        name: 'typeorm-naming-strategies',
                        version: '^4.2.0',
                        type: 'production',
                        category: PluginCategory.ORM
                    }
                ],
                scripts: [
                    {
                        name: 'typeorm',
                        command: 'typeorm-ts-node-commonjs',
                        description: 'Run TypeORM CLI commands',
                        category: 'dev'
                    },
                    {
                        name: 'db:migrate',
                        command: 'npm run typeorm migration:run -- -d typeorm.config.ts',
                        description: 'Run database migrations',
                        category: 'dev'
                    },
                    {
                        name: 'db:generate',
                        command: 'npm run typeorm migration:generate -- -d typeorm.config.ts',
                        description: 'Generate new migration',
                        category: 'dev'
                    },
                    {
                        name: 'db:revert',
                        command: 'npm run typeorm migration:revert -- -d typeorm.config.ts',
                        description: 'Revert last migration',
                        category: 'dev'
                    }
                ],
                configs: [
                    {
                        file: 'typeorm.config.ts',
                        content: this.getTypeORMConfigContent(),
                        mergeStrategy: 'replace'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install TypeORM', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling TypeORM...');
            // Remove TypeORM dependencies
            await this.runner.execCommand(['npm', 'uninstall', 'typeorm', 'reflect-metadata', 'pg', '@types/pg', 'typeorm-naming-strategies'], { cwd: projectPath });
            // Remove configuration files
            const configPath = path.join(projectPath, 'typeorm.config.ts');
            if (await fsExtra.pathExists(configPath)) {
                await fsExtra.remove(configPath);
            }
            // Remove database structure
            const dbPath = path.join(projectPath, 'src', 'lib', 'database');
            if (await fsExtra.pathExists(dbPath)) {
                await fsExtra.remove(dbPath);
            }
            const entitiesPath = path.join(projectPath, 'src', 'entities');
            if (await fsExtra.pathExists(entitiesPath)) {
                await fsExtra.remove(entitiesPath);
            }
            const repositoriesPath = path.join(projectPath, 'src', 'repositories');
            if (await fsExtra.pathExists(repositoriesPath)) {
                await fsExtra.remove(repositoriesPath);
            }
            const migrationsPath = path.join(projectPath, 'src', 'migrations');
            if (await fsExtra.pathExists(migrationsPath)) {
                await fsExtra.remove(migrationsPath);
            }
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall TypeORM', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Updating TypeORM...');
            // Update TypeORM dependencies
            await this.runner.execCommand(['npm', 'update', 'typeorm', 'reflect-metadata', 'pg', '@types/pg', 'typeorm-naming-strategies'], { cwd: projectPath });
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to update TypeORM', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            const { projectPath } = context;
            // Check if package.json exists
            const packageJsonPath = path.join(projectPath, 'package.json');
            if (!await fsExtra.pathExists(packageJsonPath)) {
                errors.push({
                    code: 'MISSING_PACKAGE_JSON',
                    message: 'package.json not found in project directory',
                    severity: 'error'
                });
            }
            // Check if it's a TypeScript project
            const packageJson = await fsExtra.readJson(packageJsonPath);
            if (!packageJson.dependencies?.typescript && !packageJson.devDependencies?.typescript) {
                errors.push({
                    code: 'NOT_TYPESCRIPT_PROJECT',
                    message: 'TypeORM requires a TypeScript project',
                    severity: 'error'
                });
            }
            // Check Node.js version
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion?.slice(1).split('.')[0] || '16');
            if (majorVersion < 16) {
                errors.push({
                    code: 'NODE_VERSION_TOO_OLD',
                    message: 'Node.js 16 or higher is required for TypeORM',
                    severity: 'error'
                });
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            errors.push({
                code: 'VALIDATION_ERROR',
                message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: 'error'
            });
            return {
                valid: false,
                errors,
                warnings
            };
        }
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'express', 'fastify', 'nestjs'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['postgresql', 'mysql', 'sqlite', 'mariadb'],
            uiLibraries: [],
            conflicts: ['drizzle', 'prisma'] // Conflicts with other ORMs
        };
    }
    getDependencies() {
        return ['typescript', '@types/node'];
    }
    getConflicts() {
        return ['drizzle', 'prisma'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'typescript',
                description: 'TypeScript 4.5 or higher',
                version: '^4.5.0'
            },
            {
                type: 'package',
                name: '@types/node',
                description: 'Node.js TypeScript definitions',
                version: '^18.0.0'
            },
            {
                type: 'binary',
                name: 'node',
                description: 'Node.js 16 or higher',
                version: '>=16.0.0'
            }
        ];
    }
    getDefaultConfig() {
        return {
            database: 'postgresql',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '',
            databaseName: 'myapp',
            synchronize: false,
            logging: true,
            migrations: true,
            seeds: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                database: {
                    type: 'string',
                    description: 'Database type to use',
                    default: 'postgresql',
                    enum: ['postgresql', 'mysql', 'sqlite', 'mariadb']
                },
                host: {
                    type: 'string',
                    description: 'Database host',
                    default: 'localhost'
                },
                port: {
                    type: 'number',
                    description: 'Database port',
                    default: 5432
                },
                username: {
                    type: 'string',
                    description: 'Database username',
                    default: 'postgres'
                },
                password: {
                    type: 'string',
                    description: 'Database password',
                    default: ''
                },
                databaseName: {
                    type: 'string',
                    description: 'Database name',
                    default: 'myapp'
                },
                synchronize: {
                    type: 'boolean',
                    description: 'Auto-synchronize database schema',
                    default: false
                },
                logging: {
                    type: 'boolean',
                    description: 'Enable SQL logging',
                    default: true
                },
                migrations: {
                    type: 'boolean',
                    description: 'Enable migrations',
                    default: true
                },
                seeds: {
                    type: 'boolean',
                    description: 'Enable database seeding',
                    default: true
                }
            },
            required: [],
            additionalProperties: false
        };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing TypeORM dependencies...');
        const dependencies = [
            'typeorm@^0.3.20',
            'reflect-metadata@^0.2.1',
            'pg@^8.11.0',
            '@types/pg@^8.10.0',
            'typeorm-naming-strategies@^4.2.0'
        ];
        await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
    }
    async createTypeORMConfig(context) {
        const { projectPath } = context;
        context.logger.info('Creating TypeORM configuration...');
        const configContent = this.getTypeORMConfigContent();
        await fsExtra.writeFile(path.join(projectPath, 'typeorm.config.ts'), configContent);
    }
    async createDatabaseStructure(context) {
        const { projectPath } = context;
        context.logger.info('Creating TypeORM database structure...');
        // Create directories
        const dirs = [
            path.join(projectPath, 'src', 'lib', 'database'),
            path.join(projectPath, 'src', 'entities'),
            path.join(projectPath, 'src', 'repositories'),
            path.join(projectPath, 'src', 'migrations')
        ];
        for (const dir of dirs) {
            await fsExtra.ensureDir(dir);
        }
        // Create base entity
        await this.createBaseEntity(path.join(projectPath, 'src', 'entities'));
        // Create user entity
        await this.createUserEntity(path.join(projectPath, 'src', 'entities'));
        // Create user repository
        await this.createUserRepository(path.join(projectPath, 'src', 'repositories'));
        // Create database connection
        await this.createDatabaseConnection(path.join(projectPath, 'src', 'lib', 'database'));
        // Create initial migration
        await this.createInitialMigration(path.join(projectPath, 'src', 'migrations'));
    }
    async createBaseEntity(entitiesPath) {
        const baseEntityContent = `import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
`;
        await fsExtra.writeFile(path.join(entitiesPath, 'base.entity.ts'), baseEntityContent);
    }
    async createUserEntity(entitiesPath) {
        const userEntityContent = `import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Virtual property for full name
  get fullName(): string {
    return \`\${this.firstName} \${this.lastName}\`;
  }
}
`;
        await fsExtra.writeFile(path.join(entitiesPath, 'user.entity.ts'), userEntityContent);
    }
    async createUserRepository(repositoriesPath) {
        const userRepositoryContent = `import { Repository, EntityRepository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.create(userData);
    return this.save(user);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    await this.update(id, userData);
    return this.findById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.softDelete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async listUsers(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return { users, total };
  }
}
`;
        await fsExtra.writeFile(path.join(repositoriesPath, 'user.repository.ts'), userRepositoryContent);
    }
    async createDatabaseConnection(dbPath) {
        const connectionContent = `import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myapp',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  namingStrategy: {
    tableName: (targetName: string, userSpecifiedName: string) => {
      return userSpecifiedName ? userSpecifiedName : targetName.toLowerCase();
    },
    columnName: (propertyName: string, databaseName: string, embeddedPrefixes: string[]) => {
      return databaseName ? databaseName : propertyName;
    }
  }
});

// Initialize database connection
export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

// Get repository with custom methods
export function getUserRepository(): UserRepository {
  return AppDataSource.getRepository(User) as UserRepository;
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}
`;
        await fsExtra.writeFile(path.join(dbPath, 'connection.ts'), connectionContent);
    }
    async createInitialMigration(migrationsPath) {
        const migrationContent = `import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class Initial1700000000000 implements MigrationInterface {
  name = 'Initial1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'isEmailVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      'users',
      new Index('IDX_users_email', ['email'])
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
`;
        await fsExtra.writeFile(path.join(migrationsPath, '1700000000000-initial.ts'), migrationContent);
    }
    async createPackageExports(context) {
        const { projectPath } = context;
        context.logger.info('Creating package exports...');
        const exportsContent = `// TypeORM Database Components
export { AppDataSource, initializeDatabase, closeDatabase, getUserRepository } from './connection';
export { User } from '../entities/user.entity';
export { UserRepository } from '../repositories/user.repository';
export { BaseEntity } from '../entities/base.entity';

// Re-export TypeORM utilities
export {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  Unique,
  OneToMany,
  ManyToOne,
  OneToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Repository,
  EntityRepository,
  DataSource,
  QueryRunner,
  MigrationInterface,
  Migration
} from 'typeorm';
`;
        await fsExtra.writeFile(path.join(projectPath, 'src', 'lib', 'database', 'exports.ts'), exportsContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        const structure = context.projectStructure;
        // For monorepo projects, generate files directly in the package directory
        // For single app projects, use the structure service to get the correct path
        let unifiedPath;
        if (structure.isMonorepo) {
            // In monorepo, we're already in the package directory (packages/database)
            unifiedPath = projectPath;
        }
        else {
            // In single app, use the structure service to get the correct path
            unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'database');
        }
        await fsExtra.ensureDir(unifiedPath);
        // Create index.ts for the unified interface
        const indexContent = `// TypeORM Unified Interface
// This file provides a unified interface for database operations across different project structures

export * from './connection';
export * from './entities/user.entity';
export * from './repositories/user.repository';
export * from './entities/base.entity';

// Re-export utilities
export * from './exports';
`;
        await fsExtra.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);
        // Create utils.ts for the unified interface
        const utilsContent = `// TypeORM Utilities
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function paginate<T>(
  repository: Repository<T>,
  options: PaginationOptions,
  where?: FindOptionsWhere<T>,
  order?: FindManyOptions<T>['order']
): Promise<PaginatedResult<T>> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await repository.findAndCount({
    where,
    order,
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function formatDate(date: Date): string {
  return date.toISOString();
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}
`;
        await fsExtra.writeFile(path.join(unifiedPath, 'utils.ts'), utilsContent);
    }
    getTypeORMConfigContent() {
        return `import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myapp',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  namingStrategy: {
    tableName: (targetName: string, userSpecifiedName: string) => {
      return userSpecifiedName ? userSpecifiedName : targetName.toLowerCase();
    },
    columnName: (propertyName: string, databaseName: string, embeddedPrefixes: string[]) => {
      return databaseName ? databaseName : propertyName;
    }
  }
});
`;
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        const duration = Date.now() - startTime;
        if (originalError) {
            errors.push({
                code: 'PLUGIN_ERROR',
                message: originalError instanceof Error ? originalError.message : String(originalError),
                severity: 'error',
                details: originalError
            });
        }
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors,
            warnings: [],
            duration
        };
    }
}
//# sourceMappingURL=typeorm-plugin.js.map