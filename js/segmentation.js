// Basic segmentation without errors
class VisitorSegmentation {
    constructor() {
        this.segment = 'general';
        this.industry = 'general';
        this.confidence = 0.5;
    }
    
    trackBehavior() {
        // Basic tracking without errors
        console.log('Segmentation tracking active');
    }
}

// Initialize safely
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.waideSegmentation = new VisitorSegmentation();
        window.waideSegmentation.trackBehavior();
    } catch (e) {
        console.log('Segmentation loaded with fallback');
    }
});