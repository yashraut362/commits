import { Flame, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CheckInStats } from '@/types/checkIn';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  index: number;
}

function StatCard({ icon, label, value, subtitle, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-6 cursor-pointer transition-shadow hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/20"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-gray-400 dark:text-gray-500">{icon}</div>
      </div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      {subtitle && <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</div>}
    </motion.div>
  );
}

export function QuickStats({ stats }: { stats: CheckInStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Flame className="w-5 h-5" />}
        label="Current streak"
        value={stats.currentStreak === 0 ? '—' : `${stats.currentStreak} days`}
        index={0}
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Longest streak"
        value={stats.longestStreak === 0 ? '—' : `${stats.longestStreak} days`}
        index={1}
      />
      <StatCard
        icon={<Calendar className="w-5 h-5" />}
        label="7-day average"
        value={stats.sevenDayAverage === 0 ? '—' : stats.sevenDayAverage.toFixed(1)}
        subtitle={stats.sevenDayAverage > 0 ? "out of 5.0" : undefined}
        index={2}
      />
      <StatCard
        icon={<BarChart3 className="w-5 h-5" />}
        label="30-day average"
        value={stats.thirtyDayAverage === 0 ? '—' : stats.thirtyDayAverage.toFixed(1)}
        subtitle={stats.thirtyDayAverage > 0 ? "out of 5.0" : undefined}
        index={3}
      />
    </div>
  );
}
