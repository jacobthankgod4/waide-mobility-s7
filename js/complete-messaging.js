// Complete messaging matrix for all atomic personas
const CompleteMessaging = {
    // Healthcare personas
    'healthcare_hospital_admin': {
        title: 'Improve Patient Outcomes by 42%',
        subtitle: 'Reduce wait times, eliminate confusion, and enhance care delivery with smart hospital navigation',
        cta: 'Calculate Healthcare ROI',
        ctaLink: 'roi-calculator.html'
    },
    'healthcare_medical_director': {
        title: 'Optimize Clinical Workflows by 35%',
        subtitle: 'Streamline patient flow, reduce bottlenecks, and improve staff efficiency with intelligent hospital wayfinding',
        cta: 'View Clinical Benefits',
        ctaLink: 'blog/hospital-navigation.html'
    },
    'healthcare_patient_experience': {
        title: 'Transform Patient Journey Experience',
        subtitle: 'Create positive healthcare experiences from arrival to discharge with compassionate, accessible navigation',
        cta: 'Improve Patient Satisfaction',
        ctaLink: 'demo.html?industry=healthcare'
    },
    
    // Retail personas
    'retail_mall_manager': {
        title: 'Increase Foot Traffic by 25%',
        subtitle: 'Drive revenue growth, boost tenant satisfaction, and create memorable shopping experiences with intelligent mall navigation',
        cta: 'Calculate Retail ROI',
        ctaLink: 'roi-calculator.html'
    },
    'retail_store_manager': {
        title: 'Convert 25% More Browsers to Buyers',
        subtitle: 'Guide customers to products, reduce abandonment, and increase sales with smart in-store navigation',
        cta: 'Boost Conversion Rates',
        ctaLink: 'blog/mall-navigation.html'
    },
    'retail_leasing_director': {
        title: 'Attract Premium Tenants with Smart Tech',
        subtitle: 'Showcase advanced navigation technology to prospective retailers and command higher lease rates',
        cta: 'Enhance Property Value',
        ctaLink: 'solutions.html'
    },
    
    // Transportation personas
    'transportation_airport_operations': {
        title: 'Reduce Missed Connections by 35%',
        subtitle: 'Improve passenger flow, reduce stress, and enhance airport efficiency with intelligent terminal navigation',
        cta: 'Calculate Aviation ROI',
        ctaLink: 'roi-calculator.html'
    },
    'transportation_station_manager': {
        title: 'Optimize Passenger Flow by 40%',
        subtitle: 'Streamline transit connections, reduce congestion, and improve commuter experience with smart wayfinding',
        cta: 'Improve Transit Efficiency',
        ctaLink: 'blog/train-station-navigation.html'
    },
    
    // Education personas
    'education_university_admin': {
        title: 'Streamline Campus Navigation for 10,000+ Students',
        subtitle: 'Improve student experience, reduce orientation costs, and enhance campus accessibility with intelligent wayfinding',
        cta: 'Calculate Education ROI',
        ctaLink: 'roi-calculator.html'
    },
    'education_disability_services': {
        title: 'Enable Inclusive Campus Access',
        subtitle: 'Ensure every student can navigate campus independently with comprehensive accessibility features and barrier-free routing',
        cta: 'Promote Campus Inclusion',
        ctaLink: 'demo.html?accessibility=true'
    },
    
    // Hospitality personas
    'hospitality_hotel_manager': {
        title: 'Boost Guest Satisfaction by 31%',
        subtitle: 'Elevate service quality, reduce guest frustration, and increase positive reviews with seamless hotel navigation',
        cta: 'Calculate Hospitality ROI',
        ctaLink: 'roi-calculator.html'
    },
    'hospitality_guest_services': {
        title: 'Deliver Exceptional Guest Service',
        subtitle: 'Empower staff with tools to assist guests instantly and create memorable experiences with intelligent wayfinding',
        cta: 'Enhance Guest Experience',
        ctaLink: 'demo.html?industry=hospitality'
    },
    
    // Accessibility personas
    'disability_visual': {
        title: 'Navigate with Complete Independence',
        subtitle: 'Experience freedom of movement with voice-powered wayfinding, audio cues, and step-by-step directions in local African languages',
        cta: 'Try Audio Navigation',
        ctaLink: 'demo.html?accessibility=visual'
    },
    'disability_mobility': {
        title: 'Accessible Routes for Every Journey',
        subtitle: 'Navigate confidently with wheelchair-friendly paths, elevator locations, and barrier-free routing that ensures dignified access',
        cta: 'Explore Accessible Routes',
        ctaLink: 'demo.html?accessibility=mobility'
    },
    'disability_cognitive': {
        title: 'Simple Navigation for Everyone',
        subtitle: 'Clear, easy-to-understand directions with visual cues, simplified interfaces, and step-by-step guidance',
        cta: 'Try Simple Navigation',
        ctaLink: 'demo.html?accessibility=cognitive'
    },
    
    // NGO personas
    'ngo_impact_driven': {
        title: 'Advance SDG 10: Reduced Inequalities',
        subtitle: 'Empower vulnerable communities with accessible navigation technology that supports climate resilience and social inclusion',
        cta: 'Get Impact Assessment',
        ctaLink: 'https://waide-accessibility-navigator-439cb45a.base44.app'
    },
    'ngo_healthcare': {
        title: 'Support Universal Health Coverage',
        subtitle: 'Ensure equitable access to healthcare facilities for all community members with inclusive navigation technology',
        cta: 'Learn About Health Impact',
        ctaLink: 'blog/hospital-navigation.html'
    }
};

