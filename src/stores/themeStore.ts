import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            theme: 'light',

            toggleTheme: () => {
                const newTheme = get().theme === 'light' ? 'dark' : 'light';
                set({ theme: newTheme });
                applyTheme(newTheme);
            },

            setTheme: (theme: Theme) => {
                set({ theme });
                applyTheme(theme);
            },
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                // Apply theme after rehydration from localStorage
                if (state) {
                    applyTheme(state.theme);
                }
            },
        }
    )
);

// Apply theme to document root
function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

// Initialize theme on app load
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
        try {
            const { state } = JSON.parse(stored);
            applyTheme(state.theme);
        } catch (e) {
            // Ignore parse errors
        }
    }
}
