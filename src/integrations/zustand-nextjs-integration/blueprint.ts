import { Blueprint } from '../../types/adapter.js';

const zustandNextjsIntegrationBlueprint: Blueprint = {
  id: 'zustand-nextjs-integration',
  name: 'Zustand Next.js Integration',
  description: 'Complete state management integration for Next.js applications',
  version: '1.0.0',
  actions: [
    // Enhance existing Zustand files with Next.js-specific functionality
    {
      type: 'ENHANCE_FILE',
      path: 'src/lib/stores/index.ts',
      modifier: 'drizzle-config-merger',
      params: {
        configObjectName: 'stores',
        payload: {
          // Add Next.js-specific Zustand utilities
          useAuthStore: '() => { /* Next.js auth store logic */ }',
          useUIStore: '() => { /* Next.js UI store logic */ }',
          useThemeStore: '() => { /* Next.js theme store logic */ }',
          useNotificationStore: '() => { /* Next.js notification store logic */ }',
          // Add Next.js-specific store utilities
          createStore: '(initialState: any) => { /* Next.js store creation logic */ }',
          withPersistence: '(store: any) => { /* Next.js persistence logic */ }',
          withDevtools: '(store: any) => { /* Next.js devtools logic */ }',
          // Add Next.js-specific SSR utilities
          initializeStores: 'async () => { /* Next.js store initialization logic */ }',
          getServerState: '() => { /* Next.js server state logic */ }'
        }
      },
      condition: '{{#if integration.features.authStore}}'
    },

    // Add Next.js-specific store files
    {
      type: 'CREATE_FILE',
      path: 'src/lib/stores/ssr.ts',
      content: `import { create } from 'zustand';

// Next.js SSR utilities for Zustand
export async function initializeStores() {
  // Initialize stores on the server side
  console.log('Initializing Zustand stores for SSR');
}

export function getServerState() {
  // Get server-side state for hydration
  return {};
}
`,
      condition: '{{#if integration.features.ssr}}'
    },

    {
      type: 'CREATE_FILE',
      path: 'src/lib/stores/hydration.ts',
      content: `'use client';

import { useEffect, useState } from 'react';

// Next.js hydration utilities for Zustand
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
`,
      condition: '{{#if integration.features.hydration}}'
    }
  ]
};

export const blueprint = zustandNextjsIntegrationBlueprint;