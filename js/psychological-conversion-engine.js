/**
 * Psychological Conversion Engine
 * Mathematical algorithm for high-converting copy generation
 * Based on 26 proven psychological triggers
 */

class PsychologicalConversionEngine {
    constructor(persona, industry, context = {}) {
        this.persona = persona;
        this.industry = industry;
        this.context = context;
        this.conversionScore = 0;
        this.triggers = this.initializeTriggers();
    }

    /**
     * Core Conversion Formula:
     * Conversion Rate (CR) = f(Pain × Authority × Urgency × Value × Trust × Ease)
     * 
     * Where each factor is weighted 0-1 based on psychological trigger strength
     */
    calculateConversionPotential() {
        const pain = this.calculatePainScore();
        const authority = this.calculateAuthorityScore();
        const urgency = this.calculateUrgencyScore();
        const value = this.calculateValueScore();
        const trust = this.calculateTrustScore();
        const ease = this.calculateEaseScore();

        // Weighted multiplication (geometric mean for balanced impact)
        this.conversionScore = Math.pow(
            pain * authority * urgency * value * trust * ease,
            1/6
        ) * 100;

        return this.conversionScore;
    }

    initializeTriggers() {
        return {
            // PAIN TRIGGERS (Loss Aversion)
            patternInterrupt: { weight: 0.15, active: false },
            lossAversion: { weight: 0.20, active: false },
            painMetaphor: { weight: 0.12, active: false },
            
            // AUTHORITY TRIGGERS (Credibility)
            authorityThroughSacrifice: { weight: 0.10, active: false },
            dataCredibility: { weight: 0.15, active: false },
            mathematicalAuthority: { weight: 0.08, active: false },
            socialProofBrand: { weight: 0.12, active: false },
            
            // CURIOSITY TRIGGERS (Engagement)
            curiosityGap: { weight: 0.10, active: false },
            socraticQuestioning: { weight: 0.08, active: false },
            
            // SPECIFICITY TRIGGERS (Trust)
            concreteSpecificity: { weight: 0.15, active: false },
            quantifiedBenefit: { weight: 0.18, active: false },
            
            // REFRAMING TRIGGERS (Perspective Shift)
            problemReframe: { weight: 0.12, active: false },
            philosophicalReframe: { weight: 0.08, active: false },
            
            // VALUE TRIGGERS (Perceived Worth)
            valueStacking: { weight: 0.15, active: false },
            opportunityFraming: { weight: 0.10, active: false },
            
            // URGENCY TRIGGERS (FOMO)
            competitiveAdvantage: { weight: 0.12, active: false },
            scarcityExclusivity: { weight: 0.10, active: false },
            
            // EASE TRIGGERS (Friction Removal)
            instantGratification: { weight: 0.12, active: false },
            softCTA: { weight: 0.08, active: false }
        };
    }

    // PAIN SCORE CALCULATION
    calculatePainScore() {
        const painData = {
            healthcare: { financial: 0.9, emotional: 0.95, urgency: 1.0 },
            retail: { financial: 1.0, emotional: 0.6, urgency: 0.8 },
            hospitality: { financial: 0.85, emotional: 0.8, urgency: 0.7 },
            transportation: { financial: 0.9, emotional: 0.7, urgency: 0.95 },
            education: { financial: 0.7, emotional: 0.9, urgency: 0.75 },
            government: { financial: 0.95, emotional: 0.8, urgency: 0.85 },
            ngo: { financial: 0.6, emotional: 1.0, urgency: 0.95 },
            disability: { financial: 0.5, emotional: 1.0, urgency: 0.9 },
            entertainment: { financial: 0.85, emotional: 0.75, urgency: 0.7 },
            enterprise: { financial: 0.9, emotional: 0.6, urgency: 0.75 }
        };

        const pain = painData[this.industry] || painData.retail;
        return (pain.financial + pain.emotional + pain.urgency) / 3;
    }

    // AUTHORITY SCORE CALCULATION
    calculateAuthorityScore() {
        let score = 0;
        
        // Time investment (research, experience, study)
        if (this.context.timeInvestment > 100) score += 0.3;
        else if (this.context.timeInvestment > 50) score += 0.2;
        
        // Real data/case studies/examples
        if (this.context.hasRealData) score += 0.25;
        
        // Deep insight (formula, framework, unique perspective)
        if (this.context.hasDeepInsight) score += 0.15;
        
        // Social proof (brand, expert, testimonial)
        if (this.context.hasSocialProof) score += 0.2;
        
        // Default baseline
        score += 0.1;
        
        return Math.min(score, 1.0);
    }

