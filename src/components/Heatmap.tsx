import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CheckIn } from '@/types/checkIn';

interface HeatmapData {
  date: string;
  score: number;
}

export function Heatmap({ checkIns }: { checkIns: CheckIn[] }) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null);

  // Convert CheckIn[] to HeatmapData[] and fill in missing days
  const generateHeatmapData = (): HeatmapData[] => {
    const data: HeatmapData[] = [];
    const today = new Date();

    // Create a map of existing check-ins
    const checkInMap = new Map<string, number>();
    checkIns.forEach(checkIn => {
      checkInMap.set(checkIn.date, checkIn.averageScore);
    });

    // Generate data for the past year
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      data.push({
        date: dateStr,
        score: checkInMap.get(dateStr) || 0 // 0 means no check-in
      });
    }

    return data;
  };

  const data = generateHeatmapData();

  // Group data by weeks
  const weeks: HeatmapData[][] = [];
  let currentWeek: HeatmapData[] = [];

  // Pad the beginning to start on Sunday
  const firstDate = new Date(data[0].date);
  const firstDay = firstDate.getDay();
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: '', score: -1 });
  }

  data.forEach((day, index) => {
    currentWeek.push(day);
    const date = new Date(day.date);
    if (date.getDay() === 6 || index === data.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const getColor = (score: number) => {
    if (score === -1 || score === 0) return 'bg-gray-50 dark:bg-gray-800';
    if (score < 2) return 'bg-red-200 dark:bg-red-900/40';
    if (score < 3) return 'bg-orange-200 dark:bg-orange-900/40';
    if (score < 4) return 'bg-yellow-200 dark:bg-yellow-900/40';
    if (score < 4.5) return 'bg-green-200 dark:bg-green-800/40';
    return 'bg-green-400 dark:bg-green-600/60';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 md:p-8 transition-shadow hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/20"
    >
      <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Consistency over time</h2>

      <div className="relative">
        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex gap-0.5 sm:gap-1 min-w-full">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5 sm:gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-sm ${getColor(day.score)} ${day.score > 0 ? 'cursor-pointer hover:ring-2 hover:ring-green-500 dark:hover:ring-green-400' : ''
                      }`}
                    onMouseEnter={() => day.score > 0 && setHoveredCell(day)}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded shadow-lg whitespace-nowrap z-10">
            <div className="font-medium">{new Date(hoveredCell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div className="text-gray-300 dark:text-gray-600">Score: {hoveredCell.score.toFixed(1)}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 sm:mt-6 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></div>
          <div className="w-3 h-3 rounded-sm bg-red-200 dark:bg-red-900/40"></div>
          <div className="w-3 h-3 rounded-sm bg-orange-200 dark:bg-orange-900/40"></div>
          <div className="w-3 h-3 rounded-sm bg-yellow-200 dark:bg-yellow-900/40"></div>
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800/40"></div>
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600/60"></div>
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}
