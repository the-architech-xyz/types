// Zustand Store Exports
export { useAuthStore } from './auth-store';
export { useUIStore } from './ui-store';
export { useThemeStore } from './theme-store';
export { useNotificationStore } from './notification-store';

// Conditional exports based on enabled features
{{#if integration.features.cartStore}}
export { useCartStore } from './cart-store';
{{/if}}

{{#if integration.features.userStore}}
export { useUserStore } from './user-store';
{{/if}}

// Store utilities
export { createStore } from './hooks';
export { withPersistence } from './persistence';
export { withDevtools } from './middleware';

// SSR utilities
export { initializeStores, getServerState } from './ssr';