// Enhanced atomic content generation
AtomicSegmentation.prototype.generateAtomicContent = function() {
    const personaKey = this.generatePersonaKey();
    const message = CompleteMessaging[personaKey] || this.getDefaultMessage();
    return this.applyAtomicModifiers(message);
};

AtomicSegmentation.prototype.generatePersonaKey = function() {
    const parts = [];
    if (this.atoms.segment === 'disability' && this.atoms.accessibility) {
        parts.push('disability', this.atoms.accessibility);
    } else if (this.atoms.segment === 'ngo') {
        parts.push('ngo');
        if (this.atoms.motivation) parts.push(this.atoms.motivation);
        if (this.atoms.industry) parts.push(this.atoms.industry);
    } else if (this.atoms.industry && this.atoms.role) {
        parts.push(this.atoms.industry, this.atoms.role);
    }
    return parts.join('_');
};

AtomicSegmentation.prototype.getDefaultMessage = function() {
    return {
        title: 'Transform Indoor Navigation Across Africa',
        subtitle: 'AI-powered wayfinding solutions for accessible, climate-resilient navigation in African venues',
        cta: 'Get Started Today',
        ctaLink: 'demo.html'
    };
};

AtomicSegmentation.prototype.applyAtomicModifiers = function(message) {
    let { title, subtitle, cta, ctaLink } = message;
    
    // Geographic modifiers
    if (this.atoms.geography === 'NG') {
        subtitle = subtitle.replace('African', 'Nigerian');
    } else if (this.atoms.geography === 'KE') {
        subtitle = subtitle.replace('African', 'Kenyan');
    }
    
    // Decision role modifiers
    if (this.atoms.decisionRole === 'budget_holder' && !cta.includes('ROI')) {
        cta = 'Calculate ROI';
        ctaLink = 'roi-calculator.html';
    } else if (this.atoms.decisionRole === 'technical') {
        cta = 'View Technical Specs';
        ctaLink = 'solutions.html';
    }
    
    // Organization size modifiers
    if (this.atoms.orgSize === 'enterprise') {
        subtitle += ' - Enterprise-grade solution with dedicated support';
    } else if (this.atoms.orgSize === 'small') {
        subtitle += ' - Affordable solution for growing businesses';
    }
    
    return { title, subtitle, cta, ctaLink };
};