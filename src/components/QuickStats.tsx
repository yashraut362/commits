import { Flame, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
}

function StatCard({ icon, label, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="text-gray-400 dark:text-gray-500">{icon}</div>
      </div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{label}</div>
      {subtitle && <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

export function QuickStats({ hasExistingData }: { hasExistingData: boolean }) {
  if (!hasExistingData) {
    return null;
  }

  // Mock data
  const stats = {
    currentStreak: 12,
    longestStreak: 28,
    sevenDayAvg: 3.8,
    thirtyDayAvg: 3.6
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Flame className="w-5 h-5" />}
        label="Current streak"
        value={`${stats.currentStreak} days`}
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Longest streak"
        value={`${stats.longestStreak} days`}
      />
      <StatCard
        icon={<Calendar className="w-5 h-5" />}
        label="7-day average"
        value={stats.sevenDayAvg.toFixed(1)}
        subtitle="out of 5.0"
      />
      <StatCard
        icon={<BarChart3 className="w-5 h-5" />}
        label="30-day average"
        value={stats.thirtyDayAvg.toFixed(1)}
        subtitle="out of 5.0"
      />
    </div>
  );
}
