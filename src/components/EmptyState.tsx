import { Sunrise } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-16">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <Sunrise className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your journey starts tomorrow</h3>
        <p className="text-sm text-gray-500">
          Complete your first check-in above to start tracking your productivity and building consistency.
        </p>
      </div>
    </div>
  );
}
