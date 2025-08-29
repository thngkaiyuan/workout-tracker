export const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const today = new Date().getDay();

export let state = {
    currentView: 'dashboard',
    plans: [],
    workoutHistory: [],
    currentWorkout: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    currentSessionId: null,
    savedWorkout: null, // Holds the state of a paused workout
    // Reps-based exercise state
    currentReps: 0,
    currentWeight: 0,
    // Time-based exercise state
    timerState: 'idle', // idle, running
    elapsedTime: 0, // The actual time elapsed in seconds
    timerInterval: null,
    lastDuration: 0, // The record to beat
    // Other state
    selectedPlan: null,
    editingExerciseId: null, // ID of the exercise being edited in the new plan
    newPlan: {
        name: '',
        dayOfWeek: today,
        exercises: []
    },
    newExercise: { name: '', type: 'reps', sets: 3, reps: 10, duration: 60 },
    editingRecordId: null,
    editingRecord: null,
};
