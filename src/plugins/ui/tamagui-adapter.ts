import type { 
  UnifiedUI, 
  ColorTokens, 
  SpacingTokens, 
  TypographyTokens, 
  ShadowTokens, 
  RadiusTokens, 
  BreakpointTokens,
  ThemeColors,
  ButtonProps,
  InputProps,
  CardProps,
  TextProps,
  StackProps,
  BoxProps,
  ModalProps,
  FormProps,
  SelectProps,
  CheckboxProps,
  RadioProps,
  SwitchProps,
  BadgeProps,
  AvatarProps,
  AlertProps,
  ToastProps,
  ComponentType
} from '../../types/unified';

/**
 * Tamagui Adapter
 * 
 * Implements the UnifiedUI interface for Tamagui
 * Translates Tamagui's API to the unified interface
 */
export class TamaguiAdapter implements UnifiedUI {
  private tamaguiConfig: any;
  private currentTheme: 'light' | 'dark' = 'light';

  constructor(tamaguiConfig: any) {
    this.tamaguiConfig = tamaguiConfig;
  }

  // Design tokens and theme
  tokens = {
    colors: this.createColorTokens(),
    spacing: this.createSpacingTokens(),
    typography: this.createTypographyTokens(),
    shadows: this.createShadowTokens(),
    radii: this.createRadiusTokens(),
    breakpoints: this.createBreakpointTokens(),
  };

  // Core UI components
  components = {
    Button: this.createButton(),
    Input: this.createInput(),
    Card: this.createCard(),
    Text: this.createText(),
    Stack: this.createStack(),
    Box: this.createBox(),
    Modal: this.createModal(),
    Form: this.createForm(),
    Select: this.createSelect(),
    Checkbox: this.createCheckbox(),
    Radio: this.createRadio(),
    Switch: this.createSwitch(),
    Badge: this.createBadge(),
    Avatar: this.createAvatar(),
    Alert: this.createAlert(),
    Toast: this.createToast(),
  };

  // Utility functions
  utils = {
    cn: (...classes: (string | undefined | null | false)[]) => {
      return classes.filter(Boolean).join(' ');
    },
    createVariant: (base: string, variants: Record<string, string>) => {
      return (variant: string) => `${base} ${variants[variant] || ''}`;
    },
    createComponent: <T extends Record<string, any>>(defaultProps: T) => {
      return (props: T) => ({ ...defaultProps, ...props });
    },
  };

  // Theme management
  theme = {
    light: this.createLightTheme(),
    dark: this.createDarkTheme(),
    current: this.currentTheme,
    switchTheme: () => {
      this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    },
    setTheme: (theme: 'light' | 'dark') => {
      this.currentTheme = theme;
    },
    useTheme: () => ({
      theme: this.currentTheme,
      toggle: () => this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light',
    }),
  };

  // Escape hatch for advanced use cases
  getUnderlyingTokens = () => this.tokens;
  getUnderlyingTheme = () => this.theme;

  // Token creation methods
  private createColorTokens(): ColorTokens {
    return {
      primary: '$blue10',
      secondary: '$gray10',
      accent: '$purple10',
      background: '$background',
      foreground: '$foreground',
      muted: '$gray5',
      mutedForeground: '$gray11',
      border: '$borderColor',
      input: '$borderColor',
      ring: '$blue8',
      destructive: '$red10',
      destructiveForeground: '$red1',
      success: '$green10',
      successForeground: '$green1',
      warning: '$yellow10',
      warningForeground: '$yellow1',
      info: '$blue10',
      infoForeground: '$blue1',
    };
  }

  private createSpacingTokens(): SpacingTokens {
    return {
      0: '$0',
      1: '$1',
      2: '$2',
      3: '$3',
      4: '$4',
      5: '$5',
      6: '$6',
      8: '$8',
      10: '$10',
      12: '$12',
      16: '$16',
      20: '$20',
      24: '$24',
      32: '$32',
      40: '$40',
      48: '$48',
      56: '$56',
      64: '$64',
    };
  }

