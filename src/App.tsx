import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './components/auth/Auth';
import { Dashboard } from './components/Dashboard';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { useAuthStore } from './stores/authStore';

export default function App() {
  const { user, initialized } = useAuthStore();

  // Show loading spinner while checking auth state
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!user;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />}
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