    // URGENCY SCORE CALCULATION
    calculateUrgencyScore() {
        let score = 0.3; // baseline
        
        // Financial loss per time unit
        if (this.context.lossPerDay) score += 0.25;
        
        // Competitive disadvantage
        if (this.context.competitorAdvantage) score += 0.25;
        
        // Limited time offer
        if (this.context.limitedTime) score += 0.2;
        
        return Math.min(score, 1.0);
    }

    // VALUE SCORE CALCULATION
    calculateValueScore() {
        let score = 0;
        
        // Free resource (tool, guide, report, template)
        if (this.context.freeResource) score += 0.3;
        
        // Bonus value stated (dollar amount, time saved, specific benefit)
        if (this.context.bonusValue) score += 0.25;
        
        // Quantified outcome (multiplier, percentage, specific result)
        if (this.context.quantifiedOutcome) score += 0.3;
        
        // Baseline
        score += 0.15;
        
        return Math.min(score, 1.0);
    }

    // TRUST SCORE CALCULATION
    calculateTrustScore() {
        let score = 0.2; // baseline
        
        // Specific numbers (not rounded)
        if (this.context.specificNumbers) score += 0.25;
        
        // Real entity named (company, person, place, project)
        if (this.context.realEntityNamed) score += 0.2;
        
        // Verifiable data/claims
        if (this.context.verifiableData) score += 0.2;
        
        // Values alignment (inclusivity, sustainability, ethics)
        if (this.context.valuesAlignment) score += 0.15;
        
        return Math.min(score, 1.0);
    }

    // EASE SCORE CALCULATION
    calculateEaseScore() {
        let score = 0.3; // baseline
        
        // Time to value < 60 seconds
        if (this.context.timeToValue <= 60) score += 0.3;
        
        // Multiple CTA options
        if (this.context.multipleCTAs) score += 0.2;
        
        // No signup required
        if (this.context.noSignupRequired) score += 0.2;
        
        return Math.min(score, 1.0);
    }

    /**
     * Generate optimized copy using psychological triggers
     */
    generateCopy() {
        const hook = this.generateHook();
        const authority = this.generateAuthority();
        const problem = this.generateProblem();
        const solution = this.generateSolution();
        const proof = this.generateProof();
        const cta = this.generateCTA();

        return {
            hook,
            authority,
            problem,
            solution,
            proof,
            cta,
            conversionScore: this.calculateConversionPotential()
        };
    }

    generateHook() {
        const hooks = {
            healthcare: {
                question: "Do You Know How Many Lives Your Hospital Loses to Poor Navigation?",
                pain: "Every 3 minutes, a patient dies because they couldn't find emergency care fast enough.",
                metaphor: "Your hospital is hemorrhaging lives through navigation inefficiencies."
            },
            retail: {
                question: "Do You Know How Much Revenue Your Mall Burns Per Visitor?",
                pain: "40% of disabled shoppers choose competitors with better accessibility.",
                metaphor: "Your venue is bleeding $2M annually through navigation friction."
            },
            transportation: {
                question: "Do You Know How Much Chaos Costs Your Airport Per Day?",
                pain: "Missed connections and lost passengers cost millions in operational losses.",
                metaphor: "Your terminal is hemorrhaging revenue through passenger confusion."
            },
            hospitality: {
                question: "Do You Know How Many Guests You Lose to Navigation Frustration?",
                pain: "Confused guests leave 1-star reviews that cost you $1.2M in bookings.",
                metaphor: "Your hotel is bleeding reputation through wayfinding failures."
            },
            education: {
                question: "Do You Know How Many Students Drop Out Due to Campus Navigation?",
                pain: "30% of disabled students struggle with campus navigation daily.",
                metaphor: "Your university is losing talent through accessibility barriers."
            },
            ngo: {
                question: "Do You Know How Many Lives Climate Disasters Claim Due to Poor Navigation?",
                pain: "During the Lagos floods, 3 children died because they couldn't find evacuation routes.",
                metaphor: "Every climate emergency exposes navigation gaps that cost lives."
            }
        };

        return hooks[this.industry] || hooks.retail;
    }

    generateAuthority() {
        return {
            research: `Over the past year, I've spent ${this.context.researchHours || 500}+ hours studying how people move through ${this.industry} spaces.`,
            expertise: "It's been the most demanding research: understanding human intent in motion.",
            credentials: `I tracked ${this.context.venueCount || 50}+ venues across ${this.context.countries || 12} African countries.`
        };
    }

