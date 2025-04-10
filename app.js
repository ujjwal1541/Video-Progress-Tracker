/**
 * Main application script for video progress tracking
 * 
 * This script connects the VideoProgressTracker to the video element
 * and handles all UI updates and event listeners.
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const videoElement = document.getElementById('lecture-video');
    const progressPercentage = document.getElementById('progress-percentage');
    const uniqueProgressBar = document.getElementById('unique-progress');
    const videoTimeline = document.getElementById('video-timeline');
    const videoDurationElement = document.getElementById('video-duration');
    const uniqueWatchedElement = document.getElementById('unique-watched');
    const currentPositionElement = document.getElementById('current-position');
    
    // Create progress tracker instance
    const videoId = 'demo-lecture-1'; // In a real app, this would be a unique ID for each video
    const progressTracker = new VideoProgressTracker(videoId);
    
    // Format time in MM:SS format
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Update UI elements with current progress
    function updateProgressUI() {
        const percentage = progressTracker.getProgressPercentage();
        const uniqueSeconds = progressTracker.getUniqueSecondsWatched();
        
        progressPercentage.textContent = `${percentage}%`;
        uniqueProgressBar.style.width = `${percentage}%`;
        uniqueWatchedElement.textContent = `${uniqueSeconds} seconds (${formatTime(uniqueSeconds)})`;
        
        // Visualize watched segments on timeline
        progressTracker.visualizeWatchedIntervals(videoTimeline);
    }
    
    // Update current position display
    function updateCurrentPosition() {
        if (!videoElement.paused) {
            currentPositionElement.textContent = formatTime(videoElement.currentTime);
            requestAnimationFrame(updateCurrentPosition);
        }
    }
    
    // Initialize tracker once video metadata is loaded
    videoElement.addEventListener('loadedmetadata', () => {
        progressTracker.init(videoElement.duration);
        videoDurationElement.textContent = formatTime(videoElement.duration);
        
        // Resume from last position if available
        const resumePosition = progressTracker.getResumePosition();
        if (resumePosition > 0 && resumePosition < videoElement.duration - 5) {
            videoElement.currentTime = resumePosition;
        }
        
        updateProgressUI();
    });
    
    // Event: Video starts playing
    videoElement.addEventListener('play', () => {
        progressTracker.startWatching(videoElement.currentTime);
        updateCurrentPosition();
    });
    
    // Event: Video is paused
    videoElement.addEventListener('pause', () => {
        progressTracker.stopWatching();
        updateProgressUI();
    });
    
    // Event: Video has ended
    videoElement.addEventListener('ended', () => {
        progressTracker.stopWatching();
        updateProgressUI();
    });
    
    // Event: Video is being played (update current interval)
    videoElement.addEventListener('timeupdate', () => {
        progressTracker.updateWatching(videoElement.currentTime);
    });
    
    // Event: User seeks in the video
    videoElement.addEventListener('seeking', () => {
        progressTracker.handleSeek(videoElement.currentTime);
    });
    
    // Update progress UI when page is being closed
    window.addEventListener('beforeunload', () => {
        if (!videoElement.paused) {
            progressTracker.stopWatching();
        }
    });
    
    // Add reset button functionality
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Progress';
    resetButton.className = 'reset-button';
    resetButton.style.marginTop = '15px';
    resetButton.style.padding = '8px 15px';
    resetButton.style.backgroundColor = '#e74c3c';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    
    resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your progress for this video?')) {
            progressTracker.resetProgress();
            videoElement.currentTime = 0;
            updateProgressUI();
        }
    });
    
    document.querySelector('.stats-container').appendChild(resetButton);
    
    // Initial UI update
    updateProgressUI();
}); 