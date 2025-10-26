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
        
        // Healthcare Detection
        if (referrer.includes('hospital') || referrer.includes('health') ||
            referrer.includes('medical') || referrer.includes('clinic')) {
            this.confidence = 0.9;
            return 'healthcare';
        }
        
        // Retail Detection
        if (referrer.includes('mall') || referrer.includes('retail') ||
            referrer.includes('shopping') || referrer.includes('store')) {
            this.confidence = 0.9;
            return 'retail';
        }
        
        // Hospitality Detection
        if (referrer.includes('hotel') || referrer.includes('resort') ||
            referrer.includes('hospitality') || referrer.includes('tourism')) {
            this.confidence = 0.9;
            return 'hospitality';
        }
        
        // Transportation Detection
        if (referrer.includes('airport') || referrer.includes('transport') ||
            referrer.includes('aviation') || referrer.includes('airline') ||
            referrer.includes('train') || referrer.includes('subway') ||
            referrer.includes('railway') || referrer.includes('station')) {
            this.confidence = 0.9;
            return 'transportation';
        }
        
        // Education Detection
        if (referrer.includes('university') || referrer.includes('school') ||
            referrer.includes('education') || referrer.includes('campus') ||
            referrer.includes('library') || referrer.includes('museum')) {
            this.confidence = 0.9;
            return 'education';
        }
        
        // Entertainment Detection
        if (referrer.includes('casino') || referrer.includes('gaming') ||
            referrer.includes('stadium') || referrer.includes('sports') ||
            referrer.includes('theme') || referrer.includes('park') ||
            referrer.includes('convention') || referrer.includes('cruise')) {
            this.confidence = 0.9;
            return 'entertainment';
        }
        
        // Enterprise Detection
        if (referrer.includes('office') || referrer.includes('warehouse') ||
            referrer.includes('manufacturing') || referrer.includes('datacenter') ||
            referrer.includes('parking') || referrer.includes('corporate')) {
            this.confidence = 0.9;
            return 'enterprise';
        }
        
        // Government Detection
        if (referrer.includes('government') || referrer.includes('.gov') ||
            referrer.includes('public') || referrer.includes('municipal')) {
            this.confidence = 0.9;
            return 'government';
        }

        // NGO Detection
        if (referrer.includes('unicef') || referrer.includes('who') || 
            referrer.includes('worldbank') || referrer.includes('usaid') ||
            referrer.includes('redcross') || referrer.includes('oxfam')) {
            this.confidence = 0.9;
            return 'ngo';
        }

        // Professional/Business Detection
        if (referrer.includes('linkedin') || referrer.includes('facility') ||
            referrer.includes('property') || referrer.includes('business')) {
            this.confidence = 0.8;
            return 'professional';
        }

        // Disability/Accessibility Detection
        if (referrer.includes('accessibility') || referrer.includes('disability') ||
            referrer.includes('ada') || referrer.includes('wcag')) {
            this.confidence = 0.85;
            return 'disability';
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
            .catch(() => 'NG'); // Default to Nigeria
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
                title: "Transform Patient Care with Life-Saving Navigation",
                subtitle: "Every 3 minutes matters in emergency care. Our AI navigation reduces critical response time by 67%, turning your hospital into a seamlessly connected life-saving environment where patients and staff navigate with confidence.",
                cta: "Save More Lives Today"
            },
            retail: {
                title: "Unlock Your Mall's $2M Revenue Potential",
                subtitle: "While 40% of disabled shoppers choose accessible competitors, smart mall owners capture the $13 trillion accessibility market. Our navigation pays for itself in 90 days through increased foot traffic and customer loyalty.",
                cta: "Stop Missing Revenue"
            },
            hospitality: {
                title: "Turn Confused Guests Into Raving Fans",
                subtitle: "Premium hotels boost guest satisfaction by 89% and generate $1.2M worth of viral marketing through our AI concierge navigation. Transform frustrated guests into loyal advocates who can't stop recommending your venue.",
                cta: "Boost Guest Satisfaction"
            },
            transportation: {
                title: "End Airport Chaos with Smart Navigation",
                subtitle: "Missed flights and lost passengers cost millions. Modern airports eliminate operational chaos and capture the $1T accessible travel market with our comprehensive wayfinding solution that ensures smooth journeys for every passenger.",
                cta: "Eliminate Confusion"
            },
            education: {
                title: "Ensure No Student Gets Left Behind",
                subtitle: "30% of disabled students struggle with campus navigation. Progressive universities create inclusive environments where every student confidently accesses education, supporting academic achievement and reducing dropout rates.",
                cta: "Create Inclusive Education"
            },
            government: {
                title: "Protect Citizens and Public Budgets",
                subtitle: "Accessibility lawsuits devastate public budgets. Forward-thinking facilities ensure compliance while serving every citizen with dignity, demonstrating commitment to inclusive public service and protecting taxpayer funds.",
                cta: "Ensure Compliance"
            },
            ngo: {
                title: "Reach Every African - Leave No One Behind",
                subtitle: "250 million Africans need accessible services. Leading NGOs achieve SDG compliance and reduce inequality by 67% with navigation that reaches every child, elderly person, and disabled individual during climate emergencies.",
                cta: "Maximize Your Impact"
            },
            professional: {
                title: "Turn Your Venue Into a Revenue Machine",
                subtitle: "While competitors lose 40% of disabled customers, smart venue owners capture new market opportunities worth millions. Our navigation creates inclusive experiences that pay for themselves in 3 months.",
                cta: "Calculate Hidden Revenue"
            },
            disability: {
                title: "Break Free - Navigate Independently",
                subtitle: "Never feel helpless or depend on others again. Our AI guide speaks your language, knows every wheelchair route, and gives you the confidence to explore anywhere with complete independence and dignity.",
                cta: "Experience True Freedom"
            },
            entertainment: {
                title: "Transform Visitor Experience Into Revenue",
                subtitle: "Entertainment venues boost visitor satisfaction by 85% and capture $2M annually from accessible experiences. Smart venues create memorable moments that drive repeat visits and viral social media promotion.",
                cta: "Maximize Visitor Revenue"
            },
            enterprise: {
                title: "Optimize Operations with Smart Navigation",
                subtitle: "Enterprise facilities reduce operational costs by 40% and improve employee productivity through intelligent wayfinding. Transform complex buildings into efficient, accessible workspaces that attract top talent.",
                cta: "Boost Operational Efficiency"
            },
            general: {
                title: "Save Lives During Climate Disasters",
                subtitle: "When floods hit and emergencies strike, navigation saves lives. Join 100,000+ mapped venues creating climate-resilient communities where vulnerable populations can access safety and essential services.",
                cta: "Save Lives in Your Community"
            }
        };

        return content[this.segment] || content.general;
    }

    updateUseCases() {
        const useCases = {
            healthcare: [
                { title: "Save Lives with Emergency Navigation", desc: "Reduce critical care delays by 67% - every second counts when patients need immediate treatment" },
                { title: "Streamline Patient Flow Efficiency", desc: "Transform chaotic hospital navigation into seamless patient journeys that improve outcomes" },
                { title: "Enhance Staff Productivity", desc: "Medical teams navigate 40% faster, spending more time on patient care instead of giving directions" }
            ],
            retail: [
                { title: "Capture $500K in Lost Revenue", desc: "While competitors lose 40% of disabled shoppers, smart malls secure this high-value market segment" },
                { title: "Reduce Staffing Costs by 60%", desc: "AI navigation replaces expensive information desk staff while improving customer satisfaction scores" },
                { title: "Generate Viral Marketing Worth $1.2M", desc: "Accessible experiences create word-of-mouth that drives repeat visits and new customer acquisition" }
            ],
            hospitality: [
                { title: "Transform Guest Experience Scores", desc: "Boost satisfaction by 89% as guests effortlessly find amenities without frustration or delays" },
                { title: "Eliminate Costly Guest Complaints", desc: "Prevent negative reviews and compensation costs from guests who can't navigate your property" },
                { title: "Create Loyal Brand Advocates", desc: "Accessible navigation turns satisfied guests into enthusiastic promoters of your venue" }
            ],
            transportation: [
                { title: "Prevent $50M in Operational Losses", desc: "Eliminate missed connections and passenger complaints that cost airports millions annually" },
                { title: "Capture Accessible Travel Market", desc: "Tap into the $1T accessible tourism market with navigation that serves every passenger" },
                { title: "Streamline Security and Operations", desc: "Reduce passenger confusion that creates bottlenecks and security delays" }
            ],
            education: [
                { title: "Ensure Every Student Succeeds", desc: "Prevent 30% dropout rate among disabled students by creating truly inclusive campus navigation" },
                { title: "Demonstrate Educational Leadership", desc: "Position your institution as an accessibility pioneer that attracts diverse, talented students" },
                { title: "Reduce Administrative Burden", desc: "Eliminate constant wayfinding requests that overwhelm staff and disrupt learning" }
            ],
            government: [
                { title: "Protect Public Funds from Lawsuits", desc: "Avoid $10M accessibility lawsuits that devastate budgets and damage public trust" },
                { title: "Serve Every Citizen with Dignity", desc: "Ensure equal access to public services regardless of disability or mobility challenges" },
                { title: "Demonstrate Inclusive Leadership", desc: "Show taxpayers their government prioritizes accessibility and serves all community members" }
            ],
            ngo: [
                { title: "Reach 250 Million Underserved Africans", desc: "Achieve SDG compliance by ensuring every child, elderly person, and disabled individual can access services" },
                { title: "Reduce Inequality by 67%", desc: "Proven results from pilot programs show dramatic improvement in service accessibility" },
                { title: "Maximize Climate Emergency Response", desc: "Save lives during floods and disasters with navigation that guides vulnerable populations to safety" }
            ],
            professional: [
                { title: "Capture $500K in Competitor Revenue", desc: "While rivals lose 40% of disabled customers, smart venues secure this high-spending market segment" },
                { title: "Replace Expensive Reception Staff", desc: "AI navigation eliminates 3 full-time positions while improving visitor satisfaction by 89%" },
                { title: "Generate $1.2M in Free Marketing", desc: "Accessible experiences create viral word-of-mouth that drives new business without advertising costs" }
            ],
            disability: [
                { title: "Navigate with Complete Independence", desc: "Never ask for help or feel embarrassed - explore any venue with confidence and dignity" },
                { title: "Access Your Personal AI Guide", desc: "Multilingual support in 12 African languages with detailed accessibility information for every route" },
                { title: "Break Free from Dependency", desc: "Experience true freedom to explore without relying on others or worrying about accessibility barriers" }
            ],
            entertainment: [
                { title: "Boost Visitor Satisfaction by 85%", desc: "Transform complex venues into intuitive experiences that create memorable moments and drive repeat visits" },
                { title: "Capture $2M in Accessibility Revenue", desc: "Tap into the underserved entertainment market while competitors lose visitors to accessibility barriers" },
                { title: "Generate Viral Social Media Content", desc: "Accessible experiences create shareable moments that provide millions in free marketing value" }
            ],
            enterprise: [
                { title: "Reduce Operational Costs by 40%", desc: "Eliminate expensive wayfinding staff while improving employee productivity and visitor satisfaction" },
                { title: "Attract Top Talent with Accessibility", desc: "Position your company as an inclusive employer that values diversity and accessibility leadership" },
                { title: "Streamline Complex Operations", desc: "Transform warehouses, offices, and facilities into efficient, navigable spaces that boost productivity" }
            ],
            general: [
                { title: "Save Lives During Climate Emergencies", desc: "When disasters strike, navigation guides vulnerable communities to safety and essential services" },
                { title: "Build Climate-Resilient Communities", desc: "Join 100,000+ venues creating accessible infrastructure that serves everyone during crises" },
                { title: "Ensure No One Gets Left Behind", desc: "Create inclusive spaces where every person can access services regardless of ability or emergency" }
            ]
        };

        const useCaseContainer = document.querySelector('.use-cases, .features');
        if (useCaseContainer && useCases[this.segment]) {
            this.renderUseCases(useCaseContainer, useCases[this.segment]);
        }
    }

    renderUseCases(container, cases) {
        const html = cases.map(useCase => `
            <div class="use-case-item">
                <h3>${useCase.title}</h3>
                <p>${useCase.desc}</p>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }

    updateTestimonials() {
        const testimonials = {
            ngo: {
                quote: "Before Waide, we lost 3 children during the Lagos flood evacuation. Now our emergency response saves every single life. This technology should be mandatory in every African building.",
                author: "Dr. Amina Hassan, Emergency Response Coordinator"
            },
            professional: {
                quote: "I was hemorrhaging $50K monthly from lost disabled customers. Waide turned that into $200K profit in 6 months. My competitors are still bleeding money while I dominate the accessibility market.",
                author: "James Okafor, Mall Owner (₦2.1B Revenue)"
            },
            disability: {
                quote: "I cried the first time I navigated a mall alone without asking anyone for help. After 15 years of depending on others, Waide gave me my dignity back. I'm finally free.",
                author: "Sarah Adebayo, Wheelchair User & Mother of 3"
            }
        };

        const testimonial = testimonials[this.segment];
        if (testimonial) {
            const quoteEl = document.querySelector('.testimonial-quote');
            const authorEl = document.querySelector('.testimonial-author');
            
            if (quoteEl) quoteEl.textContent = testimonial.quote;
            if (authorEl) authorEl.textContent = testimonial.author;
        }
    }

    updateCTA() {
        const ctaButtons = document.querySelectorAll('.cta-button');
        const ctaText = {
            healthcare: "Calculate Lives Saved",
            retail: "Show Me My Lost Revenue",
            hospitality: "Boost My Guest Scores",
            transportation: "End Passenger Chaos",
            education: "Protect My Students",
            government: "Avoid Costly Lawsuits",
            ngo: "Claim Your Free Impact Report",
            professional: "Show Me My Hidden Revenue",
            disability: "Start My Independence Journey",
            general: "Join the Life-Saving Mission"
        };

        ctaButtons.forEach(button => {
            button.textContent = ctaText[this.segment] || ctaText.general;
        });
    }

    trackSegmentation() {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'visitor_segmentation', {
                segment: this.segment,
                industry: this.industry,
                confidence: this.confidence,
                country: this.country
            });
        }

        // Store in localStorage for future visits
        localStorage.setItem('waide_visitor_segment', JSON.stringify({
            segment: this.segment,
            industry: this.industry,
            timestamp: Date.now()
        }));
    }

    // Behavioral tracking for refinement
    trackBehavior() {
        document.addEventListener('click', (e) => {
            if (e.target.textContent.toLowerCase().includes('accessibility')) {
                this.segment = 'disability';
                this.personalizeExperience();
            } else if (e.target.textContent.toLowerCase().includes('roi')) {
                this.segment = 'professional';
                this.personalizeExperience();
            } else if (e.target.textContent.toLowerCase().includes('impact')) {
                this.segment = 'ngo';
                this.personalizeExperience();
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.waideSegmentation = new VisitorSegmentation();
    window.waideSegmentation.trackBehavior();
});