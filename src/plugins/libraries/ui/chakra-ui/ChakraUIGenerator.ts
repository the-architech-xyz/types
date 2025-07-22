/**
 * Chakra UI Code Generator
 * 
 * Handles all code generation for Chakra UI design system integration.
 * Based on: https://chakra-ui.com/getting-started
 */

import { ChakraUIConfig } from './ChakraUISchema.js';

export class ChakraUIGenerator {
  
  static generateThemeConfig(config: ChakraUIConfig): string {
    const colorMode = config.colorMode || 'light';
    const enableColorMode = config.enableColorMode !== false;
    const enableCustomTheme = config.enableCustomTheme || false;
    
    return `import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: '${colorMode}',
  useSystemColorMode: ${colorMode === 'system'},
};

${enableCustomTheme ? `
// Custom theme configuration
const customTheme = {
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C7',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
};

export const theme = extendTheme(customTheme, config);` : `
export const theme = extendTheme(config);`}

export default theme;
`;
  }

  static generateProviderSetup(config: ChakraUIConfig): string {
    const enableSSR = config.enableSSR !== false;
    const enableColorMode = config.enableColorMode !== false;
    const enableRTL = config.enableRTL || false;
    
    return `import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './theme';

interface ChakraProviderProps {
  children: React.ReactNode;
}

export function ChakraUIProvider({ children }: ChakraProviderProps) {
  return (
    <>
      ${enableColorMode ? `<ColorModeScript initialColorMode={theme.config.initialColorMode} />` : ''}
      <ChakraProvider 
        theme={theme}
        ${enableSSR ? 'ssr={true}' : ''}
        ${enableRTL ? 'direction="rtl"' : ''}
      >
        {children}
      </ChakraProvider>
    </>
  );
}

export default ChakraUIProvider;
`;
  }

