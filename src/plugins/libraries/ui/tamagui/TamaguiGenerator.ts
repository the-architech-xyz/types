import { TamaguiConfig } from './TamaguiSchema.js';

export class TamaguiGenerator {
  static generateThemeConfig(config: TamaguiConfig): string {
    return `import { createTamagui, createTokens } from 'tamagui';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { themes, tokens } from '@tamagui/themes';

const interFont = createInterFont();

const config = createTamagui({
  fonts: {
    heading: interFont,
    body: interFont,
  },
  themes,
  tokens,
  shorthands,
  defaultTheme: '${config.theme}',
  shouldAddPrefersColorThemes: ${config.enableColorMode},
  animationDriver: ${config.enableAnimations} ? 'react-native' : 'css',
  rtl: ${config.enableRTL},
  cssReset: ${config.enableCSSReset},
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
`;
  }

  static generateProviderSetup(config: TamaguiConfig): string {
    return `import React from 'react';
import { TamaguiProvider } from 'tamagui';
import config from './tamagui.config';

interface TamaguiProviderProps {
  children: React.ReactNode;
}

export const TamaguiProviderWrapper: React.FC<TamaguiProviderProps> = ({ children }) => {
  return (
    <TamaguiProvider config={config} defaultTheme="${config.theme}">
      {children}
    </TamaguiProvider>
  );
};

export default TamaguiProviderWrapper;
`;
  }

  static generateComponentExamples(config: TamaguiConfig): string {
    return `import React from 'react';
import { Button, Card, Input, Text, YStack, XStack } from 'tamagui';

// Button Component
export const ButtonExample: React.FC = () => {
  return (
    <YStack space="$4">
      <Button size="$4" theme="blue">
        Primary Button
      </Button>
      <Button size="$4" variant="outlined" theme="gray">
        Secondary Button
      </Button>
      <Button size="$4" variant="dashed" theme="red">
        Danger Button
      </Button>
    </YStack>
  );
};

// Card Component
export const CardExample: React.FC = () => {
  return (
    <Card size="$4" theme="blue">
      <Card.Header padded>
        <Text>Card Title</Text>
      </Card.Header>
      <Card.Footer padded>
        <XStack space="$2">
          <Button size="$2" theme="blue">
            Action 1
          </Button>
          <Button size="$2" variant="outlined" theme="gray">
            Action 2
          </Button>
        </XStack>
      </Card.Footer>
    </Card>
  );
};

// Input Component
export const InputExample: React.FC = () => {
  return (
    <YStack space="$4">
      <Input placeholder="Enter text..." />
      <Input placeholder="With label" label="Email" />
      <Input placeholder="With error" error="This field is required" />
    </YStack>
  );
};

export default {
  ButtonExample,
  CardExample,
  InputExample,
};
`;
  }

  static generateUnifiedIndex(): string {
    return `// Tamagui Unified Interface
// This file provides a unified interface for UI components across different project structures

export * from './components/button';
export * from './components/card';
export * from './components/input';
export * from './components/text';

// Re-export utilities
export { config as theme } from './tamagui.config';

// Re-export Tamagui components
export {
  Button,
  Card,
  Input,
  Text,
  YStack,
  XStack,
  ZStack,
  HStack,
  VStack,
  Stack,
  Separator,
  Sheet,
  Dialog,
  Popover,
  Tooltip,
  Select,
  Switch,
  Checkbox,
  RadioGroup,
  Slider,
  Progress,
  Spinner,
  Avatar,
  Badge,
  Alert,
  Toast,
  useTheme,
  useMedia,
  useWindowDimensions,
  TamaguiProvider,
  createTamagui,
  createTokens,
  createInterFont,
  shorthands,
  themes,
  tokens
} from 'tamagui';

// Re-export Tamagui icons
export * from '@tamagui/lucide-icons';
`;
  }

  static generateEnvConfig(config: TamaguiConfig): string {
    return `// Tamagui Environment Configuration
export const TAMAGUI_CONFIG = {
  theme: '${config.theme}',
  colorMode: '${config.colorMode}',
  enableAnimations: ${config.enableAnimations},
  enableRTL: ${config.enableRTL},
  enableCSSReset: ${config.enableCSSReset},
  enableColorMode: ${config.enableColorMode},
  enableUniversalComponents: ${config.enableUniversalComponents},
  enableDesignTokens: ${config.enableDesignTokens},
  enableResponsiveDesign: ${config.enableResponsiveDesign},
  enableAccessibility: ${config.enableAccessibility},
  enablePerformanceOptimization: ${config.enablePerformanceOptimization},
  enableTreeShaking: ${config.enableTreeShaking},
  enableHotReload: ${config.enableHotReload},
  enableTypeScript: ${config.enableTypeScript},
  enableStorybook: ${config.enableStorybook},
  enableTesting: ${config.enableTesting},
  enableDocumentation: ${config.enableDocumentation},
  enableExamples: ${config.enableExamples},
  enableTemplates: ${config.enableTemplates},
  enablePlugins: ${config.enablePlugins}
};

export default TAMAGUI_CONFIG;
`;
  }

  static generatePackageJson(config: TamaguiConfig): string {
    return `{
  "dependencies": {
    "tamagui": "^1.74.0",
    "@tamagui/core": "^1.74.0",
    "@tamagui/config": "^1.74.0",
    "@tamagui/themes": "^1.74.0",
    "@tamagui/font-inter": "^1.74.0",
    "@tamagui/shorthands": "^1.74.0",
    "@tamagui/lucide-icons": "^1.74.0",
    "@tamagui/animations-react-native": "^1.74.0",
    "@tamagui/animations-css": "^1.74.0"
  },
  "devDependencies": {
    "@tamagui/babel-plugin": "^1.74.0",
    "@tamagui/vite-plugin": "^1.74.0",
    "@tamagui/next-plugin": "^1.74.0",
    "@tamagui/metro-plugin": "^1.74.0"
  }
}`;
  }
} 