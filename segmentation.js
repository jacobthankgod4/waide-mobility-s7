class VisitorSegmentation {
    constructor() {
        this.segment = this.detectSegment();
        this.country = this.detectCountry();
        this.industry = this.detectIndustry();
        this.confidence = 0;
        this.personalizeExperience();
    }

    detectSegment() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('segment')) return params.get('segment');

        const referrer = document.referrer.toLowerCase();

        const mapping = [
            { keywords: ['hospital', 'health', 'medical', 'clinic'], seg: 'healthcare' },
            { keywords: ['mall', 'retail', 'shopping', 'store'], seg: 'retail' },
            { keywords: ['hotel', 'resort', 'hospitality', 'tourism'], seg: 'hospitality' },
            { keywords: ['airport', 'transport', 'aviation', 'airline', 'train', 'subway', 'railway', 'station'], seg: 'transportation' },
            { keywords: ['university', 'school', 'education', 'campus', 'library', 'museum'], seg: 'education' },
            { keywords: ['casino', 'gaming', 'stadium', 'sports', 'theme', 'park', 'convention', 'cruise'], seg: 'entertainment' },
            { keywords: ['office', 'warehouse', 'manufacturing', 'datacenter', 'parking', 'corporate'], seg: 'enterprise' },
            { keywords: ['government', '.gov', 'public', 'municipal'], seg: 'government' },
            { keywords: ['unicef', 'who', 'worldbank', 'usaid', 'redcross', 'oxfam'], seg: 'ngo' },
            { keywords: ['linkedin', 'facility', 'property', 'business'], seg: 'professional' },
            { keywords: ['accessibility', 'disability', 'ada', 'wcag'], seg: 'disability' },
        ];

        for (const map of mapping) {
            if (map.keywords.some(k => referrer.includes(k))) {
                this.confidence = 0.9;
                return map.seg;
            }
        }

        this.confidence = 0.3;
        return 'general';
    }

    detectCountry() {
        return fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                this.country = data.country_code;
                return data.country_code;
            })
            .catch(() => 'NG');
    }

    detectIndustry() {
        const params = new URLSearchParams(window.location.search);
        const industry = params.get('industry');
        if (industry) return industry;

        const referrer = document.referrer.toLowerCase();
        if (referrer.includes('hospital') || referrer.includes('health')) return 'healthcare';
        if (referrer.includes('mall') || referrer.includes('retail')) return 'retail';
        if (referrer.includes('hotel') || referrer.includes('hospitality')) return 'hospitality';
        if (referrer.includes('airport') || referrer.includes('transport')) return 'transportation';
        if (referrer.includes('university') || referrer.includes('school')) return 'education';

        return 'general';
    }

    personalizeExperience() {
        this.updateHeroSection();
        this.updateUseCases();
        this.updateTestimonials();
        this.updateCTA();
        this.trackSegmentation();
    }

    updateHeroSection() {
        const heroContent = this.getHeroContent();
        const heroTitle = document.querySelector('.hero h1:not(.seo-protected), .hero-title:not(.seo-protected)');
        const heroSubtitle = document.querySelector('.hero p:not(.seo-protected), .hero-subtitle:not(.seo-protected)');
        const heroCTA = document.querySelector('.hero .cta-button, .hero-cta');

        if (heroTitle) heroTitle.textContent = heroContent.title;
        if (heroSubtitle) heroSubtitle.textContent = heroContent.subtitle;
        if (heroCTA) heroCTA.textContent = heroContent.cta;
    }

    getHeroContent() {
        const content = {
            healthcare: {
                title: "Reimagine Patient Journeys. Restore Human Time.",
                subtitle: "Every minute lost in navigation costs lives. Waide transforms patient flow with precision guidance — cutting delays, freeing staff, and reshaping care delivery.",
                cta: "Measure Your Care Efficiency"
            },
            retail: {
                title: "Every Lost Shopper Is Lost Revenue.",
                subtitle: "What if movement was measurable profit? Waide converts wandering visitors into buyers through intelligent indoor guidance and real-time engagement.",
                cta: "Reveal Your Hidden Sales"
            },
            hospitality: {
                title: "Turn Confusion Into Connection.",
                subtitle: "Guests remember how they feel, not just where they stay. Seamless navigation transforms frustration into five-star experiences that build lifetime loyalty.",
                cta: "Elevate Guest Experience"
            },
            transportation: {
                title: "From Chaos to Coordination.",
                subtitle: "Airports, stations, terminals — the pulse of movement. Optimize flow, minimize stress, and unlock new revenue zones within every journey.",
                cta: "Optimize Passenger Flow"
            },
            education: {
                title: "Navigation Is the First Lesson in Inclusion.",
                subtitle: "Empower every student, visitor, and faculty member to move independently through your campus — fostering belonging, safety, and academic success.",
                cta: "Transform Campus Accessibility"
            },
            government: {
                title: "Public Spaces. Private Dignity.",
                subtitle: "Accessibility isn’t compliance — it’s leadership. Governments using Waide design cities that include everyone and inspire public trust.",
                cta: "Audit My Public Access"
            },
            ngo: {
                title: "When Every Second Matters, Clarity Saves Lives.",
                subtitle: "From flood zones to refugee shelters, Waide guides people to safety — bringing structure to chaos and cutting disaster response time by 67%.",
                cta: "Deploy Mobility Intelligence"
            },
            professional: {
                title: "Your Building Is a Data Goldmine.",
                subtitle: "Understand movement. Predict demand. Turn foot traffic into financial insight and reclaim millions lost to navigational inefficiency.",
                cta: "Calculate Your ROI Now"
            },
            disability: {
                title: "Independence Begins With Direction.",
                subtitle: "Navigate any environment hands-free. Waide empowers individuals with disabilities to move confidently, freely, and without barriers.",
                cta: "Experience Mobility Freedom"
            },
            entertainment: {
                title: "Design Moments That Move People.",
                subtitle: "From stadiums to museums, every visitor’s path is a story. Intelligent navigation keeps them engaged longer and coming back faster.",
                cta: "Enhance Visitor Journeys"
            },
            enterprise: {
                title: "Productivity Lives in the Pathways Between People.",
                subtitle: "Track movement. Eliminate friction. Optimize every square foot of your facility for flow, focus, and efficiency.",
                cta: "Unlock Operational Clarity"
            },
            general: {
                title: "Map What Matters.",
                subtitle: "In a world of movement, clarity is survival. Waide transforms the spaces we build into intelligent systems that understand, guide, and empower.",
                cta: "Start Mapping Your Space"
            }
        };

        return content[this.segment] || content.general;
    }

    updateUseCases() {
        const useCases = {
            healthcare: [
                { title: "67% Faster Emergency Navigation", desc: "Reduce patient delays through intelligent route optimization and predictive guidance." },
                { title: "Staff Efficiency Reinvented", desc: "Free clinical teams from giving directions — reclaim 15 hours weekly for patient care." },
                { title: "Smarter Facility Insights", desc: "Turn movement data into actionable intelligence for patient flow design." }
            ],
            retail: [
                { title: "Recover $2M in Lost Sales", desc: "Redirect drifting visitors with smart path nudges before they leave." },
                { title: "5× Visitor Spend with Location Marketing", desc: "Engage shoppers in real time with contextual offers and AR guidance." },
                { title: "Geo-Conquest Competitors", desc: "Target visitors near rival malls and deliver push notifications instantly." }
            ],
            hospitality: [
                { title: "Reduce Check-In Confusion by 80%", desc: "Guide guests from lobby to room without a single lost step." },
                { title: "AI-Powered Guest Concierge", desc: "Deliver personalized navigation to amenities, dining, and events in real time." },
                { title: "Higher Ratings, Lower Friction", desc: "Boost satisfaction and drive repeat bookings effortlessly." }
            ],
            transportation: [
                { title: "End Missed Connections", desc: "Predict congestion and reroute passengers in real time." },
                { title: "Cut Operational Waste", desc: "Reduce wayfinding assistance costs and improve staff allocation." },
                { title: "Smarter Terminal Design", desc: "Use movement data to shape efficient, revenue-generating spaces." }
            ],
            education: [
                { title: "Universal Campus Navigation", desc: "Ensure no student, visitor, or faculty ever feels lost again." },
                { title: "Campus-Wide Flow Analytics", desc: "Use data to improve layout, accessibility, and safety." },
                { title: "Inclusion as Innovation", desc: "Turn accessibility into your institution’s competitive edge." }
            ],
            ngo: [
                { title: "Disaster Response Acceleration", desc: "Guide citizens to safety faster during floods or evacuations." },
                { title: "Offline Navigation in Emergencies", desc: "Empower relief operations in low-connectivity zones." },
                { title: "Impact Measurement", desc: "Quantify how improved navigation reduces loss of life." }
            ],
            enterprise: [
                { title: "Operational Flow Analytics", desc: "Track employee movement to identify bottlenecks and improve efficiency." },
                { title: "Smart Asset Tracking", desc: "Locate people, equipment, and vehicles with precision." },
                { title: "Predictive Space Utilization", desc: "Use movement insights to optimize layout and cost efficiency." }
            ]
        };

        const container = document.querySelector('.use-cases, .features');
        if (container && useCases[this.segment]) {
            this.renderUseCases(container, useCases[this.segment]);
        }
    }

    renderUseCases(container, cases) {
        container.innerHTML = cases.map(u => `
            <div class="use-case-item">
                <h3>${u.title}</h3>
                <p>${u.desc}</p>
            </div>
        `).join('');
    }

    updateTestimonials() {
        const testimonials = {
            ngo: {
                quote: "During the last flood crisis, Waide helped us guide over 10,000 people to safety. It’s not just technology — it’s the invisible map that saves lives.",
                author: "Dr. Amina Hassan, Emergency Response Director"
            },
            professional: {
                quote: "We turned lost movement into measurable growth. Waide revealed inefficiencies we didn’t even know existed — and turned them into profit.",
                author: "James Okafor, Mall Owner (₦2.1B Annual Revenue)"
            },
            disability: {
                quote: "For the first time, I explored a public space without fear or assistance. Waide gave me independence — and that changed everything.",
                author: "Sarah Adebayo, Accessibility Advocate"
            }
        };

        const t = testimonials[this.segment];
        if (t) {
            const quote = document.querySelector('.testimonial-quote');
            const author = document.querySelector('.testimonial-author');
            if (quote) quote.textContent = t.quote;
            if (author) author.textContent = t.author;
        }
    }

    updateCTA() {
        const ctaMap = {
            healthcare: "Measure My Patient Flow",
            retail: "Reveal My Hidden Revenue",
            hospitality: "Upgrade Guest Experience",
            transportation: "Fix Passenger Flow",
            education: "Empower Every Student",
            government: "Audit Public Access",
            ngo: "Map My Impact",
            professional: "Show My ROI Potential",
            disability: "Start My Independence Journey",
            general: "Map My Space Now"
        };

        document.querySelectorAll('.cta-button')
            .forEach(btn => btn.textContent = ctaMap[this.segment] || ctaMap.general);
    }

    trackSegmentation() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'visitor_segmentation', {
                segment: this.segment,
                industry: this.industry,
                confidence: this.confidence,
                country: this.country
            });
        }

        localStorage.setItem('waide_visitor_segment', JSON.stringify({
            segment: this.segment,
            industry: this.industry,
            timestamp: Date.now()
        }));
    }

    trackBehavior() {
        document.addEventListener('click', e => {
            const t = e.target.textContent.toLowerCase();
            if (t.includes('accessibility')) this.segment = 'disability';
            else if (t.includes('roi')) this.segment = 'professional';
            else if (t.includes('impact')) this.segment = 'ngo';
            this.personalizeExperience();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.waideSegmentation = new VisitorSegmentation();
    window.waideSegmentation.trackBehavior();
});