  static generateComponentExamples(config: ChakraUIConfig): string {
    const components = config.components || ['Button', 'Box', 'Text', 'Heading', 'Stack', 'HStack', 'VStack', 'Input', 'FormControl'];
    
    return `import React from 'react';
${components.includes('Button') ? `import { Button, ButtonGroup } from '@chakra-ui/react';` : ''}
${components.includes('Box') ? `import { Box } from '@chakra-ui/react';` : ''}
${components.includes('Text') ? `import { Text } from '@chakra-ui/react';` : ''}
${components.includes('Heading') ? `import { Heading } from '@chakra-ui/react';` : ''}
${components.includes('Stack') || components.includes('HStack') || components.includes('VStack') ? `import { Stack, HStack, VStack } from '@chakra-ui/react';` : ''}
${components.includes('Input') ? `import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';` : ''}
${components.includes('FormControl') ? `import { FormControl, FormLabel, FormHelperText, FormErrorMessage } from '@chakra-ui/react';` : ''}

// Example components using Chakra UI
export function ExampleButton() {
  return (
    <Button colorScheme="blue" size="lg">
      Click me
    </Button>
  );
}

export function ExampleLayout() {
  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Welcome to Chakra UI</Heading>
        <Text fontSize="lg" color="gray.600">
          This is an example of Chakra UI components in action.
        </Text>
        <HStack spacing={4}>
          <Button colorScheme="blue">Primary</Button>
          <Button variant="outline">Secondary</Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export function ExampleForm() {
  return (
    <VStack spacing={4} align="stretch" maxW="400px">
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input type="email" placeholder="Enter your email" />
        <FormHelperText>We'll never share your email.</FormHelperText>
      </FormControl>
      
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input type="password" placeholder="Enter your password" />
      </FormControl>
      
      <Button colorScheme="blue" type="submit">
        Submit
      </Button>
    </VStack>
  );
}

export function ExampleCard() {
  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={6}
      bg="white"
      shadow="md"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md">Card Title</Heading>
        <Text color="gray.600">
          This is a simple card component built with Chakra UI.
        </Text>
        <HStack spacing={2}>
          <Button size="sm" colorScheme="blue">
            Action 1
          </Button>
          <Button size="sm" variant="outline">
            Action 2
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
`;
  }

  static generateUnifiedIndex(): string {
    return `/**
 * Unified UI Interface - Chakra UI Implementation
 * 
 * This file provides a unified interface for UI components
 * that works with Chakra UI. It abstracts away Chakra UI-specific
 * details and provides a clean API for UI operations.
 * 
 * Based on: https://chakra-ui.com/getting-started
 */

// ============================================================================
// CORE UI EXPORTS
// ============================================================================

export { default as theme } from './theme.js';
export { ChakraUIProvider } from './provider.js';

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { 
  ExampleButton, 
  ExampleLayout, 
  ExampleForm, 
  ExampleCard 
} from './components.js';

// ============================================================================
// CHAKRA UI RE-EXPORTS
// ============================================================================

// Layout components
export { 
  Box, 
  Container, 
  Flex, 
  Grid, 
  Stack, 
  HStack, 
  VStack,
  SimpleGrid,
  Wrap,
  WrapItem
} from '@chakra-ui/react';

// Typography components
export { 
  Text, 
  Heading, 
  Link, 
  List, 
  ListItem, 
  OrderedList, 
  UnorderedList 
} from '@chakra-ui/react';

// Form components
export { 
  Button, 
  ButtonGroup, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  InputRightElement,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Select,
  Textarea,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from '@chakra-ui/react';

// Feedback components
export { 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription, 
  Toast,
  useToast,
  Progress,
  Spinner,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';

// Overlay components
export { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton
} from '@chakra-ui/react';

// Navigation components
export { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuItemOption, 
  MenuGroup, 
  MenuOptionGroup, 
  MenuDivider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';

// Data display components
export { 
  Table, 
  Thead, 
  Tbody, 
  Tfoot, 
  Tr, 
  Th, 
  Td, 
  TableCaption, 
  TableContainer,
  Badge,
  Code,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup
} from '@chakra-ui/react';

// Media components
export { 
  Image, 
  Avatar, 
  AvatarBadge, 
  AvatarGroup, 
  Icon 
} from '@chakra-ui/react';

// ============================================================================
// HOOKS AND UTILITIES
// ============================================================================

export { 
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useToast,
  useClipboard,
  useBoolean,
  useCounter,
  useNumberInput,
  useRadioGroup,
  useCheckboxGroup,
  useSlider,
  useEditable,
  useOutsideClick,
  usePrefersReducedMotion,
  useUpdateEffect,
  useInterval,
  useTimeout,
  useLocalStorage,
  useSessionStorage
} from '@chakra-ui/react';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  theme,
  ChakraUIProvider,
  ExampleButton,
  ExampleLayout,
  ExampleForm,
  ExampleCard
};
`;
  }

  static generateEnvConfig(config: ChakraUIConfig): string {
    return `# Chakra UI Configuration
CHAKRA_UI_THEME="${config.theme || 'default'}"
CHAKRA_UI_COLOR_MODE="${config.colorMode || 'light'}"
CHAKRA_UI_ENABLE_COLOR_MODE="${config.enableColorMode !== false ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_SSR="${config.enableSSR !== false ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_EMOTION="${config.enableEmotion !== false ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_ICONS="${config.enableIcons !== false ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_ANIMATIONS="${config.enableAnimations !== false ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_RTL="${config.enableRTL ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_TYPESCRIPT="${config.enableTypeScript !== false ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_REACT="${config.enableReact !== false ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_NEXTJS="${config.enableNextJS ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_CUSTOM_THEME="${config.enableCustomTheme ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_THEME_TOKENS="${config.enableThemeTokens !== false ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_RESPONSIVE_DESIGN="${config.enableResponsiveDesign !== false ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_ACCESSIBILITY="${config.enableAccessibility !== false ? 'true' : 'false'}"
CHAKRA_UI_ENABLE_PERFORMANCE="${config.enablePerformance !== false ? 'true' : 'false'}"
`;
  }

  static generatePackageJson(config: ChakraUIConfig): string {
    const dependencies = ['@chakra-ui/react'];
    const devDependencies = ['@types/react', '@types/react-dom'];
    
    if (config.enableEmotion !== false) {
      dependencies.push('@emotion/react', '@emotion/styled');
    }
    
    if (config.enableIcons !== false) {
      dependencies.push('@chakra-ui/icons');
    }
    
    if (config.enableNextJS) {
      dependencies.push('@chakra-ui/next-js');
    }
    
    if (config.enableTypeScript !== false) {
      devDependencies.push('typescript');
    }
    
    return JSON.stringify({
      dependencies: dependencies.reduce((acc, dep) => {
        acc[dep] = '^2.8.0';
        return acc;
      }, {} as Record<string, string>),
      devDependencies: devDependencies.reduce((acc, dep) => {
        acc[dep] = '^18.0.0';
        return acc;
      }, {} as Record<string, string>)
    }, null, 2);
  }
} 