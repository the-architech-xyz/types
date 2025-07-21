/**
 * Chakra UI Plugin - Pure Technology Implementation
 * 
 * Provides Chakra UI component library integration using the latest v3.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
import { TemplateService, templateService } from '../../core/templates/template-service.js';
import { CommandRunner } from '../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../core/project/structure-service.js';

export class ChakraUIPlugin implements IPlugin {
  private templateService: TemplateService;
  private runner: CommandRunner;

  constructor() {
    this.templateService = templateService;
    this.runner = new CommandRunner();
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'chakra-ui',
      name: 'Chakra UI',
      version: '1.0.0',
      description: 'Modern, accessible component library for React applications',
      author: 'The Architech Team',
      category: PluginCategory.UI_LIBRARY,
      tags: ['ui', 'components', 'accessible', 'react', 'emotion'],
      license: 'MIT',
      repository: 'https://github.com/chakra-ui/chakra-ui',
      homepage: 'https://chakra-ui.com'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Chakra UI component library...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Create Chakra UI configuration
      await this.createChakraConfig(context);

      // Step 3: Create UI components structure
      await this.createUIComponents(context);

      // Step 4: Create package exports
      await this.createPackageExports(context);

      // Step 5: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'ui', 'index.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'ui', 'theme.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'button.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'card.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'input.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'form.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'modal.tsx')
          }
        ],
        dependencies: [
          {
            name: '@chakra-ui/react',
            version: '^3.0.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@chakra-ui/next-js',
            version: '^3.0.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@emotion/react',
            version: '^11.11.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@emotion/styled',
            version: '^11.11.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: 'framer-motion',
            version: '^11.0.0',
            type: 'production',
            category: PluginCategory.ANIMATION
          }
        ],
        scripts: [
          {
            name: 'storybook',
            command: 'storybook dev -p 6006',
            description: 'Start Storybook for component development',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: 'chakra.config.ts',
            content: this.getChakraConfigContent(),
            mergeStrategy: 'replace'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to install Chakra UI',
        startTime,
        [],
        error
      );
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Uninstalling Chakra UI...');

      // Remove Chakra UI dependencies
      await this.runner.execCommand(['npm', 'uninstall', '@chakra-ui/react', '@chakra-ui/next-js', '@emotion/react', '@emotion/styled', 'framer-motion'], { cwd: projectPath });

      // Remove configuration files
      const configPath = path.join(projectPath, 'chakra.config.ts');
      if (await fsExtra.pathExists(configPath)) {
        await fsExtra.remove(configPath);
      }

      // Remove UI components
      const uiPath = path.join(projectPath, 'src', 'components', 'ui');
      if (await fsExtra.pathExists(uiPath)) {
        await fsExtra.remove(uiPath);
      }

      // Remove unified interface files
      const unifiedPath = path.join(projectPath, 'src', 'lib', 'ui');
      if (await fsExtra.pathExists(unifiedPath)) {
        await fsExtra.remove(unifiedPath);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Chakra UI',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Updating Chakra UI...');

      // Update Chakra UI dependencies
      await this.runner.execCommand(['npm', 'update', '@chakra-ui/react', '@chakra-ui/next-js', '@emotion/react', '@emotion/styled', 'framer-motion'], { cwd: projectPath });

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to update Chakra UI',
        startTime,
        [],
        error
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

    try {
      const { projectPath } = context;

      // Check if package.json exists
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!await fsExtra.pathExists(packageJsonPath)) {
        errors.push({
          code: 'MISSING_PACKAGE_JSON',
          message: 'package.json not found in project directory',
          severity: 'error'
        });
      }

      // Check if it's a React project
      const packageJson = await fsExtra.readJson(packageJsonPath);
      if (!packageJson.dependencies?.react && !packageJson.dependencies?.['@types/react']) {
        errors.push({
          code: 'NOT_REACT_PROJECT',
          message: 'Chakra UI requires a React project',
          severity: 'error'
        });
      }

      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion?.slice(1).split('.')[0] || '16');
      if (majorVersion < 16) {
        errors.push({
          code: 'NODE_VERSION_TOO_OLD',
          message: 'Node.js 16 or higher is required for Chakra UI',
          severity: 'error'
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });

      return {
        valid: false,
        errors,
        warnings
      };
    }
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react', 'vite'],
      platforms: [TargetPlatform.WEB, TargetPlatform.MOBILE],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: [],
      uiLibraries: [],
      conflicts: ['shadcn-ui', 'tamagui'] // Conflicts with other UI libraries
    };
  }

  getDependencies(): string[] {
    return ['react', '@types/react'];
  }

  getConflicts(): string[] {
    return ['shadcn-ui', 'tamagui', 'mui'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'react',
        description: 'React 18 or higher',
        version: '^18.0.0'
      },
      {
        type: 'package',
        name: '@types/react',
        description: 'React TypeScript definitions',
        version: '^18.0.0'
      },
      {
        type: 'binary',
        name: 'node',
        description: 'Node.js 16 or higher',
        version: '>=16.0.0'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      theme: 'default',
      colorMode: 'light',
      enableAnimations: true,
      enableRTL: false,
      enableCSSReset: true,
      enableColorMode: true
    };
  }

  getConfigSchema(): ConfigSchema {
    return {
      type: 'object',
      properties: {
        theme: {
          type: 'string',
          description: 'Theme to use (default, dark, custom)',
          default: 'default',
          enum: ['default', 'dark', 'custom']
        },
        colorMode: {
          type: 'string',
          description: 'Default color mode',
          default: 'light',
          enum: ['light', 'dark', 'system']
        },
        enableAnimations: {
          type: 'boolean',
          description: 'Enable animations and transitions',
          default: true
        },
        enableRTL: {
          type: 'boolean',
          description: 'Enable right-to-left support',
          default: false
        },
        enableCSSReset: {
          type: 'boolean',
          description: 'Enable CSS reset',
          default: true
        },
        enableColorMode: {
          type: 'boolean',
          description: 'Enable color mode switching',
          default: true
        }
      },
      required: [],
      additionalProperties: false
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Chakra UI dependencies...');

    const dependencies = [
      '@chakra-ui/react@^3.0.0',
      '@chakra-ui/next-js@^3.0.0',
      '@emotion/react@^11.11.0',
      '@emotion/styled@^11.11.0',
      'framer-motion@^11.0.0'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async createChakraConfig(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating Chakra UI configuration...');

    const configContent = this.getChakraConfigContent();
    await fsExtra.writeFile(path.join(projectPath, 'chakra.config.ts'), configContent);
  }

  private async createUIComponents(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating Chakra UI components...');

    const componentsPath = path.join(projectPath, 'src', 'components', 'ui');
    await fsExtra.ensureDir(componentsPath);

    // Create Button component
    await this.createButtonComponent(componentsPath);

    // Create Card component
    await this.createCardComponent(componentsPath);

    // Create Input component
    await this.createInputComponent(componentsPath);

    // Create Form component
    await this.createFormComponent(componentsPath);

    // Create Modal component
    await this.createModalComponent(componentsPath);
  }

  private async createButtonComponent(componentsPath: string): Promise<void> {
    const buttonContent = `import React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

export interface ButtonProps extends ChakraButtonProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: 'blue' | 'green' | 'red' | 'gray' | 'purple' | 'pink' | 'orange' | 'teal';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'solid',
  size = 'md',
  colorScheme = 'blue',
  isLoading = false,
  loadingText,
  ...props
}) => {
  return (
    <ChakraButton
      variant={variant}
      size={size}
      colorScheme={colorScheme}
      isLoading={isLoading}
      loadingText={loadingText}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;
`;
    await fsExtra.writeFile(path.join(componentsPath, 'button.tsx'), buttonContent);
  }

  private async createCardComponent(componentsPath: string): Promise<void> {
    const cardContent = `import React from 'react';
import {
  Box,
  Card as ChakraCard,
  CardBody,
  CardHeader,
  CardFooter,
  Heading,
  Text,
  CardProps as ChakraCardProps
} from '@chakra-ui/react';

export interface CardProps extends ChakraCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'elevated' | 'outline' | 'filled' | 'unstyled';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  variant = 'elevated',
  ...props
}) => {
  return (
    <ChakraCard variant={variant} {...props}>
      {(title || subtitle) && (
        <CardHeader>
          {title && <Heading size="md">{title}</Heading>}
          {subtitle && <Text color="gray.600">{subtitle}</Text>}
        </CardHeader>
      )}
      <CardBody>{children}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </ChakraCard>
  );
};

export default Card;
`;
    await fsExtra.writeFile(path.join(componentsPath, 'card.tsx'), cardContent);
  }

  private async createInputComponent(componentsPath: string): Promise<void> {
    const inputContent = `import React from 'react';
import {
  Input as ChakraInput,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  InputProps as ChakraInputProps,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText
} from '@chakra-ui/react';

export interface InputProps extends ChakraInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  isRequired?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isRequired = false,
  ...props
}) => {
  const inputElement = (
    <InputGroup>
      {leftIcon && <InputLeftElement>{leftIcon}</InputLeftElement>}
      <ChakraInput {...props} />
      {rightIcon && <InputRightElement>{rightIcon}</InputRightElement>}
    </InputGroup>
  );

  if (label || error || helperText) {
    return (
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        {label && <FormLabel>{label}</FormLabel>}
        {inputElement}
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }

  return inputElement;
};

export default Input;
`;
    await fsExtra.writeFile(path.join(componentsPath, 'input.tsx'), inputContent);
  }

  private async createFormComponent(componentsPath: string): Promise<void> {
    const formContent = `import React from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Button,
  Box
} from '@chakra-ui/react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  submitText?: string;
  isLoading?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  submitText = 'Submit',
  isLoading = false,
  layout = 'vertical'
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = {};
    
    fields.forEach(field => {
      data[field.name] = formData.get(field.name);
    });
    
    onSubmit(data);
  };

  const Container = layout === 'horizontal' ? HStack : VStack;

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Container spacing={4} align="stretch">
        {fields.map((field) => (
          <FormControl
            key={field.name}
            isInvalid={!!field.error}
            isRequired={field.required}
          >
            <FormLabel>{field.label}</FormLabel>
            {/* Input rendering would go here - simplified for this example */}
            <Box
              as="input"
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              px={3}
              py={2}
              width="100%"
            />
            {field.error && <FormErrorMessage>{field.error}</FormErrorMessage>}
            {field.helperText && <FormHelperText>{field.helperText}</FormHelperText>}
          </FormControl>
        ))}
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
          loadingText="Submitting..."
        >
          {submitText}
        </Button>
      </Container>
    </Box>
  );
};

