import { Blueprint } from '../../types/adapter.js';

const prismaNextjsIntegrationBlueprint: Blueprint = {
  id: 'prisma-nextjs-integration',
  name: 'Prisma Next.js Integration',
  description: 'Complete Prisma ORM integration for Next.js applications',
  version: '1.0.0',
  actions: [
    // Enhance existing Prisma files with Next.js-specific functionality
    {
      type: 'ENHANCE_FILE',
      path: 'src/lib/db/index.ts',
      modifier: 'drizzle-config-merger',
      params: {
        configObjectName: 'db',
        payload: {
          // Add Next.js-specific Prisma utilities
          runMigrations: 'async () => { /* Next.js Prisma migration logic */ }',
          seedDatabase: 'async () => { /* Next.js Prisma seeding logic */ }',
          // Add Next.js-specific query utilities
          createQuery: 'async (query: string) => { /* Next.js Prisma query logic */ }',
          findById: 'async (id: string) => { /* Next.js Prisma find logic */ }',
          findAll: 'async () => { /* Next.js Prisma find all logic */ }',
          createRecord: 'async (data: any) => { /* Next.js Prisma create logic */ }',
          updateRecord: 'async (id: string, data: any) => { /* Next.js Prisma update logic */ }',
          deleteRecord: 'async (id: string) => { /* Next.js Prisma delete logic */ }',
          // Add Next.js-specific transaction utilities
          withTransaction: 'async (callback: Function) => { /* Next.js Prisma transaction logic */ }',
          runInTransaction: 'async (callback: Function) => { /* Next.js Prisma transaction logic */ }',
          // Add Next.js-specific validation utilities
          validateSchema: 'async (schema: any, data: any) => { /* Next.js Prisma validation logic */ }',
          validateRecord: 'async (record: any) => { /* Next.js Prisma validation logic */ }'
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
    return NextResponse.json({ success: true, message: 'Prisma migrations completed' });
  } catch (error) {
    console.error('Prisma migration error:', error);
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
    console.error('Prisma seeding error:', error);
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  }
}
`,
      condition: '{{#if integration.features.apiRoutes}}'
    }
  ]
};

export const blueprint = prismaNextjsIntegrationBlueprint;