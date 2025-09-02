/**
 * Shadcn/ui Blueprint
 * 
 * Sets up Shadcn/ui components with CLI-first approach
 */

import { Blueprint } from '../../../types/adapter.js';

export const shadcnUiBlueprint: Blueprint = {
  id: 'shadcn-ui-setup',
  name: 'Shadcn/ui Setup',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npx shadcn@latest init --yes --defaults'
    },
    {
      type: 'RUN_COMMAND',
      command: 'npx shadcn@latest add button input card dialog'
    }
  ]
};