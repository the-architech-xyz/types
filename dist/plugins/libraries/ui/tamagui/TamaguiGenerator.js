import { ComponentOption, ThemeOption } from '../../../../types/plugin-interfaces.js';
export class TamaguiGenerator {
    generateAllFiles(config) {
        return [
            this.generateThemeConfig(config),
            this.generateProviderSetup(config),
            this.generateUnifiedIndex(config),
            this.generateButtonComponent(config),
            this.generateCardComponent(config),
            this.generateInputComponent(config),
            this.generateFormComponent(config),
            this.generateModalComponent(config),
            this.generateTableComponent(config),
            this.generateNavigationComponent(config),
            this.generateSelectComponent(config),
            this.generateCheckboxComponent(config),
            this.generateSwitchComponent(config),
            this.generateBadgeComponent(config),
            this.generateAvatarComponent(config),
            this.generateAlertComponent(config)
        ];
    }
    generateThemeConfig(config) {
        const content = `import { createTamagui, createTokens } from 'tamagui';
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
  defaultTheme: '${config.theme?.mode || ThemeOption.LIGHT}',
  shouldAddPrefersColorThemes: ${config.enableColorMode || true},
  animationDriver: ${config.enableAnimations !== false ? 'react-native' : 'css'},
  rtl: ${config.enableRTL || false},
  cssReset: ${config.enableCSSReset !== false},
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
`;
        return { path: 'tamagui.config.ts', content };
    }
    generateProviderSetup(config) {
        const content = `import React from 'react';
import { TamaguiProvider } from 'tamagui';
import config from './tamagui.config';

interface TamaguiProviderProps {
  children: React.ReactNode;
}

export const TamaguiProviderWrapper: React.FC<TamaguiProviderProps> = ({ children }) => {
  return (
    <TamaguiProvider config={config} defaultTheme="${config.theme?.mode || ThemeOption.LIGHT}">
      {children}
    </TamaguiProvider>
  );
};

export default TamaguiProviderWrapper;
`;
        return { path: 'src/lib/ui/provider.tsx', content };
    }
    generateUnifiedIndex(config) {
        const content = `/**
 * Tamagui Unified Interface
 * 
 * This file provides a unified interface for Tamagui components,
 * making it easy to import and use components consistently across your application.
 */

// Provider exports
export { TamaguiProviderWrapper } from './provider.js';

// Component exports
${this.generateComponentExports(config)}

// Utility exports
export { YStack, XStack, ZStack, HStack, VStack } from 'tamagui';

// Hook exports
export { useTheme, useMedia } from 'tamagui';
`;
        return { path: 'src/lib/ui/index.ts', content };
    }
    generateComponentExports(config) {
        const components = config.components?.list || [];
        const exports = [];
        components.forEach(component => {
            const componentName = this.getComponentName(component);
            exports.push(`export { ${componentName} } from './${componentName.toLowerCase()}.js';`);
        });
        return exports.join('\n');
    }
    getComponentName(component) {
        const names = {
            [ComponentOption.BUTTON]: 'Button',
            [ComponentOption.CARD]: 'Card',
            [ComponentOption.INPUT]: 'Input',
            [ComponentOption.FORM]: 'Form',
            [ComponentOption.MODAL]: 'Modal',
            [ComponentOption.TABLE]: 'Table',
            [ComponentOption.NAVIGATION]: 'Navigation',
            [ComponentOption.SELECT]: 'Select',
            [ComponentOption.CHECKBOX]: 'Checkbox',
            [ComponentOption.SWITCH]: 'Switch',
            [ComponentOption.BADGE]: 'Badge',
            [ComponentOption.AVATAR]: 'Avatar',
            [ComponentOption.ALERT]: 'Alert'
        };
        return names[component] || component;
    }
    generateButtonComponent(config) {
        const content = `import { Button as TamaguiButton, ButtonProps } from 'tamagui';
import { forwardRef } from 'react';

export interface ButtonProps extends ButtonProps {
  variant?: 'contained' | 'outlined' | 'dashed';
  size?: '$2' | '$3' | '$4' | '$5';
  theme?: 'blue' | 'gray' | 'red' | 'green' | 'yellow';
}

export const Button = forwardRef<any, ButtonProps>(
  ({ children, variant = 'contained', size = '$4', theme = 'blue', ...props }, ref) => {
    return (
      <TamaguiButton
        ref={ref}
        size={size}
        theme={theme}
        variant={variant}
        {...props}
      >
        {children}
      </TamaguiButton>
    );
  }
);

Button.displayName = 'Button';
`;
        return { path: 'src/lib/ui/button.tsx', content };
    }
    generateCardComponent(config) {
        const content = `import { Card as TamaguiCard, CardProps } from 'tamagui';
import { forwardRef } from 'react';

export interface CardProps extends CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Card = forwardRef<any, CardProps>(
  ({ children, title, subtitle, actions, ...props }, ref) => {
    return (
      <TamaguiCard ref={ref} {...props}>
        {(title || subtitle) && (
          <TamaguiCard.Header padded>
            {title && <Text>{title}</Text>}
            {subtitle && <Text size="$2" color="$gray10">{subtitle}</Text>}
          </TamaguiCard.Header>
        )}
        <TamaguiCard.Footer padded>
          {children}
        </TamaguiCard.Footer>
        {actions && (
          <TamaguiCard.Footer padded>
            {actions}
          </TamaguiCard.Footer>
        )}
      </TamaguiCard>
    );
  }
);

Card.displayName = 'Card';
`;
        return { path: 'src/lib/ui/card.tsx', content };
    }
    generateInputComponent(config) {
        const content = `import { Input as TamaguiInput, InputProps } from 'tamagui';
import { forwardRef } from 'react';

export interface InputProps extends InputProps {
  size?: '$2' | '$3' | '$4';
  placeholder?: string;
}

export const Input = forwardRef<any, InputProps>(
  ({ size = '$4', placeholder, ...props }, ref) => {
    return (
      <TamaguiInput
        ref={ref}
        size={size}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
`;
        return { path: 'src/lib/ui/input.tsx', content };
    }
    generateFormComponent(config) {
        const content = `import { YStack, YStackProps } from 'tamagui';
import { forwardRef } from 'react';

export interface FormProps extends YStackProps {
  onSubmit?: (event: React.FormEvent) => void;
}

export const Form = forwardRef<any, FormProps>(
  ({ children, onSubmit, component = 'form', ...props }, ref) => {
    return (
      <YStack
        ref={ref}
        component={component}
        onSubmit={onSubmit}
        space="$4"
        {...props}
      >
        {children}
      </YStack>
    );
  }
);

Form.displayName = 'Form';
`;
        return { path: 'src/lib/ui/form.tsx', content };
    }
    generateModalComponent(config) {
        const content = `import { Sheet, SheetProps } from 'tamagui';
import { forwardRef } from 'react';

export interface ModalProps extends Omit<SheetProps, 'open'> {
  open: boolean;
  onClose: () => void;
  title?: string;
  actions?: React.ReactNode;
}

export const Modal = forwardRef<any, ModalProps>(
  ({ children, open, onClose, title, actions, ...props }, ref) => {
    return (
      <Sheet
        ref={ref}
        open={open}
        onOpenChange={(isOpen) => !isOpen && onClose()}
        {...props}
      >
        <Sheet.Frame>
          {title && <Sheet.Handle />}
          <Sheet.ScrollView>
            {title && <Sheet.Title>{title}</Sheet.Title>}
            <Sheet.Content>
              {children}
            </Sheet.Content>
            {actions && (
              <Sheet.Footer>
                {actions}
              </Sheet.Footer>
            )}
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>
    );
  }
);

Modal.displayName = 'Modal';
`;
        return { path: 'src/lib/ui/modal.tsx', content };
    }
    generateTableComponent(config) {
        const content = `import { YStack, XStack, Text } from 'tamagui';
import { forwardRef } from 'react';

export interface TableProps {
  headers?: string[];
  data?: any[][];
  children?: React.ReactNode;
}

export const Table = forwardRef<any, TableProps>(
  ({ children, headers, data, ...props }, ref) => {
    return (
      <YStack ref={ref} {...props}>
        {headers && (
          <XStack space="$2" padding="$2" backgroundColor="$gray2">
            {headers.map((header, index) => (
              <Text key={index} fontWeight="bold" flex={1}>{header}</Text>
            ))}
          </XStack>
        )}
        {data?.map((row, rowIndex) => (
          <XStack key={rowIndex} space="$2" padding="$2" borderBottomWidth={1} borderColor="$gray3">
            {row.map((cell, cellIndex) => (
              <Text key={cellIndex} flex={1}>{cell}</Text>
            ))}
          </XStack>
        ))}
        {children}
      </YStack>
    );
  }
);

Table.displayName = 'Table';
`;
        return { path: 'src/lib/ui/table.tsx', content };
    }
    generateNavigationComponent(config) {
        const content = `import { YStack, XStack, Text, Button } from 'tamagui';
import { forwardRef } from 'react';

export interface NavigationProps {
  title?: string;
  menuItems?: Array<{ label: string; href: string }>;
  children?: React.ReactNode;
}

export const Navigation = forwardRef<any, NavigationProps>(
  ({ title, menuItems, children, ...props }, ref) => {
    return (
      <YStack ref={ref} backgroundColor="$blue9" padding="$4" {...props}>
        <XStack justifyContent="space-between" alignItems="center">
          {title && (
            <Text color="white" fontSize="$6" fontWeight="bold">
              {title}
            </Text>
          )}
          <XStack space="$3">
            {menuItems?.map((item, index) => (
              <Button key={index} color="white" variant="outlined" href={item.href}>
                {item.label}
              </Button>
            ))}
            {children}
          </XStack>
        </XStack>
      </YStack>
    );
  }
);

Navigation.displayName = 'Navigation';
`;
        return { path: 'src/lib/ui/navigation.tsx', content };
    }
    generateSelectComponent(config) {
        const content = `import { Select, SelectProps } from 'tamagui';
import { forwardRef } from 'react';

export interface SelectProps extends SelectProps {
  label?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<any, SelectProps>(
  ({ label, options, children, ...props }, ref) => {
    return (
      <Select ref={ref} {...props}>
        <Select.Trigger>
          <Select.Value placeholder={label} />
        </Select.Trigger>
        <Select.Content>
          <Select.ScrollUpButton />
          <Select.Viewport>
            <Select.Group>
              {options?.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
              {children}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton />
        </Select.Content>
      </Select>
    );
  }
);

Select.displayName = 'Select';
`;
        return { path: 'src/lib/ui/select.tsx', content };
    }
    generateCheckboxComponent(config) {
        const content = `import { CheckBox, CheckBoxProps } from 'tamagui';
import { forwardRef } from 'react';

export interface CheckboxProps extends CheckBoxProps {
  label?: string;
}

export const Checkbox = forwardRef<any, CheckboxProps>(
  ({ label, ...props }, ref) => {
    return (
      <CheckBox ref={ref} {...props}>
        {label && <Text>{label}</Text>}
      </CheckBox>
    );
  }
);

Checkbox.displayName = 'Checkbox';
`;
        return { path: 'src/lib/ui/checkbox.tsx', content };
    }
    generateSwitchComponent(config) {
        const content = `import { Switch, SwitchProps } from 'tamagui';
import { forwardRef } from 'react';

export interface SwitchProps extends SwitchProps {
  label?: string;
}

export const Switch = forwardRef<any, SwitchProps>(
  ({ label, ...props }, ref) => {
    return (
      <Switch ref={ref} {...props}>
        {label && <Text>{label}</Text>}
      </Switch>
    );
  }
);

Switch.displayName = 'Switch';
`;
        return { path: 'src/lib/ui/switch.tsx', content };
    }
    generateBadgeComponent(config) {
        const content = `import { Badge, BadgeProps } from 'tamagui';
import { forwardRef } from 'react';

export interface BadgeProps extends BadgeProps {
  content?: string | number;
}

export const Badge = forwardRef<any, BadgeProps>(
  ({ children, content, ...props }, ref) => {
    return (
      <Badge ref={ref} {...props}>
        {content && <Text>{content}</Text>}
        {children}
      </Badge>
    );
  }
);

Badge.displayName = 'Badge';
`;
        return { path: 'src/lib/ui/badge.tsx', content };
    }
    generateAvatarComponent(config) {
        const content = `import { Avatar, AvatarProps } from 'tamagui';
import { forwardRef } from 'react';

export interface AvatarProps extends AvatarProps {
  src?: string;
  alt?: string;
}

export const Avatar = forwardRef<any, AvatarProps>(
  ({ children, src, alt, ...props }, ref) => {
    return (
      <Avatar ref={ref} {...props}>
        <Avatar.Image src={src} alt={alt} />
        <Avatar.Fallback>{children}</Avatar.Fallback>
      </Avatar>
    );
  }
);

Avatar.displayName = 'Avatar';
`;
        return { path: 'src/lib/ui/avatar.tsx', content };
    }
    generateAlertComponent(config) {
        const content = `import { YStack, Text } from 'tamagui';
import { forwardRef } from 'react';

export interface AlertProps {
  severity?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children?: React.ReactNode;
}

export const Alert = forwardRef<any, AlertProps>(
  ({ children, severity = 'info', title, ...props }, ref) => {
    const colors = {
      error: '$red9',
      warning: '$yellow9',
      info: '$blue9',
      success: '$green9'
    };

    return (
      <YStack
        ref={ref}
        backgroundColor={colors[severity]}
        padding="$4"
        borderRadius="$4"
        {...props}
      >
        {title && <Text color="white" fontWeight="bold" marginBottom="$2">{title}</Text>}
        <Text color="white">{children}</Text>
      </YStack>
    );
  }
);

Alert.displayName = 'Alert';
`;
        return { path: 'src/lib/ui/alert.tsx', content };
    }
    generateScripts(config) {
        return {
            'storybook': 'storybook dev -p 6006',
            'build-storybook': 'storybook build'
        };
    }
    generateEnvConfig(config) {
        return {
            'TAMAGUI_THEME_MODE': config.theme?.mode || ThemeOption.LIGHT,
            'TAMAGUI_ENABLE_ANIMATIONS': config.enableAnimations !== false ? 'true' : 'false'
        };
    }
}
//# sourceMappingURL=TamaguiGenerator.js.map