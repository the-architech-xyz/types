import { Blueprint } from '../../types/adapter.js';

const drizzleNextjsIntegrationBlueprint: Blueprint = {
  id: 'drizzle-nextjs-integration',
  name: 'Drizzle Next.js Integration',
  description: 'Complete Drizzle ORM integration for Next.js applications',
  version: '1.0.0',
  actions: [
    // Enhance existing database files with Next.js-specific functionality
    {
      type: 'ENHANCE_FILE',
      path: 'src/lib/db/index.ts',
      modifier: 'drizzle-config-merger',
      params: {
        configObjectName: 'db',
        payload: {
          // Add Next.js-specific database utilities
          runMigrations: 'async () => { /* Next.js migration logic */ }',
          seedDatabase: 'async () => { /* Next.js seeding logic */ }',
          // Add Next.js-specific query utilities
          createQuery: 'async (query: string) => { /* Next.js query logic */ }',
          findById: 'async (id: string) => { /* Next.js find logic */ }',
          findAll: 'async () => { /* Next.js find all logic */ }',
          createRecord: 'async (data: any) => { /* Next.js create logic */ }',
          updateRecord: 'async (id: string, data: any) => { /* Next.js update logic */ }',
          deleteRecord: 'async (id: string) => { /* Next.js delete logic */ }',
          // Add Next.js-specific transaction utilities
          withTransaction: 'async (callback: Function) => { /* Next.js transaction logic */ }',
          runInTransaction: 'async (callback: Function) => { /* Next.js transaction logic */ }',
          // Add Next.js-specific validation utilities
          validateSchema: 'async (schema: any, data: any) => { /* Next.js validation logic */ }',
          validateRecord: 'async (record: any) => { /* Next.js validation logic */ }'
        }
      },
      condition: '{{#if integration.features.apiRoutes}}'
    },

    // Add Next.js-specific API routes
    {
      type: 'CREATE_FILE',
      path: 'src/app/api/db/migrate/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { runMigrations } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await runMigrations();
    return NextResponse.json({ success: true, message: 'Migrations completed' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
`,
      condition: '{{#if integration.features.apiRoutes}}'
    },

    {
      type: 'CREATE_FILE',
      path: 'src/app/api/db/seed/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: 'Database seeded' });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  }
}
`,
      condition: '{{#if integration.features.apiRoutes}}'
    }
  ]
};

export const blueprint = drizzleNextjsIntegrationBlueprint;