// True atomic persona framework - Global scale
const AtomicPersonas = {
    // Geographic atoms - Global coverage (54+ countries)
    geographic: {
        // Africa (22 countries)
        'NG': { currency: '₦', language: 'en', timezone: 'WAT', region: 'Africa' },
        'KE': { currency: 'KSh', language: 'sw', timezone: 'EAT', region: 'Africa' },
        'GH': { currency: '₵', language: 'en', timezone: 'GMT', region: 'Africa' },
        'ZA': { currency: 'R', language: 'en', timezone: 'SAST', region: 'Africa' },
        'EG': { currency: 'E£', language: 'ar', timezone: 'EET', region: 'Africa' },
        'MA': { currency: 'MAD', language: 'ar', timezone: 'WET', region: 'Africa' },
        'ET': { currency: 'Br', language: 'am', timezone: 'EAT', region: 'Africa' },
        'TZ': { currency: 'TSh', language: 'sw', timezone: 'EAT', region: 'Africa' },
        'UG': { currency: 'USh', language: 'en', timezone: 'EAT', region: 'Africa' },
        'RW': { currency: 'RWF', language: 'rw', timezone: 'CAT', region: 'Africa' },
        'SN': { currency: 'CFA', language: 'fr', timezone: 'GMT', region: 'Africa' },
        'CI': { currency: 'CFA', language: 'fr', timezone: 'GMT', region: 'Africa' },
        'BF': { currency: 'CFA', language: 'fr', timezone: 'GMT', region: 'Africa' },
        'ML': { currency: 'CFA', language: 'fr', timezone: 'GMT', region: 'Africa' },
        'NE': { currency: 'CFA', language: 'fr', timezone: 'WAT', region: 'Africa' },
        'TD': { currency: 'CFA', language: 'fr', timezone: 'WAT', region: 'Africa' },
        'CM': { currency: 'CFA', language: 'fr', timezone: 'WAT', region: 'Africa' },
        'BJ': { currency: 'CFA', language: 'fr', timezone: 'WAT', region: 'Africa' },
        'TG': { currency: 'CFA', language: 'fr', timezone: 'GMT', region: 'Africa' },
        'MW': { currency: 'MWK', language: 'en', timezone: 'CAT', region: 'Africa' },
        'ZM': { currency: 'ZMW', language: 'en', timezone: 'CAT', region: 'Africa' },
        'BW': { currency: 'BWP', language: 'en', timezone: 'CAT', region: 'Africa' },
        // North America (5 countries)
        'US': { currency: '$', language: 'en', timezone: 'EST', region: 'North America' },
        'CA': { currency: 'C$', language: 'en', timezone: 'EST', region: 'North America' },
        'MX': { currency: 'MX$', language: 'es', timezone: 'CST', region: 'North America' },
        'GT': { currency: 'GTQ', language: 'es', timezone: 'CST', region: 'North America' },
        'CR': { currency: 'CRC', language: 'es', timezone: 'CST', region: 'North America' },
        // Europe (12 countries)
        'GB': { currency: '£', language: 'en', timezone: 'GMT', region: 'Europe' },
        'DE': { currency: '€', language: 'de', timezone: 'CET', region: 'Europe' },
        'FR': { currency: '€', language: 'fr', timezone: 'CET', region: 'Europe' },
        'NL': { currency: '€', language: 'nl', timezone: 'CET', region: 'Europe' },
        'IT': { currency: '€', language: 'it', timezone: 'CET', region: 'Europe' },
        'ES': { currency: '€', language: 'es', timezone: 'CET', region: 'Europe' },
        'PT': { currency: '€', language: 'pt', timezone: 'WET', region: 'Europe' },
        'SE': { currency: 'SEK', language: 'sv', timezone: 'CET', region: 'Europe' },
        'NO': { currency: 'NOK', language: 'no', timezone: 'CET', region: 'Europe' },
        'DK': { currency: 'DKK', language: 'da', timezone: 'CET', region: 'Europe' },
        'FI': { currency: '€', language: 'fi', timezone: 'EET', region: 'Europe' },
        'CH': { currency: 'CHF', language: 'de', timezone: 'CET', region: 'Europe' },
        // Asia (10 countries)
        'IN': { currency: '₹', language: 'hi', timezone: 'IST', region: 'Asia' },
        'CN': { currency: '¥', language: 'zh', timezone: 'CST', region: 'Asia' },
        'JP': { currency: '¥', language: 'ja', timezone: 'JST', region: 'Asia' },
        'SG': { currency: 'S$', language: 'en', timezone: 'SGT', region: 'Asia' },
        'KR': { currency: '₩', language: 'ko', timezone: 'KST', region: 'Asia' },
        'TH': { currency: '฿', language: 'th', timezone: 'ICT', region: 'Asia' },
        'VN': { currency: '₫', language: 'vi', timezone: 'ICT', region: 'Asia' },
        'MY': { currency: 'RM', language: 'ms', timezone: 'MYT', region: 'Asia' },
        'ID': { currency: 'Rp', language: 'id', timezone: 'WIB', region: 'Asia' },
        'PH': { currency: '₱', language: 'tl', timezone: 'PHT', region: 'Asia' },
        // Oceania (3 countries)
        'AU': { currency: 'A$', language: 'en', timezone: 'AEST', region: 'Oceania' },
        'NZ': { currency: 'NZ$', language: 'en', timezone: 'NZST', region: 'Oceania' },
        'FJ': { currency: 'FJ$', language: 'en', timezone: 'FJT', region: 'Oceania' },
        // South America (7 countries)
        'BR': { currency: 'R$', language: 'pt', timezone: 'BRT', region: 'South America' },
        'AR': { currency: 'ARS', language: 'es', timezone: 'ART', region: 'South America' },
        'CL': { currency: 'CLP', language: 'es', timezone: 'CLT', region: 'South America' },
        'CO': { currency: 'COP', language: 'es', timezone: 'COT', region: 'South America' },
        'PE': { currency: 'PEN', language: 'es', timezone: 'PET', region: 'South America' },
        'UY': { currency: 'UYU', language: 'es', timezone: 'UYT', region: 'South America' },
        'EC': { currency: '$', language: 'es', timezone: 'ECT', region: 'South America' }
    },
    
    // Organizational size atoms - Extended scale
    orgSize: {
        government: { employees: '10000+', budget: 'public', decisionTime: 'very long' },
        enterprise: { employees: '1000+', budget: 'high', decisionTime: 'long' },
        midmarket: { employees: '100-999', budget: 'medium', decisionTime: 'medium' },
        small: { employees: '10-99', budget: 'low', decisionTime: 'fast' },
        startup: { employees: '1-9', budget: 'very low', decisionTime: 'very fast' }
    },
    
    // Decision role atoms - Complete decision matrix (16 roles)
    decisionRole: {
        // C-Suite
        ceo: { focus: 'strategic growth', messaging: 'competitive advantage' },
        cfo: { focus: 'ROI', messaging: 'cost savings and revenue' },
        cto: { focus: 'technology strategy', messaging: 'innovation leadership' },
        coo: { focus: 'operations', messaging: 'efficiency gains' },
        // Directors
        facilities_director: { focus: 'space optimization', messaging: 'facility management' },
        it_director: { focus: 'integration', messaging: 'technical implementation' },
        marketing_director: { focus: 'customer experience', messaging: 'brand differentiation' },
        hr_director: { focus: 'employee experience', messaging: 'workplace satisfaction' },
        // Managers
        project_manager: { focus: 'implementation', messaging: 'project success' },
        operations_manager: { focus: 'daily operations', messaging: 'workflow optimization' },
        customer_service_manager: { focus: 'service quality', messaging: 'customer satisfaction' },
        // Specialists
        accessibility_coordinator: { focus: 'compliance', messaging: 'inclusive access' },
        safety_officer: { focus: 'risk management', messaging: 'emergency preparedness' },
        procurement_specialist: { focus: 'vendor selection', messaging: 'value for money' },
        // End Users
        end_user: { focus: 'usability', messaging: 'ease of use' },
        administrator: { focus: 'system management', messaging: 'administrative efficiency' }
    },
    
    // Psychographic atoms - Complete motivation matrix (12 motivations)
    motivation: {
        // Primary motivations
        impact_driven: { values: 'social good', messaging: 'community benefit', priority: 'social impact' },
        profit_driven: { values: 'revenue', messaging: 'business growth', priority: 'financial returns' },
        innovation_driven: { values: 'technology', messaging: 'cutting edge', priority: 'technological advancement' },
        compliance_driven: { values: 'safety', messaging: 'risk mitigation', priority: 'regulatory adherence' },
        // Secondary motivations
        efficiency_driven: { values: 'optimization', messaging: 'operational excellence', priority: 'process improvement' },
        customer_driven: { values: 'satisfaction', messaging: 'user experience', priority: 'customer success' },
        sustainability_driven: { values: 'environment', messaging: 'green solutions', priority: 'environmental impact' },
        growth_driven: { values: 'expansion', messaging: 'market leadership', priority: 'business scaling' },
        // Tertiary motivations
        quality_driven: { values: 'excellence', messaging: 'premium standards', priority: 'quality assurance' },
        security_driven: { values: 'protection', messaging: 'data security', priority: 'risk management' },
        cost_driven: { values: 'savings', messaging: 'budget optimization', priority: 'cost reduction' },
        reputation_driven: { values: 'brand', messaging: 'market positioning', priority: 'brand enhancement' }
    },
    
    // Disability-specific atoms
    accessibility: {
        mobility: { needs: 'wheelchair routes', tech: 'voice navigation' },
        visual: { needs: 'audio cues', tech: 'screen reader' },
        cognitive: { needs: 'simple interface', tech: 'clear instructions' },
        hearing: { needs: 'visual alerts', tech: 'sign language' }
    }
};

