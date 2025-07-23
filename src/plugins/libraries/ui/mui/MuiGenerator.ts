/**
 * MUI Code Generator
 * 
 * Handles all code generation for MUI UI library integration.
 * Based on: https://mui.com/
 */

import { UIPluginConfig } from '../../../../types/plugins.js';
import { ThemeOption, ComponentOption } from '../../../../types/core.js';

export interface GeneratedFile {
    path: string;
    content: string;
}

export class MuiGenerator {
  
  generateAllFiles(config: UIPluginConfig): GeneratedFile[] {
    return [
      this.generateThemeConfig(config),
      this.generateUnifiedIndex(config),
      this.generateButtonComponent(config),
      this.generateCardComponent(config),
      this.generateInputComponent(config),
      this.generateFormComponent(config),
      this.generateModalComponent(config),
      this.generateTableComponent(config),
      this.generateNavigationComponent(config),
      this.generateBadgeComponent(config),
      this.generateAvatarComponent(config),
      this.generateAlertComponent(config)
    ];
  }

  generateThemeConfig(config: UIPluginConfig): GeneratedFile {
    const content = `import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: '${config.theme || ThemeOption.LIGHT}',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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
});

export default theme;
`;
    return { path: 'src/lib/ui/theme.ts', content };
  }

  generateUnifiedIndex(config: UIPluginConfig): GeneratedFile {
    const content = `/**
 * MUI Unified Interface
 * 
 * This file provides a unified interface for MUI components,
 * making it easy to import and use components consistently across your application.
 */

// Theme exports
export { theme, default as muiTheme } from './theme.js';

// Component exports
${this.generateComponentExports(config)}

// Utility exports
export { Box, Container, Grid, Stack, Typography } from '@mui/material';

// Hook exports
export { useTheme, useMediaQuery } from '@mui/material/styles';
`;
    return { path: 'src/lib/ui/index.ts', content };
  }

  private generateComponentExports(config: UIPluginConfig): string {
    const components = config.components || [];
    const exports: string[] = [];

    components.forEach((component: ComponentOption) => {
      const componentName = this.getComponentName(component);
      exports.push(`export { ${componentName} } from './${componentName.toLowerCase()}.js';`);
    });

    return exports.join('\n');
  }

  private getComponentName(component: ComponentOption): string {
    const names: Partial<Record<ComponentOption, string>> = {
      [ComponentOption.BUTTON]: 'Button',
      [ComponentOption.CARD]: 'Card',
      [ComponentOption.INPUT]: 'Input',
      [ComponentOption.FORM]: 'Form',
      [ComponentOption.MODAL]: 'Modal',
      [ComponentOption.TABLE]: 'Table',
      [ComponentOption.NAVIGATION]: 'Navigation',
      [ComponentOption.BADGE]: 'Badge',
      [ComponentOption.AVATAR]: 'Avatar',
      [ComponentOption.ALERT]: 'Alert'
    };
    return names[component] || component;
  }

  generateButtonComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Button as MuiButton, ButtonProps } from '@mui/material';
import { forwardRef } from 'react';

export interface ButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'contained', size = 'medium', ...props }, ref) => {
    return (
      <MuiButton
        ref={ref}
        variant={variant}
        size={size}
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';
`;
    return { path: 'src/lib/ui/button.tsx', content };
  }

  generateCardComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Card as MuiCard, CardProps, CardContent, CardHeader, CardActions } from '@mui/material';
import { forwardRef } from 'react';

export interface CardProps extends CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, title, subtitle, actions, ...props }, ref) => {
    return (
      <MuiCard ref={ref} {...props}>
        {(title || subtitle) && (
          <CardHeader
            title={title}
            subheader={subtitle}
          />
        )}
        <CardContent>
          {children}
        </CardContent>
        {actions && (
          <CardActions>
            {actions}
          </CardActions>
        )}
      </MuiCard>
    );
  }
);

Card.displayName = 'Card';
`;
    return { path: 'src/lib/ui/card.tsx', content };
  }

  generateInputComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { TextField, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
}

export const Input = forwardRef<HTMLDivElement, InputProps>(
  ({ variant = 'outlined', size = 'medium', ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant={variant}
        size={size}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
`;
    return { path: 'src/lib/ui/input.tsx', content };
  }

  generateFormComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Box, BoxProps } from '@mui/material';
import { forwardRef } from 'react';

export interface FormProps extends BoxProps {
  onSubmit?: (event: React.FormEvent) => void;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ children, onSubmit, component = 'form', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component={component}
        onSubmit={onSubmit}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Form.displayName = 'Form';
`;
    return { path: 'src/lib/ui/form.tsx', content };
  }

  generateModalComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Dialog, DialogProps, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { forwardRef } from 'react';

export interface ModalProps extends Omit<DialogProps, 'open'> {
  open: boolean;
  onClose: () => void;
  title?: string;
  actions?: React.ReactNode;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ children, open, onClose, title, actions, ...props }, ref) => {
    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={onClose}
        {...props}
      >
        {title && <DialogTitle>{title}</DialogTitle>}
        <DialogContent>
          {children}
        </DialogContent>
        {actions && <DialogActions>{actions}</DialogActions>}
      </Dialog>
    );
  }
);