export default Form;
`;
    await fsExtra.writeFile(path.join(componentsPath, 'form.tsx'), formContent);
  }

  private async createModalComponent(componentsPath: string): Promise<void> {
    const modalContent = `import React from 'react';
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  ModalProps as ChakraModalProps
} from '@chakra-ui/react';

export interface ModalProps extends Omit<ChakraModalProps, 'children'> {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  children,
  footer,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onClose,
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const defaultFooter = (
    <>
      <Button variant="ghost" onClick={onClose}>
        {cancelText}
      </Button>
      {onConfirm && (
        <Button
          colorScheme={isDestructive ? 'red' : 'blue'}
          onClick={handleConfirm}
        >
          {confirmText}
        </Button>
      )}
    </>
  );

  return (
    <ChakraModal onClose={onClose!} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          {footer || defaultFooter}
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  );
};

export default Modal;
`;
    await fsExtra.writeFile(path.join(componentsPath, 'modal.tsx'), modalContent);
  }

  private async createPackageExports(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating package exports...');

    const exportsContent = `// Chakra UI Components
export { Button } from './components/ui/button';
export { Card } from './components/ui/card';
export { Input } from './components/ui/input';
export { Form } from './components/ui/form';
export { Modal } from './components/ui/modal';

// Re-export Chakra UI components for convenience
export {
  Box,
  Flex,
  Grid,
  Stack,
  Text,
  Heading,
  Image,
  Icon,
  Spinner,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  Link,
  List,
  ListItem,
  OrderedList,
  UnorderedList,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useToast,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
`;
    await fsExtra.writeFile(path.join(projectPath, 'src', 'lib', 'ui', 'exports.ts'), exportsContent);
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    
    // For monorepo projects, generate files directly in the package directory
    // For single app projects, use the structure service to get the correct path
    let unifiedPath: string;
    if (structure.isMonorepo) {
      // In monorepo, we're already in the package directory (packages/ui)
      unifiedPath = projectPath;
    } else {
      // In single app, use the structure service to get the correct path
      unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'ui');
    }
    
    await fsExtra.ensureDir(unifiedPath);

    // Create index.ts for the unified interface
    const indexContent = `// Chakra UI Unified Interface
// This file provides a unified interface for UI components across different project structures

export * from './components/button';
export * from './components/card';
export * from './components/input';
export * from './components/form';
export * from './components/modal';

// Re-export utilities
export { theme } from './theme';

// Re-export Chakra UI components
export * from './exports';
`;
    await fsExtra.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);

    // Create theme.ts for the unified interface
    const themeContent = `// Chakra UI Theme Configuration
import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

export const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
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
});

