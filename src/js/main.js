import { state } from './state.js';
import { loadData } from './db.js';
import { render } from './ui.js';
import { initializeEventListeners } from './handlers.js';
import { registerServiceWorker } from './pwa.js';

function init() {
    registerServiceWorker();
    loadData();
    const initialView = window.location.hash.substring(1) || 'dashboard';
    state.currentView = initialView;
    history.replaceState({ view: initialView }, '', `#${initialView}`);
    render();
    initializeEventListeners();
}

init();
