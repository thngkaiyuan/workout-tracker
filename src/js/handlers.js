import { state, today } from './state.js';
import { saveData } from './db.js';
import { render } from './ui.js';
import { getPlanById, getLastReps, getLastWeight, getLastDuration } from './helpers.js';

const app = document.getElementById('app');

function navigate(view) {
    // Don't push a new history entry if the view isn't changing
    if (state.currentView === view) return;

    if (state.currentView === 'workout' && state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    state.currentView = view;
    history.pushState({ view }, '', `#${view}`);
    render();
}

function startWorkout(planId) {
    const plan = getPlanById(planId);
    if (!plan || plan.exercises.length === 0) return;

    state.currentWorkout = plan;
    state.currentExerciseIndex = 0;
    state.currentSetIndex = 0;
    state.currentSessionId = Date.now();

    const firstExercise = plan.exercises[0];
    if (firstExercise.type === 'reps') {
        const lastReps = getLastReps(firstExercise.name);
        state.currentReps = lastReps !== null ? lastReps : firstExercise.reps;
        state.currentWeight = getLastWeight(firstExercise.name);
    } else {
        state.lastDuration = getLastDuration(firstExercise.name);
        state.elapsedTime = 0;
        state.timerState = 'idle';
    }

    // Clear any previously saved workout when starting a new one
    state.savedWorkout = null;
    saveData();

    navigate('workout');
}

function saveAndExitWorkout() {
    state.savedWorkout = {
        planId: state.currentWorkout.id,
        exerciseIndex: state.currentExerciseIndex,
        setIndex: state.currentSetIndex,
        sessionId: state.currentSessionId,
    };
    saveData();
    state.currentWorkout = null; // Exit the workout state
    navigate('dashboard');
}

function finishWorkoutEarly() {
    state.savedWorkout = null; // Clear any paused state
    saveData();
    navigate('workoutComplete');
}

function resumeWorkout() {
    if (!state.savedWorkout) return;

    const { planId, exerciseIndex, setIndex, sessionId } = state.savedWorkout;
    const plan = getPlanById(planId);
    if (!plan) {
        // The plan might have been deleted. Clear the saved state.
        state.savedWorkout = null;
        saveData();
        render();
        return;
    }

    state.currentWorkout = plan;
    state.currentExerciseIndex = exerciseIndex;
    state.currentSetIndex = setIndex;
    state.currentSessionId = sessionId;

    const currentExercise = plan.exercises[exerciseIndex];
    if (currentExercise.type === 'reps') {
        state.currentReps = currentExercise.reps;
        state.currentWeight = getLastWeight(currentExercise.name);
    } else {
        state.lastDuration = getLastDuration(currentExercise.name);
        state.elapsedTime = 0;
        state.timerState = 'idle';
    }

    state.savedWorkout = null;
    saveData();
    navigate('workout');
}

function viewPlanHistory(planId) {
    const plan = getPlanById(planId);
    if (!plan) return;

    state.selectedPlan = plan;
    navigate('planHistory');
}

function completeSet() {
    const currentExercise = state.currentWorkout.exercises[state.currentExerciseIndex];

    state.workoutHistory.push({
        date: new Date().toISOString(),
        exercise: currentExercise.name,
        set: state.currentSetIndex + 1,
        reps: state.currentReps,
        weight: state.currentWeight,
        planId: state.currentWorkout.id,
        sessionId: state.currentSessionId,
        type: 'reps'
    });
    saveData();
    moveToNext();
}

function startTimer() {
    state.timerState = 'running';
    const startTime = Date.now();

    state.timerInterval = setInterval(() => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        state.elapsedTime = elapsedSeconds;
        render();
    }, 100); // Update frequently for smooth decimal display
    render();
}

function stopTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.timerState = 'idle';

    const currentExercise = state.currentWorkout.exercises[state.currentExerciseIndex];
    const finalDuration = parseFloat(state.elapsedTime.toFixed(1)); // Save the final elapsed time

    state.workoutHistory.push({
        date: new Date().toISOString(),
        exercise: currentExercise.name,
        set: state.currentSetIndex + 1,
        duration: finalDuration,
        planId: state.currentWorkout.id,
        sessionId: state.currentSessionId,
        type: 'time'
    });
    saveData();
    moveToNext();
}

function moveToNext() {
    const workout = state.currentWorkout;
    const currentExercise = workout.exercises[state.currentExerciseIndex];

    if (state.currentSetIndex < currentExercise.sets - 1) {
        state.currentSetIndex++;
    } else if (state.currentExerciseIndex < workout.exercises.length - 1) {
        state.currentExerciseIndex++;
        state.currentSetIndex = 0;
    } else {
        navigate('workoutComplete');
        return;
    }

    const nextExercise = workout.exercises[state.currentExerciseIndex];
    if (nextExercise.type === 'reps') {
        const lastReps = getLastReps(nextExercise.name);
        state.currentReps = lastReps !== null ? lastReps : nextExercise.reps;
        state.currentWeight = getLastWeight(nextExercise.name);
    } else {
        state.lastDuration = getLastDuration(nextExercise.name);
        state.elapsedTime = 0; // Reset timer for next exercise
    }
    render();
}

