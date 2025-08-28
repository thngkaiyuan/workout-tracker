import { state, today } from './state.js';

export const getTodaysWorkout = () => state.plans.find(plan => plan.dayOfWeek === today);
export const getPlanById = (id) => state.plans.find(p => p.id === id);

export function getLastWeight(exerciseName) {
    const record = state.workoutHistory.slice().reverse().find(r => r.exercise === exerciseName && r.type === 'reps');
    return record ? record.weight : 0;
}

export function getLastReps(exerciseName) {
    const record = state.workoutHistory.slice().reverse().find(r => r.exercise === exerciseName && r.type === 'reps');
    return record ? record.reps : null;
}

export function getLastDuration(exerciseName) {
    const record = state.workoutHistory.slice().reverse().find(r => r.exercise === exerciseName && r.type === 'time');
    return record ? record.duration : 0;
}

export function getWorkoutSessions(planId) {
    const sessions = state.workoutHistory
        .filter(record => record.planId === planId)
        .reduce((acc, record) => {
            // Use sessionId if available, otherwise group by date for legacy data
            const key = record.sessionId || new Date(record.date).toLocaleDateString();
            if (!acc[key]) {
                acc[key] = {
                    sessionId: record.sessionId, // Store sessionId
                    records: []
                };
            }
            acc[key].records.push(record);
            return acc;
        }, {});

    return Object.values(sessions)
        .map(session => {
            session.records.sort((a, b) => new Date(a.date) - new Date(b.date));
            const startTime = new Date(session.records[0].date);
            const lastRecord = session.records[session.records.length - 1];
            let endTime = new Date(lastRecord.date);

            // An active workout is one that has been paused. Its sessionId will be in savedWorkout.
            const isComplete = !(state.savedWorkout && state.savedWorkout.sessionId === session.sessionId);

            if (!isComplete) {
                endTime = null;
            }

            return { ...session, startTime, endTime, isComplete };
        })
        .sort((a, b) => b.startTime - a.startTime);
}