// Atomic combination engine
class AtomicSegmentation {
    constructor() {
        this.atoms = {
            segment: null,      // ngo, professional, disability
            industry: null,     // All 22 industries from use cases
            role: null,         // Industry-specific roles
            geography: null,    // Global - 54+ countries
            orgSize: null,      // government, enterprise, midmarket, small, startup
            decisionRole: null, // 16 decision-making roles
            motivation: null,   // impact_driven, profit_driven, innovation_driven, compliance_driven
            accessibility: null, // mobility, visual, cognitive, hearing
            language: null,     // Detected from geography
            timezone: null,     // Detected from geography
            region: null        // Africa, North America, Europe, Asia, Oceania, South America
        };
        this.detectAtoms();
        this.combineAtoms();
        this.initializeLanguageSupport();
    }
    
    initializeLanguageSupport() {
        // Add Google Translate widget
        this.addGoogleTranslate();
        
        // Set page language attributes
        this.setLanguageAttributes();
        
        // Add hreflang tags for SEO
        this.addHreflangTags();
    }
    
    addGoogleTranslate() {
        // Add Google Translate script
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.head.appendChild(script);
            
            // Initialize Google Translate
            window.googleTranslateElementInit = () => {
                new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,fr,es,pt,de,it,ar,sw,hi,zh,ja,ko,th,vi,ms,id,tl,sv,no,da,fi,nl,am,rw',
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                }, 'google_translate_element');
            };
            
            // Add translate widget container
            const translateDiv = document.createElement('div');
            translateDiv.id = 'google_translate_element';
            translateDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: white; padding: 5px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
            document.body.appendChild(translateDiv);
        }
    }
    
    setLanguageAttributes() {
        // Set HTML lang attribute
        document.documentElement.lang = this.atoms.language || 'en';
        
        // Add language-specific meta tags
        const langMeta = document.createElement('meta');
        langMeta.name = 'language';
        langMeta.content = this.atoms.language || 'en';
        document.head.appendChild(langMeta);
    }
    
    addHreflangTags() {
        // Add hreflang tags for all supported languages
        const languages = {
            'en': 'English',
            'fr': 'Français', 
            'es': 'Español',
            'pt': 'Português',
            'de': 'Deutsch',
            'it': 'Italiano',
            'ar': 'العربية',
            'sw': 'Kiswahili',
            'hi': 'हिन्दी',
            'zh': '中文',
            'ja': '日本語',
            'ko': '한국어',
            'th': 'ไทย',
            'vi': 'Tiếng Việt',
            'ms': 'Bahasa Melayu',
            'id': 'Bahasa Indonesia',
            'tl': 'Filipino',
            'sv': 'Svenska',
            'no': 'Norsk',
            'da': 'Dansk',
            'fi': 'Suomi',
            'nl': 'Nederlands',
            'am': 'አማርኛ',
            'rw': 'Kinyarwanda'
        };
        
        Object.keys(languages).forEach(lang => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = lang;
            link.href = `${window.location.origin}${window.location.pathname}?lang=${lang}`;
            document.head.appendChild(link);
        });
    }
    
    detectAtoms() {
        // Get from existing segmentation if available
        if (window.waideSegmentation) {
            this.atoms.segment = window.waideSegmentation.segment;
            this.atoms.industry = window.waideSegmentation.industry;
            this.atoms.role = window.waideSegmentation.industryRole;
        }
        
        this.atoms.geography = this.detectGeography();
        this.atoms.orgSize = this.detectOrgSize();
        this.atoms.decisionRole = this.detectDecisionRole();
        this.atoms.motivation = this.detectMotivation();
        this.atoms.accessibility = this.detectAccessibility();
    }
    
    detectGeography() {
        const params = new URLSearchParams(window.location.search);
        const country = params.get('country');
        if (country && AtomicPersonas.geographic[country]) {
            this.atoms.language = AtomicPersonas.geographic[country].language;
            this.atoms.timezone = AtomicPersonas.geographic[country].timezone;
            this.atoms.region = AtomicPersonas.geographic[country].region;
            return country;
        }
        
        // IP-based detection (fallback to Nigeria for Africa focus)
        return 'NG';
    }
    
    detectOrgSize() {
        const params = new URLSearchParams(window.location.search);
        const size = params.get('org_size');
        if (size) return size;
        
        const referrer = document.referrer.toLowerCase();
        if (referrer.includes('government') || referrer.includes('.gov')) return 'government';
        if (referrer.includes('enterprise') || referrer.includes('fortune')) return 'enterprise';
        if (referrer.includes('startup')) return 'startup';
        if (referrer.includes('small')) return 'small';
        return 'midmarket';
    }
    
    detectDecisionRole() {
        const params = new URLSearchParams(window.location.search);
        const role = params.get('decision_role');
        if (role) return role;
        
        const clicks = this.getClickHistory();
        if (clicks.includes('pricing') || clicks.includes('roi')) return 'budget_holder';
        if (clicks.includes('integration') || clicks.includes('api')) return 'technical';
        return 'end_user';
    }
    
    detectMotivation() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('motivation')) return params.get('motivation');
        
        if (this.atoms.segment === 'ngo') return 'impact_driven';
        if (this.atoms.segment === 'professional') return 'profit_driven';
        return 'innovation_driven';
    }
    
    detectAccessibility() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('accessibility')) return params.get('accessibility');
        
        if (this.atoms.segment === 'disability') return 'visual';
        return null;
    }
    
    combineAtoms() {
        // Generate atomic persona combination
        const combination = Object.values(this.atoms).filter(Boolean).join('_');
        console.log('Atomic persona:', combination);
        
        // Apply atomic personalization
        this.personalizeWithAtoms();
    }
    
    personalizeWithAtoms() {
        const content = this.generateAtomicContent();
        this.updatePageContent(content);
    }
    
    updatePageContent(content) {
        // Hero section
        this.updateHeroSection(content);
        
        // Waide Mobility section
        this.updateWaideMobilitySection(content);
        
        // Venue owner section
        this.updateVenueOwnerSection(content);
        
        // Business benefits section
        this.updateBusinessBenefitsSection(content);
        
        // Testimonials section
        this.updateTestimonialsSection(content);
        
        // Update all CTAs and navigation
        this.updateAllCTAs(content.ctaLink);
        this.updateNavigation();
        
        // Add language-specific content hints
        this.addLanguageHints();
    }
    
    addLanguageHints() {
        // Add subtle language indicators for better UX
        const languageNames = {
            'en': 'English',
            'fr': 'Français', 
            'es': 'Español',
            'pt': 'Português',
            'de': 'Deutsch',
            'ar': 'العربية',
            'sw': 'Kiswahili',
            'hi': 'हिन्दी',
            'zh': '中文',
            'ja': '日本語'
        };
        
        if (this.atoms.language && this.atoms.language !== 'en') {
            const hint = document.createElement('div');
            hint.style.cssText = 'position: fixed; bottom: 20px; left: 20px; background: #00ffff; color: #000; padding: 8px 12px; border-radius: 5px; font-size: 12px; z-index: 1000;';
            hint.textContent = `Available in ${languageNames[this.atoms.language] || this.atoms.language}`;
            document.body.appendChild(hint);
            
            // Auto-hide after 5 seconds
            setTimeout(() => hint.remove(), 5000);
        }
    }
    
    updateHeroSection(content) {
        const heroTitle = document.querySelector('.hero h1, .hero-title');
        const heroSubtitle = document.querySelector('.hero p, .hero-subtitle');
        const heroCTA = document.querySelector('.hero .cta-button, .hero-cta');
        
        if (heroTitle) heroTitle.textContent = content.title;
        if (heroSubtitle) heroSubtitle.textContent = content.subtitle;
        if (heroCTA) {
            heroCTA.textContent = content.cta;
            heroCTA.href = content.ctaLink;
        }
    }
    
    updateWaideMobilitySection(content) {
        const sectionTitle = document.querySelector('.waide-mobility-title');
        const sectionDesc = document.querySelector('.waide-mobility-description');
        
        if (this.atoms.accessibility) {
            if (sectionTitle) sectionTitle.innerHTML = 'Accessible Navigation<br><span class="gradient-text">Designed for You</span>';
            if (sectionDesc) sectionDesc.textContent = 'Our navigation system empowers individuals with diverse abilities to move through spaces with complete independence and confidence.';
        } else if (this.atoms.segment === 'ngo') {
            if (sectionTitle) sectionTitle.innerHTML = 'Climate-Resilient Navigation<br><span class="gradient-text">for Vulnerable Communities</span>';
            if (sectionDesc) sectionDesc.textContent = 'Supporting SDG goals with accessible navigation that helps communities adapt to climate challenges and extreme weather events.';
        }
    }
    
    updateVenueOwnerSection(content) {
        const sectionTitle = document.querySelector('.venue-owner-section h2');
        const sectionText = document.querySelector('.venue-owner-section p');
        
        if (this.atoms.decisionRole === 'budget_holder') {
            if (sectionTitle) sectionTitle.textContent = 'Turn Accessibility into Revenue Growth';
            if (sectionText) sectionText.textContent = 'Capture your share of the $1T accessible tourism market. Our ROI calculator shows exactly how accessibility improvements drive revenue growth and reduce operational costs.';
        } else if (this.atoms.decisionRole === 'technical') {
            if (sectionTitle) sectionTitle.textContent = 'Seamless Technical Integration';
            if (sectionText) sectionText.textContent = 'Enterprise-grade APIs, cloud infrastructure, and comprehensive documentation make implementation straightforward. Zero downtime deployment with full technical support.';
        }
    }
    
    updateBusinessBenefitsSection(content) {
        const benefitCards = document.querySelectorAll('.modern-benefit-card h3');
        
        if (this.atoms.industry === 'healthcare' && benefitCards.length > 0) {
            benefitCards[0].textContent = 'Improve Patient Outcomes';
            benefitCards[1].textContent = 'HIPAA Compliance';
            benefitCards[2].textContent = 'Reduce Patient Anxiety';
        } else if (this.atoms.industry === 'retail' && benefitCards.length > 0) {
            benefitCards[0].textContent = 'Increase Sales Conversion';
            benefitCards[1].textContent = 'Boost Foot Traffic';
            benefitCards[2].textContent = 'Enhance Shopping Experience';
        }
    }
    
    updateTestimonialsSection(content) {
        const testimonials = document.querySelectorAll('.testimonials-section p');
        const authors = document.querySelectorAll('.testimonials-section cite');
        
        const personaTestimonials = {
            'healthcare': {
                quote: 'Waide has transformed patient navigation in our hospital. 42% reduction in patient anxiety and significantly improved satisfaction scores.',
                author: '- Dr. Amina Hassan, Lagos University Teaching Hospital'
            },
            'retail': {
                quote: 'Since implementing Waide, our mall has seen 25% increase in foot traffic and 18% boost in average spend per visitor.',
                author: '- James Okafor, Ikeja City Mall Manager'
            },
            'disability': {
                quote: 'Finally, a navigation system designed with us, not for us. The audio guidance in Yoruba is life-changing.',
                author: '- Sarah Adebayo, Disability Rights Advocate'
            }
        };
        
        const testimonial = personaTestimonials[this.atoms.industry] || personaTestimonials[this.atoms.segment];
        if (testimonial && testimonials.length > 0) {
            testimonials[0].textContent = testimonial.quote;
            if (authors.length > 0) authors[0].textContent = testimonial.author;
        }
    }
    
    updateAllCTAs(link) {
        // Update all CTA buttons with persona-specific links
        const ctaButtons = document.querySelectorAll('.btn-primary, .cta-button, .btn');
        ctaButtons.forEach(btn => {
            // Skip navigation buttons
            if (btn.closest('.nav')) return;
            
            // Update href or onclick
            if (btn.tagName === 'A') {
                btn.href = link;
            } else if (btn.onclick) {
                btn.onclick = () => window.location.href = link;
            }
        });
        
        // Update specific buttons by text content
        document.querySelectorAll('button, a').forEach(element => {
            const text = element.textContent.toLowerCase();
            
            if (text.includes('calculate') && text.includes('roi')) {
                element.href = 'roi-calculator.html';
            } else if (text.includes('accessibility') && text.includes('quiz')) {
                element.href = 'https://waide-accessibility-navigator-439cb45a.base44.app';
            } else if (text.includes('start mapping')) {
                element.href = 'demo.html';
            }
        });
    }
    
    updateNavigation() {
        // Complete navigation linking for all personas
        const industryPages = {
            healthcare: 'blog/hospital-navigation.html',
            retail: 'blog/mall-navigation.html',
            hospitality: 'blog/hotel-navigation.html',
            transportation: 'blog/airport-navigation.html',
            education: 'blog/university-navigation.html'
        };
        
        // Update Use Cases dropdown links
        if (this.atoms.industry && industryPages[this.atoms.industry]) {
            const useCasesLink = document.querySelector('a[href="use-cases.html"]');
            if (useCasesLink) useCasesLink.href = industryPages[this.atoms.industry];
        }
        
        // Update Pricing/Solutions links based on decision role
        if (this.atoms.decisionRole === 'budget_holder') {
            document.querySelectorAll('a[href="pricing.html"]').forEach(link => {
                link.href = 'roi-calculator.html';
            });
        } else if (this.atoms.decisionRole === 'technical') {
            document.querySelectorAll('a[href="pricing.html"]').forEach(link => {
                link.href = 'solutions.html';
            });
        }
        
        // Update all demo links with persona context
        document.querySelectorAll('a[href="demo.html"]').forEach(link => {
            let demoUrl = 'demo.html';
            if (this.atoms.accessibility) demoUrl += '?accessibility=' + this.atoms.accessibility;
            if (this.atoms.industry) demoUrl += (demoUrl.includes('?') ? '&' : '?') + 'industry=' + this.atoms.industry;
            link.href = demoUrl;
        });
        
        // Update footer links
        this.updateFooterLinks();
        
        // Update mega dropdown links
        this.updateMegaDropdown();
    }
    
    updateFooterLinks() {
        const footerLinks = document.querySelectorAll('.footer a');
        footerLinks.forEach(link => {
            if (link.textContent.includes('Request Demo')) {
                link.href = this.getPersonalizedDemoLink();
            }
        });
    }
    
    updateMegaDropdown() {
        // Highlight relevant industry in mega dropdown
        if (this.atoms.industry === 'healthcare') {
            const healthcareSection = document.querySelector('.dropdown-section h4');
            if (healthcareSection && healthcareSection.textContent.includes('Healthcare')) {
                healthcareSection.style.color = '#00ffff';
                healthcareSection.style.fontWeight = 'bold';
            }
        }
    }
    
    getPersonalizedDemoLink() {
        let demoUrl = 'demo.html';
        const params = [];
        
        if (this.atoms.segment) params.push('segment=' + this.atoms.segment);
        if (this.atoms.industry) params.push('industry=' + this.atoms.industry);
        if (this.atoms.role) params.push('role=' + this.atoms.role);
        if (this.atoms.accessibility) params.push('accessibility=' + this.atoms.accessibility);
        
        if (params.length > 0) {
            demoUrl += '?' + params.join('&');
        }
        
        return demoUrl;
    }
    
    generateAtomicContent() {
        let title = "Transform Indoor Navigation";
        let subtitle = "AI-powered wayfinding solutions";
        let cta = "Get Started";
        let ctaLink = "demo.html";
        
        // Industry-specific links
        const industryLinks = {
            healthcare: 'blog/hospital-navigation.html',
            retail: 'blog/mall-navigation.html',
            hospitality: 'blog/hotel-navigation.html',
            transportation: 'blog/airport-navigation.html',
            education: 'blog/university-navigation.html'
        };
        
        // Decision role specific links
        const roleLinks = {
            budget_holder: 'roi-calculator.html',
            technical: 'solutions.html',
            end_user: 'demo.html',
            compliance: 'about.html#compliance'
        };
        
        // Segment-specific links
        const segmentLinks = {
            ngo: 'https://waide-accessibility-navigator-439cb45a.base44.app',
            professional: 'roi-calculator.html',
            disability: 'demo.html?accessibility=true'
        };
        
        // Apply atomic combinations with enhanced messaging
        if (this.atoms.industry === 'healthcare' && this.atoms.role === 'hospital_admin') {
            title = "Improve Patient Outcomes by 42%";
            subtitle = "Reduce wait times, eliminate confusion, and enhance care delivery with smart hospital navigation for " + (this.atoms.geography === 'NG' ? 'Nigerian' : 'African') + " healthcare facilities";
            ctaLink = industryLinks.healthcare;
        }
        
        if (this.atoms.industry === 'retail' && this.atoms.role === 'mall_manager') {
            title = "Increase Foot Traffic by 25%";
            subtitle = "Drive revenue growth, boost tenant satisfaction, and create memorable shopping experiences with intelligent mall navigation that guides customers to stores and promotions";
            ctaLink = industryLinks.retail;
        }
        
        if (this.atoms.industry === 'hospitality' && this.atoms.role === 'hotel_manager') {
            title = "Boost Guest Satisfaction by 31%";
            subtitle = "Elevate service quality, reduce guest frustration, and increase positive reviews with seamless hotel navigation that guides guests to amenities and services effortlessly";
            ctaLink = industryLinks.hospitality;
        }
        
        if (this.atoms.decisionRole === 'budget_holder') {
            cta = "Calculate ROI";
            ctaLink = roleLinks.budget_holder;
        } else if (this.atoms.decisionRole === 'technical') {
            cta = "View Integration Guide";
            ctaLink = roleLinks.technical;
        }
        
        if (this.atoms.segment === 'ngo') {
            title = "Advance SDG 10: Reduced Inequalities";
            subtitle = "Empower vulnerable communities with accessible navigation technology that supports climate resilience, promotes inclusion, and creates measurable social impact across African cities";
            cta = "Get Impact Assessment";
            ctaLink = segmentLinks.ngo;
        }
        
        if (this.atoms.accessibility === 'visual') {
            title = "Navigate with Complete Independence";
            subtitle = "Experience freedom of movement with voice-powered wayfinding, audio cues, and step-by-step directions in local African languages - designed by and for the visually impaired community";
            ctaLink = segmentLinks.disability;
        }
        
        if (this.atoms.accessibility === 'mobility') {
            title = "Accessible Routes for Every Journey";
            subtitle = "Navigate confidently with wheelchair-friendly paths, elevator locations, and barrier-free routing that ensures dignified access to every destination";
            ctaLink = segmentLinks.disability;
        }
        
        return { title, subtitle, cta, ctaLink };
    }
    
    getClickHistory() {
        return JSON.parse(localStorage.getItem('click_history') || '[]');
    }
}

// Initialize atomic segmentation
document.addEventListener('DOMContentLoaded', () => {
    window.atomicSegmentation = new AtomicSegmentation();
});