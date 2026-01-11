import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { submitCheckIn, getTodayCheckIn, calculateStreak } from '@/services/checkInService';
import type { CheckInAnswers } from '@/types/checkIn';

interface Question {
  id: string;
  text: string;
  section: 'yesterday' | 'today';
  leftLabel: string;
  rightLabel: string;
}

const questions: Question[] = [
  {
    id: 'motivation',
    text: 'How motivated do you feel to work today?',
    section: 'today',
    leftLabel: 'Not motivated',
    rightLabel: 'Extremely motivated'
  },
  {
    id: 'energy',
    text: 'How energized do you feel right now?',
    section: 'today',
    leftLabel: 'Exhausted',
    rightLabel: 'Fully energized'
  },
  {
    id: 'clarity',
    text: 'How clear are you about today\'s goals?',
    section: 'today',
    leftLabel: 'Not clear at all',
    rightLabel: 'Crystal clear'
  },
  {
    id: 'execution',
    text: 'How much of what you planned yesterday did you actually deliver?',
    section: 'yesterday',
    leftLabel: 'Almost nothing',
    rightLabel: 'Almost everything'
  },
  {
    id: 'draining',
    text: 'How mentally draining was yesterday?',
    section: 'yesterday',
    leftLabel: 'Extremely draining',
    rightLabel: 'Not draining at all'
  }
];

export function DailyCheckIn({ onComplete }: { onComplete?: () => void }) {
  const { user } = useAuthStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load today's check-in on mount
  useEffect(() => {
    async function loadTodayCheckIn() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const todayCheckIn = await getTodayCheckIn(user.uid);

        if (todayCheckIn) {
          // Already submitted today - hide component
          setSubmitted(true);
          setCurrentStreak(todayCheckIn.currentStreak);
        } else {
          // Calculate current streak for new check-in
          const streak = await calculateStreak(user.uid);
          setCurrentStreak(streak);
        }
      } catch (err) {
        console.error('Error loading check-in:', err);
        setError('Failed to load today\'s check-in');
      } finally {
        setLoading(false);
      }
    }

    loadTodayCheckIn();
  }, [user]);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    // Auto-advance to next question if not on the last question
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length || !user) return;

    try {
      setSubmitting(true);
      setError(null);

      // Map answers to CheckInAnswers format
      const checkInAnswers: CheckInAnswers = {
        motivation: answers.motivation,
        energy: answers.energy,
        clarity: answers.clarity,
        execution: answers.execution,
        draining: answers.draining,
      };

      // Submit to Firestore
      const checkIn = await submitCheckIn(user.uid, checkInAnswers, currentStreak + 1);

      setCurrentStreak(checkIn.currentStreak);
      setShowSuccess(true);

      // Show success message for 2 seconds, then hide component
      setTimeout(() => {
        setSubmitted(true);
        setShowSuccess(false);
        // Trigger callback to refresh dashboard
        onComplete?.();
      }, 2000);
    } catch (err) {
      console.error('Error submitting check-in:', err);
      setError('Failed to submit check-in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const allAnswered = Object.keys(answers).length === questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-green-600 dark:border-t-green-500 rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-8 sm:p-12"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Check-in complete!</h3>
          {currentStreak > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              🔥 <span className="font-semibold">{currentStreak} day streak!</span>
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Hide component if already submitted today
  if (submitted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 transition-shadow hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/20"
    >
      <div className="mb-4">
        <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">Today's Check-in</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Review yesterday and prepare for today</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">Answer honestly. This is for insight, not judgment.</p>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span className="uppercase tracking-wider font-medium text-gray-400 dark:text-gray-500">
            {currentQuestion.section}
          </span>
        </div>
        <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-600 dark:bg-[#3fb950]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-20 flex flex-col justify-center py-4"
        >
          <QuestionItem
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={handleAnswer}
            number={currentQuestionIndex + 1}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${currentQuestionIndex === 0
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gray-900 dark:bg-gray-700 text-white cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600'
            }`}
        >
          Back
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className={`px-5 py-2 rounded-md font-medium text-sm transition-colors ${allAnswered && !submitting
              ? 'bg-green-600 dark:bg-[#3fb950] text-white cursor-pointer hover:bg-green-700 dark:hover:bg-[#2ea043]'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
          >
            {submitting ? 'Submitting...' : 'Submit check-in'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            disabled={!answers[currentQuestion.id]}
            className={`px-5 py-2 rounded-md font-medium text-sm transition-colors ${answers[currentQuestion.id]
              ? 'bg-gray-900 dark:bg-gray-700 text-white cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
          >
            Next
          </button>
        )}
      </div>
    </motion.div>
  );
}

function QuestionItem({
  question,
  value,
  onChange,
  number
}: {
  question: Question;
  value?: number;
  onChange: (id: string, value: number) => void;
  number: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">{number}.</span>
        <label className="text-sm text-gray-900 dark:text-gray-100 flex-1">{question.text}</label>
      </div>
      <div className="pl-0 sm:pl-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 w-full sm:w-20 text-center sm:text-right">{question.leftLabel}</span>
          <div className="flex gap-1.5 flex-1 justify-center">
            {[1, 2, 3, 4, 5].map((score) => (
              <motion.button
                key={score}
                onClick={() => onChange(question.id, score)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.1 }}
                className={`w-10 h-10 rounded-md border-2 transition-all text-sm cursor-pointer ${value === score
                  ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                  : 'border-gray-200 bg-white text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:border-gray-600'
                  }`}
              >
                {score}
              </motion.button>
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 w-full sm:w-20 text-center sm:text-left">{question.rightLabel}</span>
        </div>
      </div>
    </div>
  );
}
