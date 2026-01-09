import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const { resetPassword, loading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (err) {
      // Error is already handled in the store
      console.error('Password reset error:', err);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Commit</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily retrospective & intent</p>
          </div>

          {/* Success Card */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                We've sent you a password reset link. Please check your inbox and follow the instructions.
              </p>
              <Link
                to="/auth"
                className="text-sm text-green-600 cursor-pointer hover:text-green-700 font-medium transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Commit</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Daily retrospective & intent</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Reset your password</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your password
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
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit" style="cursor: pointer"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-[#3fb950] dark:cursor-pointer hover:bg-[#2ea043] text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>

          {/* Back to sign in */}
          <div className="mt-6 text-center">
            <Link
              to="/auth"
              className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:text-gray-100 transition-colors"
            >
              Remember your password? <span className="text-green-600 cursor-pointer hover:text-green-700 font-medium">Sign in</span>
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
