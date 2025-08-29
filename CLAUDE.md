# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup

This is a vanilla JavaScript Progressive Web App (PWA) with no build process. Development can be done using any HTTP server.

**Local Development:**
- Use Python's built-in server: `python3 -m http.server 8000`
- Or Node.js http-server: `npx http-server -p 8000`
- Then open `http://localhost:8000` in your browser

## Architecture Overview

This is a client-side workout tracking PWA that stores data in localStorage. The app follows a modular architecture with clear separation of concerns:

### Core Modules (`src/js/`)

- **main.js**: Application entry point, initializes all modules
- **state.js**: Global application state management using a centralized state object
- **db.js**: localStorage abstraction layer with safe read/write operations
- **ui.js**: View rendering system that generates HTML based on current state
- **handlers.js**: Event handling and navigation logic
- **helpers.js**: Utility functions for data queries and business logic
- **pwa.js**: Service worker registration for PWA functionality

### State Management Pattern

The app uses a centralized state object (`state.js`) that contains:
- `currentView`: Current screen/page being displayed
- `plans`: Array of workout plans with exercises
- `workoutHistory`: Array of completed workout records
- `currentWorkout`: Active workout session state
- Workout session tracking (exercise/set indices, timer state, etc.)

### Navigation System

- Hash-based routing (`#dashboard`, `#plans`, etc.)
- State-driven rendering: changing `state.currentView` triggers `render()`
- History API integration for proper back/forward navigation
- Mobile-first navigation: back button navigates between app screens, only exits on main screen

### Data Persistence

All data is stored in localStorage using safe wrapper functions:
- `loadData()`: Loads all app data on startup
- `saveData()`: Persists state changes to localStorage
- Automatic error handling for storage quota issues

### Workout Session Management

Sessions are tracked with unique `sessionId` timestamps. Each workout record includes:
- Exercise name and type (reps/time-based)
- Set data (reps, weight, duration)
- Session grouping for workout history
- Plan association for progress tracking

## Key Features

- **Plan Management**: Create/edit workout plans with exercises that can be reordered, edited, and deleted during creation
- **Exercise Types**: Supports both rep & weight-based exercises and bodyweight/time-based exercises
- **Dashboard**: Easy access to launch today's scheduled workout or resume paused workouts
- **Workout Execution**: 
  - Real-time progress tracking with percentage completion
  - Smart value pre-population based on previous workout data (reps, weight)
  - Intuitive +/- buttons and direct input for quick value adjustments
  - Exercise list showing remaining exercises with current exercise highlighted
  - Motivational timer for time-based exercises encouraging users to beat previous durations
  - Flexible workout controls: complete exercise, save for later, or finish early
- **History Tracking**: Complete workout history with session grouping and edit/delete capabilities
- **PWA Capabilities**: Installable, works offline via service worker
- **Responsive Design**: Mobile-first using Tailwind CSS with proper navigation handling

## File Structure Notes

- `index.html`: Single-page app entry point using ES6 modules
- `manifest.json`: PWA configuration
- `service-worker.js`: Offline caching strategy
- `src/css/style.css`: Custom styles supplementing Tailwind CSS
- `src/assets/`: App icons for PWA installation

## Development Guidelines

### Documentation Updates
- Always update README.md when adding new features or changing user-facing functionality
- Keep the TODO list in both CLAUDE.md and README.md synchronized
- Update feature descriptions in both files when implementing new capabilities

### Testing
- Add tests when making changes to core functionality (state management, data persistence, UI rendering)
- Test manually across different devices and screen sizes
- Verify PWA functionality works offline
- No formal test framework is currently in place - testing is done manually via browser development tools

## TODOs

- Add tests for peace of mind development
  - [x] Set up Playwright testing framework
  - [ ] Test Dashboard & Navigation flow
  - [ ] Test Plan Creation flow  
  - [ ] Test Workout Execution flow
  - [ ] Test History & Data Persistence
  - [ ] Test PWA Functionality
- Add ability to edit/delete workout records
- Allow drag-and-drop reordering of exercises during workout plan creation
- Allow users to export all data to a file for backup/portability
- Allow users to import data from a file to restore on new device