/**
 * Shadcn/ui Base Blueprint
 * 
 * Sets up Shadcn/ui with minimal configuration
 * Advanced features are available as separate features
 */

import { Blueprint } from '../../../types/adapter.js';

export const shadcnUiBlueprint: Blueprint = {
  id: 'shadcn-ui-base-setup',
  name: 'Shadcn/ui Base Setup',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npx shadcn@latest init --yes --defaults'
    },
    {
      type: 'RUN_COMMAND',
      command: 'npx shadcn@latest add form'
    },
    {
      type: 'RUN_COMMAND',
      command: 'npx shadcn@latest add input'
    },
    {
      type: 'RUN_COMMAND',
      command: 'npx shadcn@latest add card'
    },
    {
      type: 'RUN_COMMAND',
      command: 'npx shadcn@latest add dialog'
    },
    {
      type: 'RUN_COMMAND',
      command: 'npx shadcn@latest add table'
    }
  ]
};