/**
 * Steven Bartlett Style Engine - Usage Examples
 * How to generate vulnerable, human, transformative copy
 */

// EXAMPLE 1: Healthcare Post (Vulnerable + Data)
const healthcareBase = new PsychologicalConversionEngine('professional', 'healthcare', {
    timeInvestment: 500,
    hasRealData: true,
    hasDeepInsight: true,
    hasSocialProof: true
});

const healthcareBartlett = new StevenBartlettStyleEngine(healthcareBase);
const healthcarePost = healthcareBartlett.generateLinkedInPost();

console.log('=== HEALTHCARE POST (Steven Bartlett Style) ===');
console.log(healthcarePost);
console.log('\n\n');

// EXAMPLE 2: Retail Post (Transformation Story)
const retailBase = new PsychologicalConversionEngine('professional', 'retail', {
    timeInvestment: 300,
    hasRealData: true,
    hasSocialProof: true
});

const retailBartlett = new StevenBartlettStyleEngine(retailBase);
const retailPost = retailBartlett.generateLinkedInPost();

console.log('=== RETAIL POST (Steven Bartlett Style) ===');
console.log(retailPost);
console.log('\n\n');

// EXAMPLE 3: NGO Post (Emotional + Impact)
const ngoBase = new PsychologicalConversionEngine('ngo', 'ngo', {
    timeInvestment: 400,
    hasRealData: true,
    valuesAlignment: true
});

const ngoBartlett = new StevenBartlettStyleEngine(ngoBase);
const ngoPost = ngoBartlett.generateLinkedInPost();

console.log('=== NGO POST (Steven Bartlett Style) ===');
console.log(ngoPost);
console.log('\n\n');

// EXAMPLE 4: Custom Vulnerable Opening
const customBartlett = new StevenBartlettStyleEngine(retailBase);
const customCopy = customBartlett.generateBartlettCopy();

console.log('=== CUSTOM VULNERABLE OPENING ===');
console.log('Confession:', customCopy.opening.confession);
console.log('Vulnerability:', customCopy.opening.vulnerability);
console.log('Human Moment:', customCopy.opening.human_moment);
console.log('Raw Emotion:', customCopy.opening.raw_emotion);
console.log('\n\n');

// EXAMPLE 5: Counterintuitive Insight Only
console.log('=== COUNTERINTUITIVE INSIGHT ===');
console.log('Common Belief:', customCopy.counterintuitive.common_belief);
console.log('Counterintuitive:', customCopy.counterintuitive.counterintuitive);
console.log('Explanation:', customCopy.counterintuitive.explanation);
console.log('Proof Point:', customCopy.counterintuitive.proof_point);
console.log('\n\n');

// EXAMPLE 6: Transformation Moment Only
console.log('=== TRANSFORMATION MOMENT ===');
console.log('Before:', customCopy.transformation.before);
console.log('Shift:', customCopy.transformation.shift);
console.log('After:', customCopy.transformation.after);
console.log('Realization:', customCopy.transformation.realization);
console.log('\n\n');

// EXAMPLE 7: Compare Standard vs Bartlett Style
console.log('=== COMPARISON: Standard vs Bartlett Style ===');

const standardEngine = new PsychologicalConversionEngine('professional', 'retail', {
    timeInvestment: 300,
    hasRealData: true
});

const standardCopy = standardEngine.generateCopy();
const bartlettCopy = new StevenBartlettStyleEngine(standardEngine).generateBartlettCopy();

console.log('STANDARD HOOK:');
console.log(standardCopy.hook.question);
console.log(standardCopy.hook.pain);
console.log('\n');

console.log('BARTLETT OPENING:');
console.log(bartlettCopy.opening.confession);
console.log(bartlettCopy.opening.vulnerability);
console.log(bartlettCopy.opening.human_moment);
console.log('\n\n');

// EXAMPLE 8: Generate Multiple Industry Posts
const industries = ['healthcare', 'retail', 'transportation', 'ngo', 'education'];

console.log('=== MULTI-INDUSTRY BARTLETT POSTS ===');
industries.forEach(industry => {
    const base = new PsychologicalConversionEngine('professional', industry, {
        timeInvestment: 400,
        hasRealData: true,
        hasSocialProof: true
    });
    
    const bartlett = new StevenBartlettStyleEngine(base);
    const post = bartlett.generateLinkedInPost();
    
    console.log(`\n--- ${industry.toUpperCase()} ---`);
    console.log(post.substring(0, 500) + '...\n');
});

// EXAMPLE 9: Extract Just the Human CTA
const transportationBase = new PsychologicalConversionEngine('professional', 'transportation', {
    timeInvestment: 300
});

const transportationBartlett = new StevenBartlettStyleEngine(transportationBase);
const transportationCopy = transportationBartlett.generateBartlettCopy();

console.log('=== HUMAN CTA (Transportation) ===');
console.log(transportationCopy.cta.soft_open);
console.log(transportationCopy.cta.reality_check);
console.log(transportationCopy.cta.human_ask);
console.log(transportationCopy.cta.tool_offer);
console.log(transportationCopy.cta.closing);
console.log('\n\n');

// EXAMPLE 10: Dynamic Hero Section with Bartlett Style
function updateHeroWithBartlettStyle(industry) {
    const base = new PsychologicalConversionEngine('professional', industry, {
        timeInvestment: 500,
        hasRealData: true,
        hasSocialProof: true
    });
    
    const bartlett = new StevenBartlettStyleEngine(base);
    const copy = bartlett.generateBartlettCopy();
    
    // Update DOM
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const heroCTA = document.querySelector('.hero .btn-primary');
    
    if (heroTitle) {
        heroTitle.textContent = copy.opening.confession + ' ' + copy.opening.vulnerability;
    }
    
    if (heroDescription) {
        heroDescription.textContent = copy.opening.human_moment;
    }
    
    if (heroCTA) {
        heroCTA.textContent = copy.cta.human_ask;
    }
    
    return copy;
}

// EXAMPLE 11: Email Sequence in Bartlett Style
function generateBartlettEmailSequence(industry) {
    const base = new PsychologicalConversionEngine('professional', industry, {
        timeInvestment: 400,
        hasRealData: true
    });
    
    const bartlett = new StevenBartlettStyleEngine(base);
    const copy = bartlett.generateBartlettCopy();
    
    return {
        email1: {
            subject: copy.opening.confession,
            body: `${copy.opening.vulnerability}\n\n${copy.opening.human_moment}\n\n${copy.opening.raw_emotion}\n\n${copy.cta.human_ask}`
        },
        email2: {
            subject: copy.counterintuitive.counterintuitive,
            body: `${copy.counterintuitive.common_belief}\n\n${copy.counterintuitive.explanation}\n\n${copy.proof.data_point}\n\n${copy.cta.tool_offer}`
        },
        email3: {
            subject: copy.transformation.realization,
            body: `${copy.transformation.before}\n\n${copy.transformation.shift}\n\n${copy.transformation.after}\n\n${copy.cta.reality_check}\n\n${copy.cta.closing}`
        }
    };
}

const emailSequence = generateBartlettEmailSequence('healthcare');
console.log('=== BARTLETT EMAIL SEQUENCE ===');
console.log('Email 1 Subject:', emailSequence.email1.subject);
console.log('Email 2 Subject:', emailSequence.email2.subject);
console.log('Email 3 Subject:', emailSequence.email3.subject);
