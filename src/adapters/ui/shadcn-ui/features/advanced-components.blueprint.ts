import { Blueprint } from '../../../../types/adapter.js';

const advancedComponentsBlueprint: Blueprint = {
  id: "shadcn-ui-advanced-components",
  name: "Shadcn/ui Advanced Components",
  actions: [
    {
      type: "ADD_CONTENT",
      target: "src/lib/ui/component-registry.ts",
      content: "// Component registry and utilities"
    }
  ]
};
export default advancedComponentsBlueprint;