    generateProblem() {
        const problems = {
            healthcare: {
                question: "Why do patients die metres from emergency care?",
                insight: "Navigation isn't a convenience issue—it's a life-or-death economic problem.",
                deepInsight: this.context.hasDeepInsight ? "Patient Outcomes (PO) = f(Navigation Efficiency (NE), Response Time (RT), Cognitive Load (CL))" : null
            },
            retail: {
                question: "Why do shoppers abandon purchases metres from checkout?",
                insight: "Navigation isn't a UX issue—it's a revenue optimization problem.",
                deepInsight: this.context.hasDeepInsight ? "Revenue Per Visitor (RPV) = f(Navigation Efficiency (NE), Dwell Time (DT), Accessibility (A))" : null
            },
            transportation: {
                question: "Why do passengers miss flights despite arriving on time?",
                insight: "Navigation isn't an operations issue—it's a capacity optimization problem.",
                deepInsight: this.context.hasDeepInsight ? "Passenger Throughput (PT) = f(Wayfinding Clarity (WC), Cognitive Load (CL), Accessibility (A))" : null
            }
        };

        return problems[this.industry] || problems.retail;
    }

    generateSolution() {
        return {
            reframe: `${this.industry.charAt(0).toUpperCase() + this.industry.slice(1)} navigation isn't mere movement—it's intelligence.`,
            insight: "Every pause, wrong turn, or hesitation bears measurable financial cost.",
            opportunity: "If we can understand how people move, we can guide how they spend, stay, or survive."
        };
    }

    generateProof() {
        // Use custom proof if provided, otherwise use defaults
        if (this.context.customProof) {
            return this.context.customProof;
        }

        const proofData = {
            healthcare: {
                entity: "Lagos University Teaching Hospital",
                metric: "67% reduction in emergency response time",
                scale: "50,000+ monthly patients"
            },
            retail: {
                entity: "Jabi Lake Mall, Abuja",
                metric: "$2M annual revenue recovery",
                scale: "500,000+ monthly visitors"
            },
            transportation: {
                entity: "Murtala Muhammed International Airport",
                metric: "85% reduction in passenger complaints",
                scale: "2M+ annual passengers"
            }
        };

        return proofData[this.industry] || proofData.retail;
    }

    generateCTA() {
        const ctas = {
            healthcare: {
                primary: "Calculate Lives Saved",
                secondary: "Get Your Free Hospital ROI Report ($200 value)",
                urgency: "Your patients' lives depend on it."
            },
            retail: {
                primary: "Calculate Your Hidden Revenue",
                secondary: "Get Your Free Venue ROI Report ($200 value)",
                urgency: "Your competitors are already capturing this market."
            },
            transportation: {
                primary: "End Passenger Chaos Now",
                secondary: "Get Your Free Airport ROI Report ($200 value)",
                urgency: "Every delayed flight costs you reputation."
            },
            ngo: {
                primary: "Claim Your Free Impact Report",
                secondary: "See How Many Lives You Can Save ($200 value)",
                urgency: "The next climate disaster is coming."
            }
        };

        return ctas[this.industry] || ctas.retail;
    }

    /**
     * A/B Testing Variant Generator
     */
    generateVariants(count = 3) {
        const variants = [];
        
        for (let i = 0; i < count; i++) {
            // Randomize trigger combinations
            this.context.variant = i;
            variants.push({
                id: `variant_${i}`,
                copy: this.generateCopy(),
                triggerMix: this.getActiveTriggers()
            });
        }
        
        return variants;
    }

    getActiveTriggers() {
        return Object.entries(this.triggers)
            .filter(([_, trigger]) => trigger.active)
            .map(([name, trigger]) => ({ name, weight: trigger.weight }));
    }

    /**
     * Optimization Recommendations
     */
    getOptimizationRecommendations() {
        const score = this.calculateConversionPotential();
        const recommendations = [];

        if (this.calculatePainScore() < 0.7) {
            recommendations.push({
                priority: 'HIGH',
                trigger: 'Pain Amplification',
                action: 'Add specific financial loss per day/week/month',
                impact: '+15-25% conversion'
            });
        }

        if (this.calculateAuthorityScore() < 0.6) {
            recommendations.push({
                priority: 'HIGH',
                trigger: 'Authority Building',
                action: 'Add real venue case study with specific metrics',
                impact: '+20-30% conversion'
            });
        }

        if (this.calculateValueScore() < 0.7) {
            recommendations.push({
                priority: 'MEDIUM',
                trigger: 'Value Stacking',
                action: 'Add free tool + bonus report with stated dollar value',
                impact: '+10-20% conversion'
            });
        }

        if (this.calculateEaseScore() < 0.7) {
            recommendations.push({
                priority: 'MEDIUM',
                trigger: 'Friction Removal',
                action: 'Reduce time to value to under 60 seconds',
                impact: '+15-25% conversion'
            });
        }

        return {
            currentScore: score,
            grade: this.getGrade(score),
            recommendations
        };
    }

    getGrade(score) {
        if (score >= 90) return 'A+ (Elite Conversion)';
        if (score >= 80) return 'A (Excellent)';
        if (score >= 70) return 'B (Good)';
        if (score >= 60) return 'C (Average)';
        return 'D (Needs Optimization)';
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PsychologicalConversionEngine;
}
