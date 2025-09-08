/**
 * Better Auth Next.js API Routes Integration Feature
 * 
 * Provides Next.js API routes for Better Auth authentication
 * Connects the agnostic Better Auth adapter with Next.js framework
 */

import { Blueprint } from '../../types/adapter.js';

export const betterAuthNextjsApiRoutesBlueprint: Blueprint = {
  id: 'better-auth-nextjs-api-routes',
  name: 'Better Auth Next.js API Routes',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npm install better-auth/next-js'
    },
    {
      type: 'CREATE_FILE',
      path: 'src/app/api/auth/[...all]/route.ts',
      content: `import { toNextJsHandler } from "better-auth/next-js";
import { authHandler } from "@/lib/auth/api";

export const { GET, POST } = toNextJsHandler(authHandler);`
    }
  ]
};
