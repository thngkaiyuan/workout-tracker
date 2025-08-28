import { state } from './state.js';

function safeGetItem(key) { try { return localStorage.getItem(key); } catch (e) { console.warn(e); return null; } }
function safeSetItem(key, value) { try { localStorage.setItem(key, value); } catch (e) { console.warn(e); } }

export function loadData() {
    const savedPlans = safeGetItem('workoutPlans');
    if (savedPlans) state.plans = JSON.parse(savedPlans);

    const savedHistory = safeGetItem('workoutHistory');
    if (savedHistory) state.workoutHistory = JSON.parse(savedHistory);

    const savedWorkout = safeGetItem('savedWorkout');
    if (savedWorkout) state.savedWorkout = JSON.parse(savedWorkout);
}

export function saveData() {
    safeSetItem('workoutPlans', JSON.stringify(state.plans));
    safeSetItem('workoutHistory', JSON.stringify(state.workoutHistory));
    if (state.savedWorkout) {
        safeSetItem('savedWorkout', JSON.stringify(state.savedWorkout));
    } else {
        try { localStorage.removeItem('savedWorkout'); } catch (e) { console.warn(e); }
    }
}