Modal.displayName = 'Modal';
`;
    return { path: 'src/lib/ui/modal.tsx', content };
  }

  generateTableComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Table, TableProps, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { forwardRef } from 'react';

export interface TableProps extends TableProps {
  headers?: string[];
  data?: any[][];
}

export const DataTable = forwardRef<HTMLTableElement, TableProps>(
  ({ children, headers, data, ...props }, ref) => {
    return (
      <Table ref={ref} {...props}>
        {headers && (
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {data?.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
          {children}
        </TableBody>
      </Table>
    );
  }
);

DataTable.displayName = 'DataTable';
`;
    return { path: 'src/lib/ui/table.tsx', content };
  }

  generateNavigationComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { AppBar, AppBarProps, Toolbar, Typography, Button } from '@mui/material';
import { forwardRef } from 'react';

export interface NavigationProps extends AppBarProps {
  title?: string;
  menuItems?: Array<{ label: string; href: string }>;
}

export const Navigation = forwardRef<HTMLDivElement, NavigationProps>(
  ({ title, menuItems, children, ...props }, ref) => {
    return (
      <AppBar ref={ref} {...props}>
        <Toolbar>
          {title && (
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
          )}
          {menuItems?.map((item, index) => (
            <Button key={index} color="inherit" href={item.href}>
              {item.label}
            </Button>
          ))}
          {children}
        </Toolbar>
      </AppBar>
    );
  }
);

Navigation.displayName = 'Navigation';
`;
    return { path: 'src/lib/ui/navigation.tsx', content };
  }

  generateSelectComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Select, SelectProps, MenuItem, FormControl, InputLabel } from '@mui/material';
import { forwardRef } from 'react';

export interface SelectProps extends Omit<SelectProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  label?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ variant = 'outlined', label, options, children, ...props }, ref) => {
    return (
      <FormControl variant={variant} fullWidth>
        {label && <InputLabel>{label}</InputLabel>}
        <MuiSelect ref={ref} label={label} {...props}>
          {options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
          {children}
        </MuiSelect>
      </FormControl>
    );
  }
);

Select.displayName = 'Select';
`;
    return { path: 'src/lib/ui/select.tsx', content };
  }

  generateCheckboxComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Checkbox, CheckboxProps, FormControlLabel } from '@mui/material';
import { forwardRef } from 'react';

export interface CheckboxProps extends CheckboxProps {
  label?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, ...props }, ref) => {
    return (
      <FormControlLabel
        control={
          <MuiCheckbox ref={ref} {...props} />
        }
        label={label}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';
`;
    return { path: 'src/lib/ui/checkbox.tsx', content };
  }

  generateSwitchComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Switch, SwitchProps, FormControlLabel } from '@mui/material';
import { forwardRef } from 'react';

export interface SwitchProps extends SwitchProps {
  label?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ label, ...props }, ref) => {
    return (
      <FormControlLabel
        control={
          <MuiSwitch ref={ref} {...props} />
        }
        label={label}
      />
    );
  }
);

Switch.displayName = 'Switch';
`;
    return { path: 'src/lib/ui/switch.tsx', content };
  }

  generateBadgeComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Badge, BadgeProps } from '@mui/material';
import { forwardRef } from 'react';

export interface BadgeProps extends BadgeProps {
  content?: string | number;
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ children, content, ...props }, ref) => {
    return (
      <MuiBadge ref={ref} badgeContent={content} {...props}>
        {children}
      </MuiBadge>
    );
  }
);

Badge.displayName = 'Badge';
`;
    return { path: 'src/lib/ui/badge.tsx', content };
  }

  generateAvatarComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Avatar, AvatarProps } from '@mui/material';
import { forwardRef } from 'react';

export interface AvatarProps extends AvatarProps {
  src?: string;
  alt?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ children, src, alt, ...props }, ref) => {
    return (
      <MuiAvatar ref={ref} src={src} alt={alt} {...props}>
        {children}
      </MuiAvatar>
    );
  }
);

Avatar.displayName = 'Avatar';
`;
    return { path: 'src/lib/ui/avatar.tsx', content };
  }

  generateAlertComponent(config: UIPluginConfig): GeneratedFile {
    const content = `import { Alert, AlertProps } from '@mui/material';
import { forwardRef } from 'react';

export interface AlertProps extends AlertProps {
  severity?: 'error' | 'warning' | 'info' | 'success';
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ children, severity = 'info', ...props }, ref) => {
    return (
      <MuiAlert ref={ref} severity={severity} {...props}>
        {children}
      </MuiAlert>
    );
  }
);

Alert.displayName = 'Alert';
`;
    return { path: 'src/lib/ui/alert.tsx', content };
  }

  generateScripts(config: UIPluginConfig): Record<string, string> {
    return {
      'storybook': 'storybook dev -p 6006',
      'build-storybook': 'storybook build'
    };
  }

  generateEnvConfig(config: UIPluginConfig): Record<string, string> {
    return {
      'MUI_THEME_MODE': config.theme || ThemeOption.LIGHT,
      'MUI_ENABLE_EMOTION': 'true'
    };
  }
} 