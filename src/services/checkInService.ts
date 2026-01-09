import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CheckIn, CheckInAnswers, CheckInStats } from '@/types/checkIn';

const CHECK_INS_COLLECTION = 'check-ins';

/**
 * Calculate scores from answers with normalization
 */
function calculateScores(answers: CheckInAnswers) {
    // Normalize draining score (invert: 1 becomes 5, 5 becomes 1)
    const normalizedDraining = 6 - answers.draining;

    // Section scores
    const todayScore = (answers.motivation + answers.energy + answers.clarity) / 3;
    const yesterdayScore = (answers.execution + normalizedDraining) / 2;

    // Overall average (all 5 questions)
    const averageScore = (
        answers.motivation +
        answers.energy +
        answers.clarity +
        answers.execution +
        normalizedDraining
    ) / 5;

    return {
        averageScore: Number(averageScore.toFixed(2)),
        sections: {
            today: Number(todayScore.toFixed(2)),
            yesterday: Number(yesterdayScore.toFixed(2))
        }
    };
}

/**
 * Get date metadata
 */
function getDateMetadata(date: Date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    // Calculate week number
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    return {
        dayOfWeek: days[date.getDay()],
        weekNumber,
        month: months[date.getMonth()],
        year: date.getFullYear()
    };
}

/**
 * Submit or update a check-in
 */
export async function submitCheckIn(
    userId: string,
    answers: CheckInAnswers,
    currentStreak: number
): Promise<CheckIn> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Calculate scores
    const scores = calculateScores(answers);
    const metadata = getDateMetadata(today);

    // Create check-in document ID (userId_date)
    const checkInId = `${userId}_${dateStr}`;

    // Check if check-in already exists
    const checkInRef = doc(db, CHECK_INS_COLLECTION, checkInId);
    const existingDoc = await getDoc(checkInRef);

    const checkInData: Partial<CheckIn> = {
        userId,
        date: dateStr,
        answers,
        ...scores,
        ...metadata,
        currentStreak,
        updatedAt: serverTimestamp() as Timestamp,
    };

    if (existingDoc.exists()) {
        // Update existing check-in
        await setDoc(checkInRef, checkInData, { merge: true });
    } else {
        // Create new check-in
        await setDoc(checkInRef, {
            ...checkInData,
            createdAt: serverTimestamp(),
        });
    }

    // Fetch and return the created/updated document
    const updatedDoc = await getDoc(checkInRef);
    return {
        id: checkInId,
        ...updatedDoc.data(),
        timestamp: updatedDoc.data()?.createdAt || Timestamp.now(),
    } as CheckIn;
}

/**
 * Get today's check-in for a user
 */
export async function getTodayCheckIn(userId: string): Promise<CheckIn | null> {
    const today = new Date().toISOString().split('T')[0];
    const checkInId = `${userId}_${today}`;

    const checkInRef = doc(db, CHECK_INS_COLLECTION, checkInId);
    const checkInDoc = await getDoc(checkInRef);

    if (!checkInDoc.exists()) {
        return null;
    }

    return {
        id: checkInDoc.id,
        ...checkInDoc.data(),
    } as CheckIn;
}

/**
 * Get check-in for a specific date
 */
export async function getCheckInByDate(userId: string, date: string): Promise<CheckIn | null> {
    const checkInId = `${userId}_${date}`;
    const checkInRef = doc(db, CHECK_INS_COLLECTION, checkInId);
    const checkInDoc = await getDoc(checkInRef);

    if (!checkInDoc.exists()) {
        return null;
    }

    return {
        id: checkInDoc.id,
        ...checkInDoc.data(),
    } as CheckIn;
}

/**
 * Get check-ins in a date range (for heatmap)
 */
export async function getCheckInsInRange(
    userId: string,
    startDate: string,
    endDate: string
): Promise<CheckIn[]> {
    const q = query(
        collection(db, CHECK_INS_COLLECTION),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as CheckIn[];
}

/**
 * Calculate current streak
 */
export async function calculateStreak(userId: string): Promise<number> {
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    // Check backwards from today
    while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const checkIn = await getCheckInByDate(userId, dateStr);

        if (checkIn) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Get user statistics
 */
export async function getStats(userId: string): Promise<CheckInStats> {
    // Get all check-ins for the user
    const q = query(
        collection(db, CHECK_INS_COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const checkIns = querySnapshot.docs.map(doc => doc.data()) as CheckIn[];

    if (checkIns.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            totalCheckIns: 0,
            sevenDayAverage: 0,
            thirtyDayAverage: 0,
            lastCheckInDate: null,
        };
    }

    // Calculate current streak
    const currentStreak = await calculateStreak(userId);

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const checkIn of checkIns.reverse()) {
        const checkInDate = new Date(checkIn.date);

        if (!prevDate || (prevDate.getTime() - checkInDate.getTime()) === 86400000) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }

        prevDate = checkInDate;
    }

    // Calculate averages
    const last7Days = checkIns.slice(0, 7);
    const last30Days = checkIns.slice(0, 30);

    const sevenDayAverage = last7Days.length > 0
        ? last7Days.reduce((sum, c) => sum + c.averageScore, 0) / last7Days.length
        : 0;

    const thirtyDayAverage = last30Days.length > 0
        ? last30Days.reduce((sum, c) => sum + c.averageScore, 0) / last30Days.length
        : 0;

    return {
        currentStreak,
        longestStreak,
        totalCheckIns: checkIns.length,
        sevenDayAverage: Number(sevenDayAverage.toFixed(1)),
        thirtyDayAverage: Number(thirtyDayAverage.toFixed(1)),
        lastCheckInDate: checkIns[0]?.date || null,
    };
}
