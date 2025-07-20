/**
 * Shadcn/ui Adapter
 *
 * Implements the UnifiedUI interface for Shadcn/ui
 * Translates Shadcn/ui's API to the unified interface
 */
export class ShadcnAdapter {
    shadcnConfig;
    currentTheme = 'light';
    constructor(shadcnConfig) {
        this.shadcnConfig = shadcnConfig;
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
            primary: 'hsl(var(--primary))',
            secondary: 'hsl(var(--secondary))',
            accent: 'hsl(var(--accent))',
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            muted: 'hsl(var(--muted))',
            mutedForeground: 'hsl(var(--muted-foreground))',
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
            destructive: 'hsl(var(--destructive))',
            destructiveForeground: 'hsl(var(--destructive-foreground))',
            success: 'hsl(var(--success))',
            successForeground: 'hsl(var(--success-foreground))',
            warning: 'hsl(var(--warning))',
            warningForeground: 'hsl(var(--warning-foreground))',
            info: 'hsl(var(--info))',
            infoForeground: 'hsl(var(--info-foreground))',
        };
    }
    createSpacingTokens() {
        return {
            0: '0px',
            1: '0.25rem',
            2: '0.5rem',
            3: '0.75rem',
            4: '1rem',
            5: '1.25rem',
            6: '1.5rem',
            8: '2rem',
            10: '2.5rem',
            12: '3rem',
            16: '4rem',
            20: '5rem',
            24: '6rem',
            32: '8rem',
            40: '10rem',
            48: '12rem',
            56: '14rem',
            64: '16rem',
        };
    }
    createTypographyTokens() {
        return {
            fontFamily: {
                sans: 'ui-sans-serif, system-ui, sans-serif',
                serif: 'ui-serif, Georgia, serif',
                mono: 'ui-monospace, SFMono-Regular, monospace',
            },
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem',
                '5xl': '3rem',
                '6xl': '3.75rem',
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
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
            none: '0 0 #0000',
        };
    }
    createRadiusTokens() {
        return {
            none: '0px',
            sm: '0.125rem',
            base: '0.25rem',
            md: '0.375rem',
            lg: '0.5rem',
            xl: '0.75rem',
            '2xl': '1rem',
            full: '9999px',
        };
    }
    createBreakpointTokens() {
        return {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        };
    }
    createLightTheme() {
        return {
            background: 'hsl(0 0% 100%)',
            foreground: 'hsl(222.2 84% 4.9%)',
            primary: 'hsl(222.2 47.4% 11.2%)',
            primaryForeground: 'hsl(210 40% 98%)',
            secondary: 'hsl(210 40% 96%)',
            secondaryForeground: 'hsl(222.2 47.4% 11.2%)',
            muted: 'hsl(210 40% 96%)',
            mutedForeground: 'hsl(215.4 16.3% 46.9%)',
            accent: 'hsl(210 40% 96%)',
            accentForeground: 'hsl(222.2 47.4% 11.2%)',
            destructive: 'hsl(0 84.2% 60.2%)',
            destructiveForeground: 'hsl(210 40% 98%)',
            border: 'hsl(214.3 31.8% 91.4%)',
            input: 'hsl(214.3 31.8% 91.4%)',
            ring: 'hsl(222.2 84% 4.9%)',
        };
    }
    createDarkTheme() {
        return {
            background: 'hsl(222.2 84% 4.9%)',
            foreground: 'hsl(210 40% 98%)',
            primary: 'hsl(210 40% 98%)',
            primaryForeground: 'hsl(222.2 47.4% 11.2%)',
            secondary: 'hsl(217.2 32.6% 17.5%)',
            secondaryForeground: 'hsl(210 40% 98%)',
            muted: 'hsl(217.2 32.6% 17.5%)',
            mutedForeground: 'hsl(215 20.2% 65.1%)',
            accent: 'hsl(217.2 32.6% 17.5%)',
            accentForeground: 'hsl(210 40% 98%)',
            destructive: 'hsl(0 62.8% 30.6%)',
            destructiveForeground: 'hsl(210 40% 98%)',
            border: 'hsl(217.2 32.6% 17.5%)',
            input: 'hsl(217.2 32.6% 17.5%)',
            ring: 'hsl(212.7 26.8% 83.9%)',
        };
    }
    // Component factories
    createButton() {
        return (props) => {
            const { children, variant = 'default', size = 'default', disabled, loading, onClick, type = 'button', className } = props;
            const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
            const variantClasses = {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'underline-offset-4 hover:underline text-primary',
            };
            const sizeClasses = {
                default: 'h-10 py-2 px-4',
                sm: 'h-9 px-3 rounded-md',
                lg: 'h-11 px-8 rounded-md',
                icon: 'h-10 w-10',
            };
            return {
                type: 'button',
                className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`,
                disabled: disabled || loading,
                onClick,
                buttonType: type,
                children: loading ? 'Loading...' : children,
            };
        };
    }
    createInput() {
        return (props) => {
            const { value, placeholder, type = 'text', disabled, error, onChange, onFocus, onBlur, className } = props;
            const baseClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
            return {
                type: 'input',
                className: `${baseClasses} ${error ? 'border-destructive' : ''} ${className || ''}`,
                value,
                placeholder,
                inputType: type,
                disabled,
                onChange: (e) => onChange?.(e.target.value),
                onFocus,
                onBlur,
            };
        };
    }
    createCard() {
        return (props) => {
            const { children, variant = 'default', padding = 'md', className } = props;
            const baseClasses = 'rounded-lg border bg-card text-card-foreground shadow-sm';
            const paddingClasses = {
                none: '',
                sm: 'p-3',
                md: 'p-6',
                lg: 'p-8',
            };
            return {
                type: 'div',
                className: `${baseClasses} ${paddingClasses[padding]} ${className || ''}`,
                children,
            };
        };
    }
    createText() {
        return (props) => {
            const { children, variant = 'p', size = 'base', weight = 'normal', color, className } = props;
            const sizeClasses = {
                xs: 'text-xs',
                sm: 'text-sm',
                base: 'text-base',
                lg: 'text-lg',
                xl: 'text-xl',
                '2xl': 'text-2xl',
                '3xl': 'text-3xl',
                '4xl': 'text-4xl',
            };
            const weightClasses = {
                light: 'font-light',
                normal: 'font-normal',
                medium: 'font-medium',
                semibold: 'font-semibold',
                bold: 'font-bold',
            };
            return {
                type: variant,
                className: `${sizeClasses[size]} ${weightClasses[weight]} ${color ? `text-${color}` : ''} ${className || ''}`,
                children,
            };
        };
    }
    createStack() {
        return (props) => {
            const { children, direction = 'vertical', spacing = '4', align = 'start', justify = 'start', className } = props;
            const directionClasses = {
                horizontal: 'flex-row',
                vertical: 'flex-col',
            };
            const alignClasses = {
                start: 'items-start',
                center: 'items-center',
                end: 'items-end',
                stretch: 'items-stretch',
            };
            const justifyClasses = {
                start: 'justify-start',
                center: 'justify-center',
                end: 'justify-end',
                between: 'justify-between',
                around: 'justify-around',
            };
            return {
                type: 'div',
                className: `flex ${directionClasses[direction]} ${alignClasses[align]} ${justifyClasses[justify]} gap-${spacing} ${className || ''}`,
                children,
            };
        };
    }
    createBox() {
        return (props) => {
            const { children, padding, margin, width, height, className } = props;
            const style = {};
            if (padding)
                style.padding = typeof padding === 'number' ? `${padding}rem` : padding;
            if (margin)
                style.margin = typeof margin === 'number' ? `${margin}rem` : margin;
            if (width)
                style.width = typeof width === 'number' ? `${width}rem` : width;
            if (height)
                style.height = typeof height === 'number' ? `${height}rem` : height;
            return {
                type: 'div',
                className: className || '',
                style,
                children,
            };
        };
    }
    createModal() {
        return (props) => {
            const { children, isOpen, onClose, title, size = 'md', className } = props;
            if (!isOpen)
                return null;
            const sizeClasses = {
                sm: 'max-w-sm',
                md: 'max-w-md',
                lg: 'max-w-lg',
                xl: 'max-w-xl',
                full: 'max-w-full',
            };
            return {
                type: 'div',
                className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
                children: [
                    {
                        type: 'div',
                        className: `bg-background rounded-lg shadow-lg ${sizeClasses[size]} ${className || ''}`,
                        children: [
                            title && { type: 'h2', className: 'text-lg font-semibold p-6 pb-0', children: title },
                            { type: 'div', className: 'p-6', children },
                        ],
                    },
                ],
            };
        };
    }
    createForm() {
        return (props) => {
            const { children, onSubmit, className } = props;
            return {
                type: 'form',
                className: `space-y-4 ${className || ''}`,
                onSubmit: (e) => {
                    e.preventDefault();
                    onSubmit?.(new FormData(e.target));
                },
                children,
            };
        };
    }
    createSelect() {
        return (props) => {
            const { value, options, placeholder, disabled, onChange, className } = props;
            return {
                type: 'select',
                className: `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`,
                value,
                disabled,
                onChange: (e) => onChange?.(e.target.value),
                children: [
                    placeholder && { type: 'option', value: '', children: placeholder },
                    ...options.map(option => ({
                        type: 'option',
                        value: option.value,
                        children: option.label,
                    })),
                ],
            };
        };
    }
    createCheckbox() {
        return (props) => {
            const { checked, disabled, onChange, label, className } = props;
            return {
                type: 'label',
                className: `flex items-center space-x-2 ${className || ''}`,
                children: [
                    {
                        type: 'input',
                        inputType: 'checkbox',
                        checked,
                        disabled,
                        onChange: (e) => onChange?.(e.target.checked),
                        className: 'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
                    },
                    label && { type: 'span', className: 'text-sm', children: label },
                ],
            };
        };
    }
    createRadio() {
        return (props) => {
            const { value, options, disabled, onChange, className } = props;
            return {
                type: 'div',
                className: `space-y-2 ${className || ''}`,
                children: options.map(option => ({
                    type: 'label',
                    className: 'flex items-center space-x-2',
                    children: [
                        {
                            type: 'input',
                            inputType: 'radio',
                            name: 'radio-group',
                            value: option.value,
                            checked: value === option.value,
                            disabled,
                            onChange: (e) => onChange?.(e.target.value),
                            className: 'h-4 w-4 border-gray-300 text-primary focus:ring-primary',
                        },
                        { type: 'span', className: 'text-sm', children: option.label },
                    ],
                })),
            };
        };
    }
    createSwitch() {
        return (props) => {
            const { checked, disabled, onChange, label, className } = props;
            return {
                type: 'label',
                className: `flex items-center space-x-2 ${className || ''}`,
                children: [
                    {
                        type: 'button',
                        className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
                        onClick: () => !disabled && onChange?.(!checked),
                        children: {
                            type: 'span',
                            className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`,
                        },
                    },
                    label && { type: 'span', className: 'text-sm', children: label },
                ],
            };
        };
    }
    createBadge() {
        return (props) => {
            const { children, variant = 'default', size = 'default', className } = props;
            const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
            const variantClasses = {
                default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
                secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
                outline: 'text-foreground',
            };
            const sizeClasses = {
                default: 'px-2.5 py-0.5 text-xs',
                sm: 'px-2 py-0.5 text-xs',
                lg: 'px-3 py-1 text-sm',
            };
            return {
                type: 'span',
                className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`,
                children,
            };
        };
    }
    createAvatar() {
        return (props) => {
            const { src, alt, fallback, size = 'md', className } = props;
            const sizeClasses = {
                sm: 'h-8 w-8',
                md: 'h-10 w-10',
                lg: 'h-12 w-12',
                xl: 'h-16 w-16',
            };
            return {
                type: 'div',
                className: `relative flex ${sizeClasses[size]} shrink-0 overflow-hidden rounded-full ${className || ''}`,
                children: [
                    src && {
                        type: 'img',
                        src,
                        alt: alt || 'Avatar',
                        className: 'aspect-square h-full w-full',
                    },
                    (!src || fallback) && {
                        type: 'div',
                        className: 'flex h-full w-full items-center justify-center rounded-full bg-muted',
                        children: fallback || 'U',
                    },
                ],
            };
        };
    }
    createAlert() {
        return (props) => {
            const { children, variant = 'default', title, className } = props;
            const baseClasses = 'relative w-full rounded-lg border p-4';
            const variantClasses = {
                default: 'bg-background text-foreground',
                destructive: 'border-destructive/50 text-destructive dark:border-destructive',
                warning: 'border-yellow-500/50 text-yellow-700 dark:text-yellow-300',
                info: 'border-blue-500/50 text-blue-700 dark:text-blue-300',
            };
            return {
                type: 'div',
                className: `${baseClasses} ${variantClasses[variant]} ${className || ''}`,
                children: [
                    title && { type: 'h5', className: 'mb-1 font-medium leading-none tracking-tight', children: title },
                    { type: 'div', className: 'text-sm', children },
                ],
            };
        };
    }
    createToast() {
        return (props) => {
            const { children, variant = 'default', title, duration = 5000, className } = props;
            const baseClasses = 'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all';
            const variantClasses = {
                default: 'bg-background border',
                destructive: 'destructive border-destructive bg-destructive text-destructive-foreground',
                warning: 'border-yellow-500/50 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
                info: 'border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
            };
            return {
                type: 'div',
                className: `${baseClasses} ${variantClasses[variant]} ${className || ''}`,
                children: [
                    { type: 'div', className: 'grid gap-1', children: [
                            title && { type: 'div', className: 'text-sm font-semibold', children: title },
                            { type: 'div', className: 'text-sm opacity-90', children },
                        ] },
                    { type: 'button', className: 'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100', children: '×' },
                ],
            };
        };
    }
}
/**
 * Factory function to create a Shadcn/ui adapter
 */
export function createShadcnAdapter(shadcnConfig) {
    return new ShadcnAdapter(shadcnConfig);
}
//# sourceMappingURL=shadcn-adapter.js.map