  private createTypographyTokens(): TypographyTokens {
    return {
      fontFamily: {
        sans: '$body',
        serif: '$heading',
        mono: '$mono',
      },
      fontSize: {
        xs: '$1',
        sm: '$2',
        base: '$3',
        lg: '$4',
        xl: '$5',
        '2xl': '$6',
        '3xl': '$7',
        '4xl': '$8',
        '5xl': '$9',
        '6xl': '$10',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
    };
  }

  private createShadowTokens(): ShadowTokens {
    return {
      sm: '$shadowColor',
      base: '$shadowColor',
      md: '$shadowColor',
      lg: '$shadowColor',
      xl: '$shadowColor',
      '2xl': '$shadowColor',
      inner: '$shadowColor',
      none: 'transparent',
    };
  }

  private createRadiusTokens(): RadiusTokens {
    return {
      none: '$0',
      sm: '$1',
      base: '$2',
      md: '$3',
      lg: '$4',
      xl: '$5',
      '2xl': '$6',
      full: '$10',
    };
  }

  private createBreakpointTokens(): BreakpointTokens {
    return {
      sm: '$gtSm',
      md: '$gtMd',
      lg: '$gtLg',
      xl: '$gtXl',
      '2xl': '$gtXxl',
    };
  }

  private createLightTheme(): ThemeColors {
    return {
      background: '$background',
      foreground: '$foreground',
      primary: '$blue10',
      primaryForeground: '$blue1',
      secondary: '$gray10',
      secondaryForeground: '$gray1',
      muted: '$gray5',
      mutedForeground: '$gray11',
      accent: '$purple10',
      accentForeground: '$purple1',
      destructive: '$red10',
      destructiveForeground: '$red1',
      border: '$borderColor',
      input: '$borderColor',
      ring: '$blue8',
    };
  }

  private createDarkTheme(): ThemeColors {
    return {
      background: '$background',
      foreground: '$foreground',
      primary: '$blue10',
      primaryForeground: '$blue1',
      secondary: '$gray10',
      secondaryForeground: '$gray1',
      muted: '$gray5',
      mutedForeground: '$gray11',
      accent: '$purple10',
      accentForeground: '$purple1',
      destructive: '$red10',
      destructiveForeground: '$red1',
      border: '$borderColor',
      input: '$borderColor',
      ring: '$blue8',
    };
  }

  // Component factories
  private createButton(): ComponentType<ButtonProps> {
    return (props: ButtonProps) => {
      const { children, variant = 'default', size = 'default', disabled, loading, onClick, type = 'button', className } = props;
      
      const variantMap = {
        default: 'primary',
        destructive: 'red',
        outline: 'outlined',
        secondary: 'secondary',
        ghost: 'transparent',
        link: 'link',
      };

      const sizeMap = {
        default: 'medium',
        sm: 'small',
        lg: 'large',
        icon: 'small',
      };

      return {
        type: 'Button',
        props: {
          variant: variantMap[variant],
          size: sizeMap[size],
          disabled: disabled || loading,
          onPress: onClick,
          children: loading ? 'Loading...' : children,
          ...(className && { className }),
        },
      };
    };
  }

  private createInput(): ComponentType<InputProps> {
    return (props: InputProps) => {
      const { value, placeholder, type = 'text', disabled, error, onChange, onFocus, onBlur, className } = props;
      
      return {
        type: 'Input',
        props: {
          value,
          placeholder,
          type,
          disabled,
          borderColor: error ? '$red10' : '$borderColor',
          onChangeText: onChange,
          onFocus,
          onBlur,
          ...(className && { className }),
        },
      };
    };
  }

  private createCard(): ComponentType<CardProps> {
    return (props: CardProps) => {
      const { children, variant = 'default', padding = 'md', className } = props;
      
      const paddingMap = {
        none: '$0',
        sm: '$2',
        md: '$4',
        lg: '$6',
      };

      return {
        type: 'Card',
        props: {
          elevate: variant === 'default',
          bordered: variant === 'outline',
          padding: paddingMap[padding],
          children,
          ...(className && { className }),
        },
      };
    };
  }

  private createText(): ComponentType<TextProps> {
    return (props: TextProps) => {
      const { children, variant = 'p', size = 'base', weight = 'normal', color, className } = props;
      
      const sizeMap = {
        xs: '$1',
        sm: '$2',
        base: '$3',
        lg: '$4',
        xl: '$5',
        '2xl': '$6',
        '3xl': '$7',
        '4xl': '$8',
      };

      const weightMap = {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      };

      return {
        type: variant === 'p' ? 'Text' : variant.toUpperCase(),
        props: {
          fontSize: sizeMap[size],
          fontWeight: weightMap[weight],
          color: color || '$foreground',
          children,
          ...(className && { className }),
        },
      };
    };
  }

  private createStack(): ComponentType<StackProps> {
    return (props: StackProps) => {
      const { children, direction = 'vertical', spacing = '4', align = 'start', justify = 'start', className } = props;
      
      const directionMap = {
        horizontal: 'horizontal',
        vertical: 'vertical',
      };

      const alignMap = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        stretch: 'stretch',
      };

      const justifyMap = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        between: 'space-between',
        around: 'space-around',
      };

      return {
        type: 'Stack',
        props: {
          direction: directionMap[direction],
          space: spacing,
          alignItems: alignMap[align],
          justifyContent: justifyMap[justify],
          children,
          ...(className && { className }),
        },
      };
    };
  }

  private createBox(): ComponentType<BoxProps> {
    return (props: BoxProps) => {
      const { children, padding, margin, width, height, className } = props;
      
      return {
        type: 'Box',
        props: {
          padding,
          margin,
          width,
          height,
          children,
          ...(className && { className }),
        },
      };
    };
  }

  private createModal(): ComponentType<ModalProps> {
    return (props: ModalProps) => {
      const { children, isOpen, onClose, title, size = 'md', className } = props;
      
      if (!isOpen) return null;

      return {
        type: 'Sheet',
        props: {
          open: isOpen,
          onOpenChange: onClose,
          snapPoints: [size === 'full' ? 100 : 50],
          children: [
            title && { type: 'Text', props: { fontSize: '$6', fontWeight: 'bold', children: title } },
            { type: 'Box', props: { padding: '$4', children } },
          ],
          ...(className && { className }),
        },
      };
    };
  }

  private createForm(): ComponentType<FormProps> {
    return (props: FormProps) => {
      const { children, onSubmit, className } = props;
      
      return {
        type: 'Form',
        props: {
          onSubmit,
          children,
          ...(className && { className }),
        },
      };
    };
  }

  private createSelect(): ComponentType<SelectProps> {
    return (props: SelectProps) => {
      const { value, options, placeholder, disabled, onChange, className } = props;
      
      return {
        type: 'Select',
        props: {
          value,
          disabled,
          onValueChange: onChange,
          children: [
            placeholder && { type: 'SelectItem', props: { value: '', children: placeholder } },
            ...options.map(option => ({
              type: 'SelectItem',
              props: { value: option.value, children: option.label },
            })),
          ],
          ...(className && { className }),
        },
      };
    };
  }

  private createCheckbox(): ComponentType<CheckboxProps> {
    return (props: CheckboxProps) => {
      const { checked, disabled, onChange, label, className } = props;
      
      return {
        type: 'Stack',
        props: {
          direction: 'horizontal',
          alignItems: 'center',
          space: '$2',
          children: [
            {
              type: 'Checkbox',
              props: {
                checked,
                disabled,
                onCheckedChange: onChange,
              },
            },
            label && { type: 'Text', props: { children: label } },
          ],
          ...(className && { className }),
        },
      };
    };
  }

  private createRadio(): ComponentType<RadioProps> {
    return (props: RadioProps) => {
      const { value, options, disabled, onChange, className } = props;
      
      return {
        type: 'Stack',
        props: {
          direction: 'vertical',
          space: '$2',
          children: options.map(option => ({
            type: 'Stack',
            props: {
              direction: 'horizontal',
              alignItems: 'center',
              space: '$2',
              children: [
                {
                  type: 'RadioGroup',
                  props: {
                    value,
                    onValueChange: onChange,
                    disabled,
                    children: {
                      type: 'RadioGroupItem',
                      props: { value: option.value },
                    },
                  },
                },
                { type: 'Text', props: { children: option.label } },
              ],
            },
          })),
          ...(className && { className }),
        },
      };
    };
  }

  private createSwitch(): ComponentType<SwitchProps> {
    return (props: SwitchProps) => {
      const { checked, disabled, onChange, label, className } = props;
      
      return {
        type: 'Stack',
        props: {
          direction: 'horizontal',
          alignItems: 'center',
          space: '$2',
          children: [
            {
              type: 'Switch',
              props: {
                checked,
                disabled,
                onCheckedChange: onChange,
              },
            },
            label && { type: 'Text', props: { children: label } },
          ],
          ...(className && { className }),
        },
      };
    };
  }

  private createBadge(): ComponentType<BadgeProps> {
    return (props: BadgeProps) => {
      const { children, variant = 'default', size = 'default', className } = props;
      
      const variantMap = {
        default: 'primary',
        secondary: 'secondary',
        destructive: 'red',
        outline: 'outlined',
      };

      const sizeMap = {
        default: 'medium',
        sm: 'small',
        lg: 'large',
      };

      return {
        type: 'Badge',
        props: {
          variant: variantMap[variant],
          size: sizeMap[size],
          children,
          ...(className && { className }),
        },
      };
    };
  }

  private createAvatar(): ComponentType<AvatarProps> {
    return (props: AvatarProps) => {
      const { src, alt, fallback, size = 'md', className } = props;
      
      const sizeMap = {
        sm: '$4',
        md: '$5',
        lg: '$6',
        xl: '$8',
      };

      return {
        type: 'Avatar',
        props: {
          size: sizeMap[size],
          children: [
            src && {
              type: 'AvatarImage',
              props: { src, alt: alt || 'Avatar' },
            },
            (!src || fallback) && {
              type: 'AvatarFallback',
              props: { children: fallback || 'U' },
            },
          ],
          ...(className && { className }),
        },
      };
    };
  }

  private createAlert(): ComponentType<AlertProps> {
    return (props: AlertProps) => {
      const { children, variant = 'default', title, className } = props;
      
      const variantMap = {
        default: 'default',
        destructive: 'red',
        warning: 'yellow',
        info: 'blue',
      };

      return {
        type: 'Alert',
        props: {
          variant: variantMap[variant],
          children: [
            title && { type: 'AlertTitle', props: { children: title } },
            { type: 'AlertDescription', props: { children } },
          ],
          ...(className && { className }),
        },
      };
    };
  }

  private createToast(): ComponentType<ToastProps> {
    return (props: ToastProps) => {
      const { children, variant = 'default', title, duration = 5000, className } = props;
      
      const variantMap = {
        default: 'default',
        destructive: 'red',
        warning: 'yellow',
        info: 'blue',
      };

      return {
        type: 'Toast',
        props: {
          variant: variantMap[variant],
          duration,
          children: [
            title && { type: 'ToastTitle', props: { children: title } },
            { type: 'ToastDescription', props: { children } },
          ],
          ...(className && { className }),
        },
      };
    };
  }
}

/**
 * Factory function to create a Tamagui adapter
 */
export function createTamaguiAdapter(tamaguiConfig: any): UnifiedUI {
  return new TamaguiAdapter(tamaguiConfig);
} 