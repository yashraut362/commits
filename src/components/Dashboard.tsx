import { useState, useEffect } from 'react';
import { Header } from './Header';
import { DailyCheckIn } from './DailyCheckIn';
import { Heatmap } from './Heatmap';
import { QuickStats } from './QuickStats';
import { EmptyState } from './EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { getStats, getCheckInsInRange } from '@/services/checkInService';
import type { CheckInStats, CheckIn } from '@/types/checkIn';

export function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const username = user?.displayName || user?.email || 'User';

  // Fetch user data on mount
  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch stats
      const userStats = await getStats(user.uid);
      setStats(userStats);

      // Fetch last 365 days of check-ins for heatmap
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      const today = new Date();

      const userCheckIns = await getCheckInsInRange(
        user.uid,
        oneYearAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      setCheckIns(userCheckIns);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCheckInComplete = () => {
    // Refresh dashboard data after check-in
    fetchData();
  };

  const hasExistingData = stats !== null && stats.totalCheckIns > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117]">
      <Header username={username} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Daily Check-in Card */}
          <DailyCheckIn onComplete={handleCheckInComplete} />

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-green-600 dark:border-t-green-500 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Conditional rendering based on whether user has data */}
          {!loading && hasExistingData && stats && (
            <>
              {/* Quick Stats Row */}
              <QuickStats stats={stats} />

              {/* Productivity Heatmap */}
              <Heatmap checkIns={checkIns} />
            </>
          )}

          {/* Empty state */}
          {!loading && !hasExistingData && <EmptyState />}
        </div>
      </main>
    </div>
  );
}
