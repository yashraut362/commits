import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

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

export function DailyCheckIn() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    // Auto-advance to next question if not on the last question
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === questions.length) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setAnswers({});
        setCurrentQuestionIndex(0);
      }, 2000);
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

  if (submitted) {
    return (
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Check-in complete</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">See you tomorrow!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">Today's Check-in</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">Review yesterday and prepare for today</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2 italic">Answer honestly. This is for insight, not judgment.</p>
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
          <div
            className="h-full bg-green-600 dark:bg-[#3fb950] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Question */}
      <div className="min-h-20 flex flex-col justify-center py-4">
        <QuestionItem
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={handleAnswer}
          number={currentQuestionIndex + 1}
        />
      </div>

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
            disabled={!allAnswered}
            className={`px-5 py-2 rounded-md font-medium text-sm transition-colors ${allAnswered
              ? 'bg-green-600 dark:bg-[#3fb950] text-white cursor-pointer hover:bg-green-700 dark:hover:bg-[#2ea043]'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
          >
            Submit check-in
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
    </div>
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
              <button
                key={score}
                onClick={() => onChange(question.id, score)}
                className={`w-10 h-10 rounded-md border-2 transition-all text-sm cursor-pointer ${value === score
                  ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                  : 'border-gray-200 bg-white text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:border-gray-600'
                  }`}
              >
                {score}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 w-full sm:w-20 text-center sm:text-left">{question.rightLabel}</span>
        </div>
      </div>
    </div>
  );
}
