/**
 * Psychological Conversion Engine - Usage Examples
 * How to implement the algorithm for different personas and industries
 */

// EXAMPLE 1: Healthcare - With Deep Mathematical Insight
const healthcareEngine = new PsychologicalConversionEngine('professional', 'healthcare', {
    timeInvestment: 500,
    hasRealData: true,
    hasDeepInsight: true, // Formula/framework will be included
    hasSocialProof: true,
    lossPerDay: true,
    competitorAdvantage: true,
    freeResource: true,
    bonusValue: '$200 personalized report',
    quantifiedOutcome: '67% faster response time',
    specificNumbers: true,
    realEntityNamed: 'Lagos University Teaching Hospital',
    verifiableData: true,
    valuesAlignment: true,
    timeToValue: 60,
    multipleCTAs: true
});

const healthcareCopy = healthcareEngine.generateCopy();
console.log('Healthcare Conversion Score:', healthcareCopy.conversionScore);
console.log('Healthcare Hook:', healthcareCopy.hook);
console.log('Healthcare CTA:', healthcareCopy.cta);

// EXAMPLE 2: Retail - Without Formula (Story-Driven)
const retailEngine = new PsychologicalConversionEngine('professional', 'retail', {
    timeInvestment: 300,
    hasRealData: true,
    hasDeepInsight: false, // No formula, focus on story
    hasSocialProof: true,
    lossPerDay: true,
    competitorAdvantage: true,
    freeResource: true,
    bonusValue: 'Free accessibility audit',
    quantifiedOutcome: '5× increase in foot traffic',
    specificNumbers: true,
    realEntityNamed: 'Jabi Lake Mall',
    verifiableData: true,
    valuesAlignment: true,
    timeToValue: 60,
    multipleCTAs: true
});

const retailCopy = retailEngine.generateCopy();
console.log('Retail Conversion Score:', retailCopy.conversionScore);

// EXAMPLE 3: NGO Climate Resilience - Impact-Focused
const ngoEngine = new PsychologicalConversionEngine('ngo', 'ngo', {
    timeInvestment: 400,
    hasRealData: true,
    hasDeepInsight: false,
    hasSocialProof: true,
    lossPerDay: true,
    freeResource: true,
    bonusValue: 'Impact assessment report',
    quantifiedOutcome: '250M Africans reached',
    specificNumbers: true,
    realEntityNamed: 'Lagos Flood Response Team',
    verifiableData: true,
    valuesAlignment: true,
    timeToValue: 60,
    multipleCTAs: true,
    customProof: {
        entity: 'UNICEF Nigeria',
        metric: '3 children saved during Lagos floods',
        scale: '250 million vulnerable Africans'
    }
});

const ngoCopy = ngoEngine.generateCopy();
console.log('NGO Conversion Score:', ngoCopy.conversionScore);

// EXAMPLE 4: A/B Testing Variants
const variants = retailEngine.generateVariants(3);
console.log('Generated Variants:', variants);

// EXAMPLE 5: Get Optimization Recommendations
const recommendations = healthcareEngine.getOptimizationRecommendations();
console.log('Optimization Recommendations:', recommendations);

// EXAMPLE 6: Dynamic Hero Section Update
function updateHeroWithPsychology(industry, persona, useDeepInsight = false) {
    const engine = new PsychologicalConversionEngine(persona, industry, {
        timeInvestment: 500,
        hasRealData: true,
        hasDeepInsight: useDeepInsight, // Optional formula/framework
        hasSocialProof: true,
        lossPerDay: true,
        competitorAdvantage: true,
        freeResource: true,
        bonusValue: 'Personalized report',
        quantifiedOutcome: 'Measurable results',
        specificNumbers: true,
        verifiableData: true,
        valuesAlignment: true,
        timeToValue: 60,
        multipleCTAs: true
    });

    const copy = engine.generateCopy();
    
    // Update DOM
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const heroCTA = document.querySelector('.hero .btn-primary');
    
    if (heroTitle) heroTitle.innerHTML = copy.hook.question;
    if (heroDescription) heroDescription.textContent = copy.hook.pain;
    if (heroCTA) heroCTA.textContent = copy.cta.primary;
    
    return copy.conversionScore;
}

// EXAMPLE 7: Real-time Conversion Score Tracking
function trackConversionOptimization() {
    const industries = ['healthcare', 'retail', 'transportation', 'hospitality', 'education', 'ngo'];
    const results = {};
    
    industries.forEach(industry => {
        const engine = new PsychologicalConversionEngine('professional', industry, {
            researchHours: 500,
            hasRealData: true,
            hasMathFormula: true,
            lossPerDay: true,
            freeTool: true,
            bonusValue: 200,
            roiMultiplier: 5,
            specificNumbers: true,
            timeToValue: 60
        });
        
        results[industry] = {
            score: engine.calculateConversionPotential(),
            recommendations: engine.getOptimizationRecommendations()
        };
    });
    
    return results;
}