export default theme;
`;
    await fsExtra.writeFile(path.join(unifiedPath, 'theme.ts'), themeContent);

    // Create utils.ts for the unified interface
    const utilsContent = `// Chakra UI Utilities
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

export function createComponentConfig(componentName: string) {
  return createMultiStyleConfigHelpers(componentName);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
`;
    await fsExtra.writeFile(path.join(unifiedPath, 'utils.ts'), utilsContent);
  }

  private getChakraConfigContent(): string {
    return `import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const baseStyle = defineStyle({
  borderRadius: 'md',
  fontWeight: 'semibold',
  _focus: {
    boxShadow: 'outline',
  },
});

const sizes = {
  sm: defineStyle({
    fontSize: 'sm',
    px: 3,
    py: 1,
  }),
  md: defineStyle({
    fontSize: 'md',
    px: 4,
    py: 2,
  }),
  lg: defineStyle({
    fontSize: 'lg',
    px: 6,
    py: 3,
  }),
};

const variants = {
  solid: defineStyle({
    bg: 'brand.500',
    color: 'white',
    _hover: {
      bg: 'brand.600',
    },
  }),
  outline: defineStyle({
    border: '1px solid',
    borderColor: 'brand.500',
    color: 'brand.500',
    _hover: {
      bg: 'brand.50',
    },
  }),
  ghost: defineStyle({
    color: 'brand.500',
    _hover: {
      bg: 'brand.50',
    },
  }),
};

export const buttonTheme = defineStyleConfig({
  baseStyle,
  sizes,
  variants,
  defaultProps: {
    size: 'md',
    variant: 'solid',
    colorScheme: 'brand',
  },
});

export default {
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: buttonTheme,
  },
};
`;
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
    const duration = Date.now() - startTime;
    
    if (originalError) {
      errors.push({
        code: 'PLUGIN_ERROR',
        message: originalError instanceof Error ? originalError.message : String(originalError),
        severity: 'error',
        details: originalError
      });
    }

    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors,
      warnings: [],
      duration
    };
  }
} 