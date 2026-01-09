import { useState } from 'react';
import { Header } from './Header';
import { DailyCheckIn } from './DailyCheckIn';
import { Heatmap } from './Heatmap';
import { QuickStats } from './QuickStats';
import { EmptyState } from './EmptyState';
import { useAuthStore } from '@/stores/authStore';

export function Dashboard() {
  // Toggle this to see the empty state vs. populated state
  const [hasExistingData] = useState(true);
  const { user } = useAuthStore();

  const username = user?.displayName || user?.email || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username={username} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Daily Check-in Card */}
          <DailyCheckIn />

          {/* Conditional rendering based on whether user has data */}
          {hasExistingData ? (
            <>
              {/* Quick Stats Row */}
              <QuickStats hasExistingData={hasExistingData} />

              {/* Productivity Heatmap */}
              <Heatmap hasExistingData={hasExistingData} />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}