// EXAMPLE 8: LinkedIn Post Generator (Flexible)
function generateLinkedInPost(industry, realEntity, metrics, options = {}) {
    const engine = new PsychologicalConversionEngine('professional', industry, {
        timeInvestment: options.timeInvestment || 500,
        hasRealData: true,
        hasDeepInsight: options.includeFormula || false, // Optional
        hasSocialProof: true,
        lossPerDay: true,
        competitorAdvantage: true,
        freeResource: true,
        bonusValue: options.bonusValue || 'Free report',
        quantifiedOutcome: metrics.outcome,
        specificNumbers: true,
        realEntityNamed: realEntity,
        verifiableData: true,
        valuesAlignment: true,
        timeToValue: 60,
        multipleCTAs: true,
        customProof: metrics.proof
    });
    
    const copy = engine.generateCopy();
    
    return `
${copy.hook.question}
(Do not miss this as a venue owner)

${copy.authority.research}

${copy.authority.expertise}

${copy.problem.question}

I contacted ${realVenue}, ${metrics.description}.

Results confirmed: ${copy.hook.pain}

${copy.problem.insight}

${copy.problem.deepInsight || ''}

${copy.solution.reframe}

${copy.solution.insight}

${copy.solution.opportunity}

This insight birthed Waide's ROI Calculator, a 60-second tool turning venue metrics into visibility, efficiency, and revenue insights.

${copy.cta.secondary}

👉 Try Waide's ROI Calculator, link in comments. Or DM for a 30 minute consultation.

${copy.cta.urgency}

#MobilityIntelligence #ROICalculator #${industry.charAt(0).toUpperCase() + industry.slice(1)}Navigation #WaideMobility
    `.trim();
}

// Usage Example - With Formula
const linkedInPostWithFormula = generateLinkedInPost('retail', 'Jabi Lake Mall, Abuja', {
    outcome: '$2M revenue recovery',
    proof: {
        entity: 'Jabi Lake Mall',
        metric: '40% increase in disabled shopper visits',
        scale: '500,000+ monthly visitors'
    }
}, { includeFormula: true, bonusValue: '$200 ROI report' });

// Usage Example - Without Formula (Story-Driven)
const linkedInPostStory = generateLinkedInPost('ngo', 'UNICEF Nigeria', {
    outcome: '250M Africans reached',
    proof: {
        entity: 'Lagos Flood Response',
        metric: '3 children saved',
        scale: 'Climate-vulnerable communities'
    }
}, { includeFormula: false, bonusValue: 'Impact assessment' });

console.log('LinkedIn Post (With Formula):', linkedInPostWithFormula);
console.log('LinkedIn Post (Story-Driven):', linkedInPostStory);

// EXAMPLE 9: Email Sequence Generator
function generateEmailSequence(industry, persona) {
    const engine = new PsychologicalConversionEngine(persona, industry, {
        researchHours: 500,
        hasRealData: true,
        lossPerDay: true,
        freeTool: true,
        bonusValue: 200,
        specificNumbers: true,
        timeToValue: 60
    });
    
    const copy = engine.generateCopy();
    
    return {
        email1: {
            subject: copy.hook.question,
            body: `${copy.hook.pain}\n\n${copy.authority.research}\n\n${copy.cta.primary}`
        },
        email2: {
            subject: `The Hidden Cost of Poor Navigation in ${industry}`,
            body: `${copy.problem.insight}\n\n${copy.proof.venue} saw ${copy.proof.metric}\n\n${copy.cta.secondary}`
        },
        email3: {
            subject: `Last Chance: ${copy.cta.secondary}`,
            body: `${copy.cta.urgency}\n\n${copy.solution.opportunity}\n\n${copy.cta.primary}`
        }
    };
}

// EXAMPLE 10: Landing Page Optimizer
function optimizeLandingPage(currentScore, industry) {
    const engine = new PsychologicalConversionEngine('professional', industry, {
        researchHours: 500,
        hasRealData: true,
        hasMathFormula: true,
        lossPerDay: true,
        freeTool: true,
        bonusValue: 200,
        roiMultiplier: 5,
        specificNumbers: true,
        timeToValue: 60,
        multipleCTAs: true
    });
    
    const recommendations = engine.getOptimizationRecommendations();
    
    return {
        currentGrade: recommendations.grade,
        targetScore: 90,
        improvements: recommendations.recommendations,
        estimatedLift: recommendations.recommendations.reduce((sum, rec) => {
            const lift = parseInt(rec.impact.match(/\d+/)[0]);
            return sum + lift;
        }, 0)
    };
}

console.log('Landing Page Optimization:', optimizeLandingPage(65, 'healthcare'));
