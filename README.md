# Workout Tracker

A simple, offline-capable Progressive Web App for tracking your workouts. Create workout plans, execute them with guided assistance, and track your progress over time.

**🚀 [Try it now at https://thngkaiyuan.github.io/workout-tracker/](https://thngkaiyuan.github.io/workout-tracker/)**

## Features

✅ **Workout Plan Management**
- Create custom workout plans for different days of the week
- Support for both rep & weight-based exercises and bodyweight/time-based exercises
- Reorder, edit, and delete exercises during plan creation

✅ **Smart Workout Execution**
- Real-time progress tracking with percentage completion
- Auto-populated values based on your previous workouts (reps, weight)
- Easy +/- buttons or direct input for quick value adjustments
- Exercise list showing remaining exercises with current one highlighted
- Motivational timer for time-based exercises encouraging you to beat previous durations

✅ **Flexible Workout Controls**
- Complete exercises one set at a time
- Save workout progress and resume later
- Finish workouts early if needed

✅ **Workout History**
- Complete workout history organized by sessions
- View progress over time for each workout plan

✅ **Progressive Web App**
- Install on your phone like a native app
- Works offline once installed
- Mobile-optimized interface with proper navigation

## How to Use

### Getting Started
1. Visit [https://thngkaiyuan.github.io/workout-tracker/](https://thngkaiyuan.github.io/workout-tracker/)
2. Create your first workout plan by tapping "Add New Plan"
3. Add exercises with sets, reps, or duration
4. Save your plan

### During Workouts
1. From the dashboard, tap "Start" on today's workout or any available plan
2. Follow the guided interface for each exercise
3. The app will remember your previous reps and weights
4. Use +/- buttons or type directly to adjust values
5. Complete each set and move through your workout
6. Save progress anytime to resume later

### Workout History
- Tap on any workout plan to view your complete history
- See all previous sessions with detailed set information
- Track your progress over time

## Installation

### Install as PWA
1. Open [the app](https://thngkaiyuan.github.io/workout-tracker/) in your mobile browser
2. Look for "Add to Home Screen" or "Install App" option
3. The app will work offline once installed

### Run Locally (for development)
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

## Technical Details

Built with vanilla JavaScript, HTML, and CSS. Uses localStorage for data persistence and includes a service worker for offline functionality. Mobile-first design using Tailwind CSS.

For developers and contributors, see [CLAUDE.md](./CLAUDE.md) for detailed architecture information.

## Upcoming Features

- [ ] Add tests for peace of mind development
  - [x] Set up Playwright testing framework
  - [ ] Test Dashboard & Navigation flow
  - [ ] Test Plan Creation flow  
  - [ ] Test Workout Execution flow
  - [ ] Test History & Data Persistence
  - [ ] Test PWA Functionality
- [ ] Add ability to edit/delete workout records
- [ ] Allow drag-and-drop reordering of exercises during workout plan creation
- [ ] Allow users to export all data to a file for backup/portability
- [ ] Allow users to import data from a file to restore on new device

## Contributing

This project welcomes contributions! Please see [CLAUDE.md](./CLAUDE.md) for technical architecture details and development setup instructions.