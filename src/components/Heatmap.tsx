import { useState } from 'react';
import { motion } from 'framer-motion';

interface HeatmapData {
  date: string;
  score: number;
}

function generateMockHeatmapData(): HeatmapData[] {
  const data: HeatmapData[] = [];
  const today = new Date();

  // Generate data for the past year
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random score between 0-5, with some days having no data (0)
    const hasData = Math.random() > 0.15; // 85% of days have data
    const score = hasData ? Math.floor(Math.random() * 5) + 1 : 0;

    data.push({
      date: date.toISOString().split('T')[0],
      score
    });
  }

  return data;
}

export function Heatmap({ hasExistingData }: { hasExistingData: boolean }) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null);
  const data = hasExistingData ? generateMockHeatmapData() : [];

  if (!hasExistingData) {
    return null;
  }

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
    if (score === 1) return 'bg-green-100 dark:bg-green-900/30';
    if (score === 2) return 'bg-green-200 dark:bg-green-800/40';
    if (score === 3) return 'bg-green-400 dark:bg-green-700/50';
    if (score === 4) return 'bg-green-500 dark:bg-green-600/60';
    return 'bg-green-600 dark:bg-green-500/70';
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
        <div className="flex flex-row items-center justify-center">
          <div className="inline-flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm ${getColor(day.score)} ${day.score !== -1 ? 'hover:ring-2 hover:ring-green-600 hover:ring-offset-1 cursor-pointer' : ''
                      } transition-all relative`}
                    onMouseEnter={() => day.score !== -1 && setHoveredCell(day)}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap pointer-events-none">
            {new Date(hoveredCell.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
            {hoveredCell.score > 0 && ` • Score: ${hoveredCell.score}/5`}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-6 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></div>
          <div className="w-3 h-3 rounded-sm bg-green-100"></div>
          <div className="w-3 h-3 rounded-sm bg-green-200"></div>
          <div className="w-3 h-3 rounded-sm bg-green-400"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500"></div>
          <div className="w-3 h-3 rounded-sm bg-green-600"></div>
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}
