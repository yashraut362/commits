import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const { signUp, signIn, signInWithGoogle, loading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      // Error is already handled in the store
      console.error('Auth error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      // Error is already handled in the store
      console.error('Google sign-in error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Commit</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Daily retrospective & intent</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isSignUp
                ? 'Start tracking your daily progress'
                : 'Sign in to continue your journey'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name field - only for sign up */}
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Yash Raut"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-[#0d1117] dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-[#0d1117] dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-[#0d1117] dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Forgot password - only for sign in */}
            {!isSignUp && (
              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:cursor-pointer hover:text-gray-200 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit" style="cursor: pointer"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-[#3fb950] dark:cursor-pointer hover:bg-[#2ea043] text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create account' : 'Sign in')}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-[#161b22] px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button" style="cursor: pointer"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </form>

          {/* Toggle between sign in and sign up */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className="text-green-600 dark:text-green-500 hover:text-green-700 dark:cursor-pointer hover:text-green-400 font-medium transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:cursor-pointer hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
