// Hybrid: Rules first, AI enhancement second
class HybridSegmentation {
    constructor() {
        this.useAI = false; // Start with rules only
    }
    
    segment(visitor) {
        // 1. Rules first (fast, reliable)
        const ruleBasedSegment = this.applyRules(visitor);
        if (ruleBasedSegment.confidence > 0.8) {
            return ruleBasedSegment;
        }
        
        // 2. AI enhancement for edge cases
        if (this.useAI) {
            return this.enhanceWithAI(visitor, ruleBasedSegment);
        }
        
        return ruleBasedSegment;
    }
    
    applyRules(visitor) {
        // Existing rule-based logic
        if (visitor.url.includes('unicef')) return { segment: 'ngo', confidence: 0.95 };
        if (visitor.clicks.includes('roi')) return { segment: 'professional', confidence: 0.85 };
        return { segment: 'general', confidence: 0.3 };
    }
}

// Recommendation: Start with rules, add AI later if needed
window.segmentation = new HybridSegmentation();