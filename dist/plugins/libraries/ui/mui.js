/**
 * MUI (Material-UI) Plugin - Pure Technology Implementation
 *
 * Provides MUI component library integration using the latest v6.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../../types/plugin.js';
import { templateService } from '../../../core/templates/template-service.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService } from '../../../core/project/structure-service.js';
export class MuiPlugin {
    templateService;
    runner;
    constructor() {
        this.templateService = templateService;
        this.runner = new CommandRunner();
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'mui',
            name: 'Material-UI (MUI)',
            version: '1.0.0',
            description: 'React component library implementing Google\'s Material Design',
            author: 'The Architech Team',
            category: PluginCategory.UI_LIBRARY,
            tags: ['ui', 'components', 'material-design', 'react', 'enterprise'],
            license: 'MIT',
            repository: 'https://github.com/mui/material-ui',
            homepage: 'https://mui.com'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectPath, pluginConfig } = context;
            context.logger.info('Installing Material-UI component library...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Create MUI configuration
            await this.createMuiConfig(context);
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
                        path: path.join(projectPath, 'src', 'components', 'ui', 'dialog.tsx')
                    }
                ],
                dependencies: [
                    {
                        name: '@mui/material',
                        version: '^6.0.0',
                        type: 'production',
                        category: PluginCategory.UI_LIBRARY
                    },
                    {
                        name: '@mui/icons-material',
                        version: '^6.0.0',
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
                        name: '@mui/system',
                        version: '^6.0.0',
                        type: 'production',
                        category: PluginCategory.UI_LIBRARY
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
                        file: 'mui.config.ts',
                        content: this.getMuiConfigContent(),
                        mergeStrategy: 'replace'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Material-UI', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Material-UI...');
            // Remove MUI dependencies
            await this.runner.execCommand(['npm', 'uninstall', '@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled', '@mui/system'], { cwd: projectPath });
            // Remove configuration files
            const configPath = path.join(projectPath, 'mui.config.ts');
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
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Material-UI', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Updating Material-UI...');
            // Update MUI dependencies
            await this.runner.execCommand(['npm', 'update', '@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled', '@mui/system'], { cwd: projectPath });
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
        }
        catch (error) {
            return this.createErrorResult('Failed to update Material-UI', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
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
                    message: 'Material-UI requires a React project',
                    severity: 'error'
                });
            }
            // Check Node.js version
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion?.slice(1).split('.')[0] || '16');
            if (majorVersion < 16) {
                errors.push({
                    code: 'NODE_VERSION_TOO_OLD',
                    message: 'Node.js 16 or higher is required for Material-UI',
                    severity: 'error'
                });
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
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
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vite'],
            platforms: [TargetPlatform.WEB, TargetPlatform.MOBILE],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: [],
            uiLibraries: [],
            conflicts: ['shadcn-ui', 'tamagui', 'chakra-ui'] // Conflicts with other UI libraries
        };
    }
    getDependencies() {
        return ['react', '@types/react'];
    }
    getConflicts() {
        return ['shadcn-ui', 'tamagui', 'chakra-ui'];
    }
    getRequirements() {
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
    getDefaultConfig() {
        return {
            theme: 'light',
            colorMode: 'light',
            enableAnimations: true,
            enableRTL: false,
            enableCSSReset: true,
            enableColorMode: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                theme: {
                    type: 'string',
                    description: 'Theme to use (light, dark, custom)',
                    default: 'light',
                    enum: ['light', 'dark', 'custom']
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
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing Material-UI dependencies...');
        const dependencies = [
            '@mui/material@^6.0.0',
            '@mui/icons-material@^6.0.0',
            '@emotion/react@^11.11.0',
            '@emotion/styled@^11.11.0',
            '@mui/system@^6.0.0'
        ];
        await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
    }
    async createMuiConfig(context) {
        const { projectPath } = context;
        context.logger.info('Creating Material-UI configuration...');
        const configContent = this.getMuiConfigContent();
        await fsExtra.writeFile(path.join(projectPath, 'mui.config.ts'), configContent);
    }
    async createUIComponents(context) {
        const { projectPath } = context;
        context.logger.info('Creating Material-UI components...');
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
        // Create Dialog component
        await this.createDialogComponent(componentsPath);
    }
    async createButtonComponent(componentsPath) {
        const buttonContent = `import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  isLoading = false,
  loadingText,
  disabled,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      size={size}
      color={color}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? loadingText || children : children}
    </MuiButton>
  );
};

export default Button;
`;
        await fsExtra.writeFile(path.join(componentsPath, 'button.tsx'), buttonContent);
    }
    async createCardComponent(componentsPath) {
        const cardContent = `import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  CardProps as MuiCardProps
} from '@mui/material';

export interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'elevation' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  actions,
  variant = 'elevation',
  ...props
}) => {
  return (
    <MuiCard variant={variant} {...props}>
      {(title || subtitle) && (
        <CardHeader
          title={title && <Typography variant="h6">{title}</Typography>}
          subheader={subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        />
      )}
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  );
};

export default Card;
`;
        await fsExtra.writeFile(path.join(componentsPath, 'card.tsx'), cardContent);
    }
    async createInputComponent(componentsPath) {
        const inputContent = `import React from 'react';
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment
} from '@mui/material';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactElement;
  endIcon?: React.ReactElement;
  isRequired?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  isRequired = false,
  variant = 'outlined',
  ...props
}) => {
  const inputProps = {
    startAdornment: startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : undefined,
    endAdornment: endIcon ? <InputAdornment position="end">{endIcon}</InputAdornment> : undefined,
  };

  return (
    <TextField
      label={label}
      variant={variant}
      error={!!error}
      helperText={error || helperText}
      required={isRequired}
      InputProps={inputProps}
      {...props}
    />
  );
};

export default Input;
`;
        await fsExtra.writeFile(path.join(componentsPath, 'input.tsx'), inputContent);
    }
    async createFormComponent(componentsPath) {
        const formContent = `import React from 'react';
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  FormHelperText,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup
} from '@mui/material';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
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
  const [formData, setFormData] = React.useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      error: !!field.error,
      helperText: field.error || field.helperText,
      value: formData[field.name] || '',
      onChange: (e: any) => handleChange(field.name, e.target.value),
      fullWidth: true,
    };

    switch (field.type) {
      case 'select':
        return (
          <FormControl key={field.name} fullWidth error={!!field.error}>
            <FormLabel>{field.label}</FormLabel>
            <Select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              displayEmpty
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(field.error || field.helperText) && (
              <FormHelperText>{field.error || field.helperText}</FormHelperText>
            )}
          </FormControl>
        );
      
      case 'checkbox':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Checkbox
                checked={formData[field.name] || false}
                onChange={(e) => handleChange(field.name, e.target.checked)}
              />
            }
            label={field.label}
          />
        );
      
      case 'radio':
        return (
          <FormControl key={field.name} component="fieldset" error={!!field.error}>
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {(field.error || field.helperText) && (
              <FormHelperText>{field.error || field.helperText}</FormHelperText>
            )}
          </FormControl>
        );
      
      default:
        return <TextField key={field.name} {...commonProps} type={field.type} />;
    }
  };

  const Container = layout === 'horizontal' ? Box : Stack;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Container spacing={2} direction={layout === 'horizontal' ? 'row' : 'column'}>
        {fields.map(renderField)}
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? 'Submitting...' : submitText}
        </Button>
      </Container>
    </Box>
  );
};

export default Form;
`;
        await fsExtra.writeFile(path.join(componentsPath, 'form.tsx'), formContent);
    }
    async createDialogComponent(componentsPath) {
        const dialogContent = `import React from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps as MuiDialogProps,
  Button,
  Typography
} from '@mui/material';

export interface DialogProps extends Omit<MuiDialogProps, 'children'> {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  title,
  children,
  actions,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onClose,
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.({}, 'escapeKeyDown');
  };

  const defaultActions = (
    <>
      <Button onClick={(e) => onClose?.(e, 'escapeKeyDown')}>
        {cancelText}
      </Button>
      {onConfirm && (
        <Button
          variant="contained"
          color={isDestructive ? 'error' : 'primary'}
          onClick={handleConfirm}
        >
          {confirmText}
        </Button>
      )}
    </>
  );

  return (
    <MuiDialog onClose={onClose} {...props}>
      <DialogTitle>
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions>
        {actions || defaultActions}
      </DialogActions>
    </MuiDialog>
  );
};

export default Dialog;
`;
        await fsExtra.writeFile(path.join(componentsPath, 'dialog.tsx'), dialogContent);
    }
    async createPackageExports(context) {
        const { projectPath } = context;
        context.logger.info('Creating package exports...');
        const exportsContent = `// Material-UI Components
export { Button } from './components/ui/button';
export { Card } from './components/ui/card';
export { Input } from './components/ui/input';
export { Form } from './components/ui/form';
export { Dialog } from './components/ui/dialog';

// Re-export Material-UI components for convenience
export {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Avatar,
  AvatarGroup,
  Badge,
  Alert,
  AlertTitle,
  Snackbar,
  LinearProgress,
  CircularProgress,
  Skeleton,
  Tooltip,
  Popover,
  Drawer,
  useTheme,
  useMediaQuery,
  ThemeProvider,
  CssBaseline
} from '@mui/material';

// Re-export Material-UI icons
export * from '@mui/icons-material';
`;
        await fsExtra.writeFile(path.join(projectPath, 'src', 'lib', 'ui', 'exports.ts'), exportsContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        const structure = context.projectStructure;
        // For monorepo projects, generate files directly in the package directory
        // For single app projects, use the structure service to get the correct path
        let unifiedPath;
        if (structure.isMonorepo) {
            // In monorepo, we're already in the package directory (packages/ui)
            unifiedPath = projectPath;
        }
        else {
            // In single app, use the structure service to get the correct path
            unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'ui');
        }
        await fsExtra.ensureDir(unifiedPath);
        // Create index.ts for the unified interface
        const indexContent = `// Material-UI Unified Interface
// This file provides a unified interface for UI components across different project structures

export * from './components/button';
export * from './components/card';
export * from './components/input';
export * from './components/form';
export * from './components/dialog';

// Re-export utilities
export { theme } from './theme';

// Re-export Material-UI components
export * from './exports';
`;
        await fsExtra.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);
        // Create theme.ts for the unified interface
        const themeContent = `// Material-UI Theme Configuration
import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 300,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 300,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);

export default theme;
`;
        await fsExtra.writeFile(path.join(unifiedPath, 'theme.ts'), themeContent);
        // Create utils.ts for the unified interface
        const utilsContent = `// Material-UI Utilities
import { Theme } from '@mui/material/styles';

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

export function getThemeColor(theme: Theme, color: string, shade: number = 500): string {
  return theme.palette[color as keyof typeof theme.palette]?.[shade] || '#000000';
}
`;
        await fsExtra.writeFile(path.join(unifiedPath, 'utils.ts'), utilsContent);
    }
    getMuiConfigContent() {
        return `import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 300,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 300,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
};

export default createTheme(themeOptions);
`;
    }
    createErrorResult(message, startTime, errors = [], originalError) {
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
//# sourceMappingURL=mui.js.map