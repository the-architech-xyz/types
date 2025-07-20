import type { UnifiedUI, ColorTokens, SpacingTokens, TypographyTokens, ShadowTokens, RadiusTokens, BreakpointTokens, ThemeColors, ButtonProps, InputProps, CardProps, TextProps, StackProps, BoxProps, ModalProps, FormProps, SelectProps, CheckboxProps, RadioProps, SwitchProps, BadgeProps, AvatarProps, AlertProps, ToastProps, ComponentType } from '../../types/unified';
/**
 * Tamagui Adapter
 *
 * Implements the UnifiedUI interface for Tamagui
 * Translates Tamagui's API to the unified interface
 */
export declare class TamaguiAdapter implements UnifiedUI {
    private tamaguiConfig;
    private currentTheme;
    constructor(tamaguiConfig: any);
    tokens: {
        colors: ColorTokens;
        spacing: SpacingTokens;
        typography: TypographyTokens;
        shadows: ShadowTokens;
        radii: RadiusTokens;
        breakpoints: BreakpointTokens;
    };
    components: {
        Button: ComponentType<ButtonProps>;
        Input: ComponentType<InputProps>;
        Card: ComponentType<CardProps>;
        Text: ComponentType<TextProps>;
        Stack: ComponentType<StackProps>;
        Box: ComponentType<BoxProps>;
        Modal: ComponentType<ModalProps>;
        Form: ComponentType<FormProps>;
        Select: ComponentType<SelectProps>;
        Checkbox: ComponentType<CheckboxProps>;
        Radio: ComponentType<RadioProps>;
        Switch: ComponentType<SwitchProps>;
        Badge: ComponentType<BadgeProps>;
        Avatar: ComponentType<AvatarProps>;
        Alert: ComponentType<AlertProps>;
        Toast: ComponentType<ToastProps>;
    };
    utils: {
        cn: (...classes: (string | undefined | null | false)[]) => string;
        createVariant: (base: string, variants: Record<string, string>) => (variant: string) => string;
        createComponent: <T extends Record<string, any>>(defaultProps: T) => (props: T) => T;
    };
    theme: {
        light: ThemeColors;
        dark: ThemeColors;
        current: "light" | "dark";
        switchTheme: () => void;
        setTheme: (theme: "light" | "dark") => void;
        useTheme: () => {
            theme: "light" | "dark";
            toggle: () => "light" | "dark";
        };
    };
    getUnderlyingTokens: () => {
        colors: ColorTokens;
        spacing: SpacingTokens;
        typography: TypographyTokens;
        shadows: ShadowTokens;
        radii: RadiusTokens;
        breakpoints: BreakpointTokens;
    };
    getUnderlyingTheme: () => {
        light: ThemeColors;
        dark: ThemeColors;
        current: "light" | "dark";
        switchTheme: () => void;
        setTheme: (theme: "light" | "dark") => void;
        useTheme: () => {
            theme: "light" | "dark";
            toggle: () => "light" | "dark";
        };
    };
    private createColorTokens;
    private createSpacingTokens;
    private createTypographyTokens;
    private createShadowTokens;
    private createRadiusTokens;
    private createBreakpointTokens;
    private createLightTheme;
    private createDarkTheme;
    private createButton;
    private createInput;
    private createCard;
    private createText;
    private createStack;
    private createBox;
    private createModal;
    private createForm;
    private createSelect;
    private createCheckbox;
    private createRadio;
    private createSwitch;
    private createBadge;
    private createAvatar;
    private createAlert;
    private createToast;
}
/**
 * Factory function to create a Tamagui adapter
 */
export declare function createTamaguiAdapter(tamaguiConfig: any): UnifiedUI;
