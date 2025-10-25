// Advanced behavioral tracking and real-time personalization
class BehavioralTracker {
    constructor() {
        this.sessionData = {
            pageViews: [],
            clicks: [],
            timeOnPage: Date.now(),
            scrollDepth: 0,
            interactions: []
        };
        this.initializeTracking();
    }
    
    initializeTracking() {
        this.trackScrollBehavior();
        this.trackClickBehavior();
        this.trackTimeOnPage();
        this.trackFormInteractions();
    }
    
    trackScrollBehavior() {
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.sessionData.scrollDepth = maxScroll;
                
                // Trigger personalization based on scroll depth
                if (maxScroll > 50 && !this.hasTriggered('scroll_50')) {
                    this.triggerPersonalization('engaged_reader');
                }
                if (maxScroll > 80 && !this.hasTriggered('scroll_80')) {
                    this.triggerPersonalization('highly_engaged');
                }
            }
        });
    }
    
    trackClickBehavior() {
        document.addEventListener('click', (e) => {
            const clickData = {
                element: e.target.tagName,
                text: e.target.textContent?.substring(0, 50),
                timestamp: Date.now(),
                className: e.target.className
            };
            
            this.sessionData.clicks.push(clickData);
            
            // Analyze click patterns for segmentation
            this.analyzeClickPattern(e.target);
        });
    }
    
    analyzeClickPattern(element) {
        const text = element.textContent?.toLowerCase() || '';
        const className = element.className?.toLowerCase() || '';
        
        // Professional interest indicators
        if (text.includes('roi') || text.includes('revenue') || text.includes('business')) {
            this.updateSegment('professional', 0.8);
        }
        
        // Accessibility interest indicators
        if (text.includes('accessibility') || text.includes('disability') || text.includes('inclusive')) {
            this.updateSegment('disability', 0.9);
        }
        
        // NGO/Social impact indicators
        if (text.includes('impact') || text.includes('community') || text.includes('sdg')) {
            this.updateSegment('ngo', 0.7);
        }
        
        // Industry-specific indicators
        if (text.includes('hospital') || text.includes('healthcare')) {
            this.updateIndustry('healthcare');
        } else if (text.includes('mall') || text.includes('retail')) {
            this.updateIndustry('retail');
        } else if (text.includes('hotel') || text.includes('hospitality')) {
            this.updateIndustry('hospitality');
        }
    }
    
    trackTimeOnPage() {
        setInterval(() => {
            const timeSpent = Date.now() - this.sessionData.timeOnPage;
            
            // Trigger personalization based on time spent
            if (timeSpent > 30000 && !this.hasTriggered('time_30s')) { // 30 seconds
                this.triggerPersonalization('interested_visitor');
            }
            if (timeSpent > 120000 && !this.hasTriggered('time_2m')) { // 2 minutes
                this.triggerPersonalization('highly_interested');
            }
        }, 5000);
    }
    
    trackFormInteractions() {
        document.addEventListener('focus', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.sessionData.interactions.push({
                    type: 'form_focus',
                    field: e.target.name || e.target.id,
                    timestamp: Date.now()
                });
                
                // High intent indicator
                this.triggerPersonalization('form_interested');
            }
        }, true);
    }
    
    updateSegment(newSegment, confidence) {
        if (window.waideSegmentation) {
            const currentConfidence = window.waideSegmentation.confidence || 0;
            if (confidence > currentConfidence) {
                window.waideSegmentation.segment = newSegment;
                window.waideSegmentation.confidence = confidence;
                window.waideSegmentation.personalizeExperience();
            }
        }
    }
    
    updateIndustry(industry) {
        if (window.waideSegmentation) {
            window.waideSegmentation.industry = industry;
            if (window.waideSegmentation.applyIndustryPersonalization) {
                window.waideSegmentation.applyIndustryPersonalization();
            }
        }
    }
    
    triggerPersonalization(trigger) {
        this.sessionData.interactions.push({
            type: 'personalization_trigger',
            trigger: trigger,
            timestamp: Date.now()
        });
        
        // Mark as triggered to avoid duplicates
        this.sessionData[`triggered_${trigger}`] = true;
        
        // Apply specific personalizations
        this.applyTriggerPersonalization(trigger);
    }
    
    applyTriggerPersonalization(trigger) {
        switch (trigger) {
            case 'engaged_reader':
                this.showEngagementCTA();
                break;
            case 'highly_engaged':
                this.showPremiumContent();
                break;
            case 'interested_visitor':
                this.showTimeBasedOffer();
                break;
            case 'form_interested':
                this.showFormAssistance();
                break;
        }
    }
    
    showEngagementCTA() {
        // Create floating CTA for engaged users
        if (!document.getElementById('engagement-cta')) {
            const cta = document.createElement('div');
            cta.id = 'engagement-cta';
            cta.innerHTML = `
                <div style="position: fixed; bottom: 20px; right: 20px; background: #00ffff; color: #000; padding: 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,255,255,0.3); z-index: 1000; max-width: 300px;">
                    <p style="margin: 0 0 0.5rem; font-weight: bold;">Interested in learning more?</p>
                    <button onclick="window.location.href='demo.html'" style="background: #000; color: #00ffff; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Get Free Demo</button>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #000; float: right; cursor: pointer;">×</button>
                </div>
            `;
            document.body.appendChild(cta);
        }
    }
    
    showTimeBasedOffer() {
        // Check if user already accepted or dismissed offer
        const offerStatus = localStorage.getItem('waide_offer_status');
        if (offerStatus === 'accepted' || offerStatus === 'dismissed') {
            return; // Don't show offer again
        }
        
        const segment = window.waideSegmentation?.segment || 'general';
        const offers = {
            professional: 'Schedule a free ROI consultation',
            ngo: 'Get our social impact assessment',
            disability: 'Try our accessibility demo',
            general: 'Book your free venue assessment'
        };
        
        if (!document.getElementById('time-offer')) {
            const offer = document.createElement('div');
            offer.id = 'time-offer';
            offer.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); color: #fff; padding: 2rem; border-radius: 12px; border: 2px solid #00ffff; z-index: 1001; text-align: center; max-width: 400px;">
                    <h3 style="color: #00ffff; margin-bottom: 1rem;">Special Offer</h3>
                    <p style="margin-bottom: 1.5rem;">${offers[segment]}</p>
                    <button id="accept-offer-btn" style="background: #00ffff; color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem;">Accept Offer</button>
                    <button id="dismiss-offer-btn" style="background: none; border: 1px solid #666; color: #fff; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">Maybe Later</button>
                </div>
            `;
            
            // Add event listeners for buttons
            const acceptBtn = offer.querySelector('#accept-offer-btn');
            const dismissBtn = offer.querySelector('#dismiss-offer-btn');
            
            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('waide_offer_status', 'accepted');
                localStorage.setItem('waide_offer_timestamp', Date.now());
                window.location.href = 'demo.html';
            });
            
            dismissBtn.addEventListener('click', () => {
                localStorage.setItem('waide_offer_status', 'dismissed');
                localStorage.setItem('waide_offer_timestamp', Date.now());
                offer.remove();
            });
            
            document.body.appendChild(offer);
        }
    }
    
    hasTriggered(trigger) {
        return this.sessionData[`triggered_${trigger}`] === true;
    }
    
    getSessionSummary() {
        return {
            ...this.sessionData,
            sessionDuration: Date.now() - this.sessionData.timeOnPage,
            engagementScore: this.calculateEngagementScore()
        };
    }
    
    calculateEngagementScore() {
        const timeScore = Math.min((Date.now() - this.sessionData.timeOnPage) / 60000, 5); // Max 5 points for 1+ minutes
        const scrollScore = this.sessionData.scrollDepth / 20; // Max 5 points for 100% scroll
        const clickScore = Math.min(this.sessionData.clicks.length / 2, 5); // Max 5 points for 10+ clicks
        
        return Math.round(timeScore + scrollScore + clickScore);
    }
}

// A/B Testing Framework
class ABTestManager {
    constructor() {
        this.tests = {
            hero_cta: {
                variants: ['Get Started Today', 'Request Free Demo', 'Calculate Your ROI'],
                weights: [0.33, 0.33, 0.34]
            },
            pricing_display: {
                variants: ['monthly', 'annual', 'custom'],
                weights: [0.4, 0.4, 0.2]
            }
        };
        this.userVariants = this.getUserVariants();
        this.applyVariants();
    }
    
    getUserVariants() {
        let variants = localStorage.getItem('waide_ab_variants');
        if (variants) {
            return JSON.parse(variants);
        }
        
        // Assign new variants
        variants = {};
        for (const [testName, test] of Object.entries(this.tests)) {
            variants[testName] = this.selectVariant(test.variants, test.weights);
        }
        
        localStorage.setItem('waide_ab_variants', JSON.stringify(variants));
        return variants;
    }
    
    selectVariant(variants, weights) {
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < variants.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return variants[i];
            }
        }
        
        return variants[variants.length - 1];
    }
    
    applyVariants() {
        // Apply hero CTA variant
        const heroCTA = document.querySelector('.hero .cta-button, .hero-cta');
        if (heroCTA && this.userVariants.hero_cta) {
            heroCTA.textContent = this.userVariants.hero_cta;
        }
        
        // Track variant assignment
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ab_test_assignment', {
                hero_cta: this.userVariants.hero_cta,
                pricing_display: this.userVariants.pricing_display
            });
        }
    }
}

// Initialize behavioral tracking
document.addEventListener('DOMContentLoaded', () => {
    window.behavioralTracker = new BehavioralTracker();
    window.abTestManager = new ABTestManager();
    
    // Send session data before page unload
    window.addEventListener('beforeunload', () => {
        const sessionSummary = window.behavioralTracker.getSessionSummary();
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'session_summary', {
                engagement_score: sessionSummary.engagementScore,
                session_duration: sessionSummary.sessionDuration,
                scroll_depth: sessionSummary.scrollDepth,
                click_count: sessionSummary.clicks.length
            });
        }
        
        // Store for next visit
        localStorage.setItem('waide_last_session', JSON.stringify(sessionSummary));
    });
});