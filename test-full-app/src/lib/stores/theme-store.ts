import { create } from 'zustand';
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
