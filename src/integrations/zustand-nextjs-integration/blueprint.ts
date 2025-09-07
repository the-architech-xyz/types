import { Blueprint } from '../../types/adapter.js';

const zustandNextjsIntegrationBlueprint: Blueprint = {
  id: 'zustand-nextjs-integration',
  name: 'Zustand Next.js Integration',
  description: 'Complete state management integration for Next.js applications',
  version: '1.0.0',
  actions: [
    // Core Store Files
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/stores/index.ts',
      condition: '{{#if integration.features.authStore}}',
      content: `// Zustand Store Exports
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
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/stores/auth-store.ts',
      condition: '{{#if integration.features.authStore}}',
      content: `import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: (user: User) => {
          set({ 
            user, 
            isAuthenticated: true, 
            error: null 
          });
        },

        logout: () => {
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          });
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        updateUser: (userData: Partial<User>) => {
          const currentUser = get().user;
          if (currentUser) {
            set({ 
              user: { ...currentUser, ...userData } 
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/stores/ui-store.ts',
      condition: '{{#if integration.features.uiStore}}',
      content: `import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Modal states
  modals: {
    [key: string]: boolean;
  };
  
  // Loading states
  loading: {
    [key: string]: boolean;
  };
  
  // UI preferences
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Actions
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  setLoading: (key: string, loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  resetUI: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      modals: {},
      loading: {},
      sidebarOpen: false,
      mobileMenuOpen: false,

      openModal: (modalId: string) => {
        set((state) => ({
          modals: { ...state.modals, [modalId]: true }
        }));
      },

      closeModal: (modalId: string) => {
        set((state) => ({
          modals: { ...state.modals, [modalId]: false }
        }));
      },

      toggleModal: (modalId: string) => {
        set((state) => ({
          modals: { 
            ...state.modals, 
            [modalId]: !state.modals[modalId] 
          }
        }));
      },

      setLoading: (key: string, loading: boolean) => {
        set((state) => ({
          loading: { ...state.loading, [key]: loading }
        }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setMobileMenuOpen: (open: boolean) => {
        set({ mobileMenuOpen: open });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      toggleMobileMenu: () => {
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
      },

      resetUI: () => {
        set({
          modals: {},
          loading: {},
          sidebarOpen: false,
          mobileMenuOpen: false,
        });
      },
    }),
    {
      name: 'ui-store',
    }
  )
);
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/stores/theme-store.ts',
      condition: '{{#if integration.features.themeStore}}',
      content: `import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSystemTheme: (theme: 'light' | 'dark') => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'system',
        systemTheme: 'light',

        setTheme: (theme: Theme) => {
          set({ theme });
          
          // Apply theme to document
          const effectiveTheme = theme === 'system' ? get().systemTheme : theme;
          document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
        },

        toggleTheme: () => {
          const currentTheme = get().theme;
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        setSystemTheme: (systemTheme: 'light' | 'dark') => {
          set({ systemTheme });
          
          // If theme is set to system, update the effective theme
          if (get().theme === 'system') {
            document.documentElement.classList.toggle('dark', systemTheme === 'dark');
          }
        },

        getEffectiveTheme: () => {
          const { theme, systemTheme } = get();
          return theme === 'system' ? systemTheme : theme;
        },
      }),
      {
        name: 'theme-store',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    {
      name: 'theme-store',
    }
  )
);

// Initialize theme on client side
if (typeof window !== 'undefined') {
  const store = useThemeStore.getState();
  const effectiveTheme = store.getEffectiveTheme();
  document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
}
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/stores/notification-store.ts',
      condition: '{{#if integration.features.notificationStore}}',
      content: `import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

interface NotificationState {
  notifications: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  clearNotificationsByType: (type: Notification['type']) => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date(),
          duration: notification.duration || 5000,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));

        // Auto-remove notification after duration
        if (newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }

        return id;
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      clearNotificationsByType: (type: Notification['type']) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.type !== type)
        }));
      },
    }),
    {
      name: 'notification-store',
    }
  )
);
`
    }
  ]
};

export const blueprint = zustandNextjsIntegrationBlueprint;
