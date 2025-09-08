import { create } from 'zustand';
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
