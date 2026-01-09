import { Timestamp } from 'firebase/firestore';

export interface CheckInAnswers {
    motivation: number;    // 1-5: How motivated to work today
    energy: number;        // 1-5: How energized right now
    clarity: number;       // 1-5: How clear about today's goals
    execution: number;     // 1-5: How much of yesterday's plan delivered
    draining: number;      // 1-5: How mentally draining was yesterday (will be inverted)
}

export interface CheckInSections {
    today: number;         // Average of motivation, energy, clarity
    yesterday: number;     // Average of execution, draining (normalized)
}

export interface CheckIn {
    id: string;
    userId: string;
    date: string;          // "YYYY-MM-DD" format
    timestamp: Timestamp;

    // Individual answers
    answers: CheckInAnswers;

    // Calculated scores
    averageScore: number;  // Overall average (1-5)
    sections: CheckInSections;

    // Metadata
    dayOfWeek: string;     // "Monday", "Tuesday", etc.
    weekNumber: number;    // Week of year (1-52)
    month: string;         // "January", "February", etc.
    year: number;

    // Streak at time of submission
    currentStreak: number;

    // Timestamps
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CheckInStats {
    currentStreak: number;
    longestStreak: number;
    totalCheckIns: number;
    sevenDayAverage: number;
    thirtyDayAverage: number;
    lastCheckInDate: string | null;
}

// Helper type for creating a new check-in (without auto-generated fields)
export type CreateCheckInData = Omit<CheckIn, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>;
