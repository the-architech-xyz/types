/**
 * Simple Database Blueprint
 * 
 * Creates database files without npm install
 */

import { Blueprint } from '../../../types/adapter.js';

export const simpleDbBlueprint: Blueprint = {
  id: 'simple-db-setup',
  name: 'Simple Database Setup',
  actions: [
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/db/index.ts',
      content: `// Simple database setup
export const db = {
  connect: () => console.log('Database connected'),
  query: (sql: string) => console.log('Executing:', sql)
};`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/db/schema.ts',
      content: `// Database schema
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}`
    }
  ]
};
