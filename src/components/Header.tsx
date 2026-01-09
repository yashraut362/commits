import { User, LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useState } from 'react';

export function Header({ username }: { username: string }) {
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showDropdown, setShowDropdown] = useState(false);
  console.log(user?.photoURL, 'user')
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1117]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-3 sm:py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Commit</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Daily retrospective & intent</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Welcome {username}</p>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:cursor-pointer hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:cursor-pointer hover:bg-gray-700 transition-colors overflow-hidden"
              >
                {user?.photoURL ? (
                  <img
                    src={user?.photoURL}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161b22] rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                      {user?.photoURL && (
                        <img
                          src={user.photoURL}
                          alt={username}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1">{username}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:cursor-pointer hover:bg-gray-800 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
