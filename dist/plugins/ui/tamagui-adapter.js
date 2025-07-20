/**
 * Tamagui Adapter
 *
 * Implements the UnifiedUI interface for Tamagui
 * Translates Tamagui's API to the unified interface
 */
export class TamaguiAdapter {
    tamaguiConfig;
    currentTheme = 'light';
    constructor(tamaguiConfig) {
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
        cn: (...classes) => {
            return classes.filter(Boolean).join(' ');
        },
        createVariant: (base, variants) => {
            return (variant) => `${base} ${variants[variant] || ''}`;
        },
        createComponent: (defaultProps) => {
            return (props) => ({ ...defaultProps, ...props });
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
        setTheme: (theme) => {
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
    createColorTokens() {
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
    createSpacingTokens() {
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
    createTypographyTokens() {
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
    createShadowTokens() {
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
    createRadiusTokens() {
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
    createBreakpointTokens() {
        return {
            sm: '$gtSm',
            md: '$gtMd',
            lg: '$gtLg',
            xl: '$gtXl',
            '2xl': '$gtXxl',
        };
    }
    createLightTheme() {
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
    createDarkTheme() {
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
    createButton() {
        return (props) => {
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
    createInput() {
        return (props) => {
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
    createCard() {
        return (props) => {
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
    createText() {
        return (props) => {
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
    createStack() {
        return (props) => {
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
    createBox() {
        return (props) => {
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
    createModal() {
        return (props) => {
            const { children, isOpen, onClose, title, size = 'md', className } = props;
            if (!isOpen)
                return null;
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
    createForm() {
        return (props) => {
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
    createSelect() {
        return (props) => {
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
    createCheckbox() {
        return (props) => {
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
    createRadio() {
        return (props) => {
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
    createSwitch() {
        return (props) => {
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
    createBadge() {
        return (props) => {
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
    createAvatar() {
        return (props) => {
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
    createAlert() {
        return (props) => {
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
    createToast() {
        return (props) => {
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
export function createTamaguiAdapter(tamaguiConfig) {
    return new TamaguiAdapter(tamaguiConfig);
}
//# sourceMappingURL=tamagui-adapter.js.map