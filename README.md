# Smart Video Progress Tracker

A system that accurately tracks a user's progress through educational video content by monitoring unique segments watched, preventing credit for skipped content, and providing a seamless resume experience.

## Features

- **True Progress Tracking**: Only counts unique segments of video that have actually been watched
- **Skipping Prevention**: Does not give credit for skipped sections of the video
- **Interval Tracking**: Keeps record of exactly which parts of the video have been watched
- **Progress Visualization**: Shows which parts of the video have been watched on a timeline
- **Persistent Storage**: Saves progress to local storage so users can continue where they left off
- **Resume Functionality**: Automatically resumes from the last watched position

## Demo

Open `index.html` in your browser to see the demo in action. The sample video automatically loads, and you can:
- Play/pause the video to see progress tracking in action
- Skip around to see how only newly watched segments count toward progress
- Refresh the page to see how progress is saved and the video resumes from where you left off
- Reset your progress using the "Reset Progress" button

## Technical Implementation

### Core Components

1. **VideoProgressTracker (progress-tracker.js)**
   - Tracks intervals of video that have been watched
   - Merges overlapping intervals to calculate unique progress
   - Persists progress to local storage
   - Provides methods to calculate and visualize progress

2. **Main Application (app.js)**
   - Connects the tracker to video player events
   - Updates the UI with current progress
   - Handles user interactions like seeking and resetting progress

### How It Works

1. **Interval Tracking**
   - When the video plays, we create an interval with start and end times
   - When the video pauses or the user seeks, we save the current interval
   - Intervals are stored as `{start: number, end: number}` objects

2. **Merging Intervals**
   - We sort all intervals by start time
   - We merge overlapping intervals to avoid counting the same parts twice
   - The merged intervals represent unique parts of the video that have been watched

3. **Progress Calculation**
   - Unique progress = (total seconds of merged intervals) / (total video duration) * 100
   - This ensures only unique content contributes to progress percentage

4. **Data Persistence**
   - We use `localStorage` to save the watched intervals and resume position
   - When the page loads, we restore this data and resume the video accordingly

### Example Interval Merging

If a user watches:
- 0-20 seconds
- 15-30 seconds
- 50-60 seconds

The merged intervals would be:
- 0-30 seconds (0-20 and 15-30 merge into one interval)
- 50-60 seconds

Total unique seconds watched: 40 seconds

## Browser Support

This implementation uses standard HTML5 video and JavaScript features:
- HTML5 Video API
- ES6 Classes
- Local Storage API

It should work on all modern browsers (Chrome, Firefox, Safari, Edge).

## Setup

1. Clone this repository
2. Open `index.html` in your browser
3. No build steps or server required!

## Customization

To use this with your own videos:
1. Change the video source in `index.html`
2. Update the `videoId` in `app.js` to a unique identifier for your video

## License

MIT 