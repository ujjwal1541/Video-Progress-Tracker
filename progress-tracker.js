/**
 * VideoProgressTracker - Tracks unique video progress by managing watched intervals
 * 
 * This module handles:
 * 1. Tracking intervals of video that have been watched
 * 2. Merging overlapping intervals to calculate unique progress
 * 3. Persisting progress to local storage
 * 4. Calculating percentage of unique content watched
 */
class VideoProgressTracker {
    constructor(videoId) {
        this.videoId = videoId;
        this.watchedIntervals = [];
        this.currentInterval = null;
        this.totalDuration = 0;
        this.isWatching = false;
        this.lastUpdateTime = 0;
        this.updateFrequency = 1000; // Update progress every 1 second
        
        // Load saved progress if any
        this.loadProgress();
    }
    
    /**
     * Initialize the tracker with video duration
     * @param {number} duration - Total video duration in seconds
     */
    init(duration) {
        this.totalDuration = duration;
    }
    
    /**
     * Start tracking a new interval when video starts playing
     * @param {number} startTime - Current video position in seconds
     */
    startWatching(startTime) {
        if (!this.isWatching) {
            this.isWatching = true;
            this.currentInterval = {
                start: startTime,
                end: startTime
            };
            this.lastUpdateTime = Date.now();
        }
    }
    
    /**
     * Update the current watching interval
     * @param {number} currentTime - Current video position in seconds
     */
    updateWatching(currentTime) {
        if (!this.isWatching || !this.currentInterval) return;
        
        // Only update if enough time has passed since last update
        const now = Date.now();
        if (now - this.lastUpdateTime >= this.updateFrequency) {
            this.currentInterval.end = currentTime;
            this.lastUpdateTime = now;
        }
    }
    
    /**
     * End current watching interval and add it to watched intervals
     */
    stopWatching() {
        if (this.isWatching && this.currentInterval) {
            // Only add interval if it has some duration
            if (this.currentInterval.end > this.currentInterval.start) {
                this.watchedIntervals.push({
                    start: this.currentInterval.start,
                    end: this.currentInterval.end
                });
                
                // Merge overlapping intervals and save progress
                this.mergeIntervals();
                this.saveProgress();
            }
            
            this.isWatching = false;
            this.currentInterval = null;
        }
    }
    
    /**
     * Handle seek events to prevent counting skipped segments
     * @param {number} seekToTime - Time position that was seeked to
     */
    handleSeek(seekToTime) {
        // If currently tracking, stop the current interval
        if (this.isWatching) {
            this.stopWatching();
        }
        
        // Start a new interval from the seek position
        this.startWatching(seekToTime);
    }
    
    /**
     * Merge overlapping intervals to calculate unique watched time
     */
    mergeIntervals() {
        if (this.watchedIntervals.length <= 1) return;
        
        // Sort intervals by start time
        this.watchedIntervals.sort((a, b) => a.start - b.start);
        
        const merged = [];
        let current = this.watchedIntervals[0];
        
        for (let i = 1; i < this.watchedIntervals.length; i++) {
            const next = this.watchedIntervals[i];
            
            // If current interval overlaps with the next one, merge them
            if (current.end >= next.start) {
                current.end = Math.max(current.end, next.end);
            } else {
                // No overlap, add the current interval to merged list and move to next
                merged.push(current);
                current = next;
            }
        }
        
        // Add the last interval
        merged.push(current);
        
        // Update watched intervals with merged ones
        this.watchedIntervals = merged;
    }
    
    /**
     * Calculate total unique seconds watched
     * @returns {number} Total seconds watched
     */
    getUniqueSecondsWatched() {
        let totalSeconds = 0;
        
        for (const interval of this.watchedIntervals) {
            totalSeconds += (interval.end - interval.start);
        }
        
        return Math.min(Math.round(totalSeconds), this.totalDuration);
    }
    
    /**
     * Calculate progress percentage based on unique watched time
     * @returns {number} Progress percentage (0-100)
     */
    getProgressPercentage() {
        if (this.totalDuration === 0) return 0;
        
        const uniqueSeconds = this.getUniqueSecondsWatched();
        return Math.min(Math.round((uniqueSeconds / this.totalDuration) * 100), 100);
    }
    
    /**
     * Save progress to local storage
     */
    saveProgress() {
        const progressData = {
            watchedIntervals: this.watchedIntervals,
            totalDuration: this.totalDuration,
            lastPosition: this.watchedIntervals.length > 0 ? 
                this.watchedIntervals[this.watchedIntervals.length - 1].end : 0
        };
        
        localStorage.setItem(`video-progress-${this.videoId}`, JSON.stringify(progressData));
    }
    
    /**
     * Load progress from local storage
     */
    loadProgress() {
        const savedProgress = localStorage.getItem(`video-progress-${this.videoId}`);
        
        if (savedProgress) {
            try {
                const progressData = JSON.parse(savedProgress);
                this.watchedIntervals = progressData.watchedIntervals || [];
                this.totalDuration = progressData.totalDuration || 0;
                
                // Merge intervals in case there are overlaps in saved data
                if (this.watchedIntervals.length > 1) {
                    this.mergeIntervals();
                }
                
                return progressData.lastPosition || 0;
            } catch (e) {
                console.error('Error loading saved progress:', e);
                return 0;
            }
        }
        
        return 0;
    }
    
    /**
     * Get the recommended resume position
     * @returns {number} Position in seconds to resume from
     */
    getResumePosition() {
        const savedProgress = localStorage.getItem(`video-progress-${this.videoId}`);
        
        if (savedProgress) {
            try {
                const progressData = JSON.parse(savedProgress);
                return progressData.lastPosition || 0;
            } catch (e) {
                return 0;
            }
        }
        
        return 0;
    }
    
    /**
     * Visualize watched intervals on a timeline element
     * @param {HTMLElement} timelineElement - DOM element for visualization
     */
    visualizeWatchedIntervals(timelineElement) {
        // Clear previous visualizations
        timelineElement.innerHTML = '';
        
        if (this.totalDuration === 0) return;
        
        // Create segment elements for each watched interval
        for (const interval of this.watchedIntervals) {
            const startPercent = (interval.start / this.totalDuration) * 100;
            const widthPercent = ((interval.end - interval.start) / this.totalDuration) * 100;
            
            const segment = document.createElement('div');
            segment.className = 'watched-segment';
            segment.style.left = `${startPercent}%`;
            segment.style.width = `${widthPercent}%`;
            
            timelineElement.appendChild(segment);
        }
    }
    
    /**
     * Reset all progress for this video
     */
    resetProgress() {
        this.watchedIntervals = [];
        this.currentInterval = null;
        this.isWatching = false;
        localStorage.removeItem(`video-progress-${this.videoId}`);
    }
} 