function saveOrUpdateExercise() {
    if (!state.newExercise.name) return;

    if (state.editingExerciseId !== null) {
        // Update existing exercise
        const index = state.newPlan.exercises.findIndex(ex => ex.id === state.editingExerciseId);
        if (index !== -1) {
            state.newPlan.exercises[index] = { ...state.newExercise, id: state.editingExerciseId };
        }
    } else {
        // Add new exercise
        state.newPlan.exercises.push({ ...state.newExercise, id: Date.now() });
    }

    // Reset form and editing state
    state.editingExerciseId = null;
    state.newExercise = { name: '', type: 'reps', sets: 3, reps: 10, duration: 60 };
    render();
}

function deleteExercise(exerciseId) {
    state.newPlan.exercises = state.newPlan.exercises.filter(ex => ex.id !== exerciseId);
    // If the deleted exercise was being edited, cancel the edit mode.
    if (state.editingExerciseId === exerciseId) {
        cancelEdit();
    } else {
        render();
    }
}
function startEditExercise(exerciseId) {
    const exerciseToEdit = state.newPlan.exercises.find(ex => ex.id === exerciseId);
    if (exerciseToEdit) {
        state.editingExerciseId = exerciseId;
        state.newExercise = { ...exerciseToEdit };
        render();
        // Scroll the form into view for a better user experience
        app.querySelector('#add-exercise-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
function cancelEdit() {
    state.editingExerciseId = null;
    state.newExercise = { name: '', type: 'reps', sets: 3, reps: 10, duration: 60 };
    render();
}

function moveExercise(exerciseId, direction) {
    const exercises = state.newPlan.exercises;
    const index = exercises.findIndex(ex => ex.id === exerciseId);

    if (index === -1) return;

    if (direction === 'up' && index > 0) {
        [exercises[index - 1], exercises[index]] = [exercises[index], exercises[index - 1]];
    } else if (direction === 'down' && index < exercises.length - 1) {
        [exercises[index + 1], exercises[index]] = [exercises[index], exercises[index + 1]];
    }

    render();
}

function saveNewPlan() {
    if (state.newPlan.name && state.newPlan.exercises.length > 0) {
        state.plans.push({ ...state.newPlan, id: Date.now() });
        state.newPlan = { name: '', dayOfWeek: today, exercises: [] }; // Reset form
        saveData();
        navigate('dashboard');
    }
}

export function initializeEventListeners() {
    app.addEventListener('click', e => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const { action, id, direction } = target.dataset;

        const actions = {
            'navigate': () => navigate(id),
            'start-workout': () => startWorkout(parseInt(id)),
            'resume-workout': resumeWorkout,
            'view-plan-history': () => viewPlanHistory(parseInt(id)),
            'complete-set': completeSet,
            'start-timer': startTimer,
            'stop-timer': stopTimer,
            'add-exercise': saveOrUpdateExercise,
            'save-plan': saveNewPlan,
            'delete-exercise': () => deleteExercise(parseInt(id)),
            'move-exercise': () => moveExercise(parseInt(id), direction),
            'start-edit-exercise': () => startEditExercise(parseInt(id)),
            'cancel-edit': cancelEdit,
            'save-and-exit': saveAndExitWorkout,
            'finish-early': finishWorkoutEarly,
            'update-reps': () => {
                state.currentReps = Math.max(0, state.currentReps + parseInt(id));
                render();
            },
            'update-weight': () => {
                state.currentWeight = Math.max(0, state.currentWeight + parseInt(id));
                render();
            },
        };

        if (actions[action]) actions[action]();
    });

    app.addEventListener('input', e => {
        const { field } = e.target.dataset;
        const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;

        const fields = {
            'newPlanName': () => state.newPlan.name = value,
            'newPlanDay': () => state.newPlan.dayOfWeek = parseInt(value),
            'newExerciseName': () => state.newExercise.name = value,
            'newExerciseType': () => { state.newExercise.type = value; render(); },
            'newExerciseSets': () => state.newExercise.sets = value,
            'newExerciseReps': () => state.newExercise.reps = value,
            'newExerciseDuration': () => state.newExercise.duration = value,
            'currentReps': () => state.currentReps = value,
            'currentWeight': () => state.currentWeight = value,
        };

        if (fields[field]) fields[field]();
    });

    window.addEventListener('popstate', e => {
        if (state.currentView === 'workout' && state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }

        if (e.state && e.state.view) {
            state.currentView = e.state.view;
            render();
        } else {
            // Fallback to dashboard if state is null
            state.currentView = 'dashboard';
            render();
        }
    });
}
