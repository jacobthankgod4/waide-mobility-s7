// Industry-specific persona configurations
const IndustryPersonas = {
    healthcare: {
        roles: {
            hospital_admin: {
                title: "Reduce Patient Anxiety by 42%",
                subtitle: "Hospital navigation that improves patient experience and operational efficiency",
                cta: "Calculate Healthcare ROI",
                useCases: [
                    { title: "Patient Wayfinding", desc: "Reduce stress with clear navigation to departments" },
                    { title: "Emergency Response", desc: "Optimize evacuation routes and emergency procedures" },
                    { title: "Staff Efficiency", desc: "Streamline workflows with intelligent routing" }
                ]
            },
            medical_director: {
                title: "Optimize Clinical Workflows",
                subtitle: "Streamline patient flow and reduce wait times with smart navigation",
                cta: "View Clinical Benefits"
            },
            patient_experience: {
                title: "Transform Patient Journey",
                subtitle: "Create positive healthcare experiences from arrival to discharge",
                cta: "Improve Patient Satisfaction"
            }
        }
    },
    
    retail: {
        roles: {
            mall_manager: {
                title: "Increase Foot Traffic by 25%",
                subtitle: "Shopping mall navigation that drives revenue and tenant satisfaction",
                cta: "Calculate Retail ROI",
                useCases: [
                    { title: "Store Discovery", desc: "Help shoppers find stores and increase dwell time" },
                    { title: "Event Navigation", desc: "Guide visitors to promotions and special events" },
                    { title: "Accessibility Compliance", desc: "Ensure ADA-compliant navigation for all shoppers" }
                ]
            },
            store_manager: {
                title: "Convert 25% More Browsers to Buyers",
                subtitle: "In-store navigation that enhances customer experience",
                cta: "Boost Conversion Rates"
            },
            leasing_director: {
                title: "Attract Premium Tenants",
                subtitle: "Showcase advanced navigation technology to prospective retailers",
                cta: "Enhance Property Value"
            }
        }
    },
    
    hospitality: {
        roles: {
            hotel_manager: {
                title: "Boost Guest Satisfaction by 31%",
                subtitle: "Hotel navigation that creates memorable guest experiences",
                cta: "Calculate Hospitality ROI",
                useCases: [
                    { title: "Guest Services", desc: "Guide guests to amenities and services effortlessly" },
                    { title: "Event Navigation", desc: "Seamless wayfinding for conferences and weddings" },
                    { title: "Accessibility Features", desc: "Inclusive navigation for guests with disabilities" }
                ]
            },
            guest_services: {
                title: "Deliver Exceptional Service",
                subtitle: "Empower staff with tools to assist guests instantly",
                cta: "Enhance Guest Experience"
            },
            concierge: {
                title: "Become the Ultimate Guide",
                subtitle: "Provide personalized navigation recommendations",
                cta: "Elevate Concierge Services"
            }
        }
    },
    
    transportation: {
        roles: {
            airport_operations: {
                title: "Reduce Missed Connections by 35%",
                subtitle: "Airport navigation that improves passenger flow and satisfaction",
                cta: "Calculate Aviation ROI",
                useCases: [
                    { title: "Terminal Navigation", desc: "Guide passengers to gates, baggage, and services" },
                    { title: "Connection Assistance", desc: "Help travelers make tight connections" },
                    { title: "Accessibility Support", desc: "Assist passengers with mobility challenges" }
                ]
            },
            station_manager: {
                title: "Optimize Passenger Flow",
                subtitle: "Train station navigation for efficient transit connections",
                cta: "Improve Transit Efficiency"
            },
            customer_experience: {
                title: "Enhance Travel Experience",
                subtitle: "Create stress-free journeys for all passengers",
                cta: "Boost Satisfaction Scores"
            }
        }
    },
    
    education: {
        roles: {
            university_admin: {
                title: "Streamline Campus Navigation for 10,000+ Students",
                subtitle: "University wayfinding that improves student experience and campus efficiency",
                cta: "Calculate Education ROI",
                useCases: [
                    { title: "Student Orientation", desc: "Help new students navigate campus confidently" },
                    { title: "Event Management", desc: "Guide visitors during graduation and events" },
                    { title: "Accessibility Compliance", desc: "Ensure inclusive campus navigation" }
                ]
            },
            student_affairs: {
                title: "Support Student Success",
                subtitle: "Navigation tools that help students focus on learning",
                cta: "Enhance Student Experience"
            },
            disability_services: {
                title: "Enable Inclusive Education",
                subtitle: "Accessible navigation for students with disabilities",
                cta: "Promote Campus Inclusion"
            }
        }
    }
};

// Enhanced segmentation with industry detection
class EnhancedSegmentation {
    constructor() {
        try {
            this.segment = this.detectSegment();
            this.country = this.detectCountry();
            this.industry = this.detectIndustry();
            this.confidence = 0;
            this.industryRole = this.detectIndustryRole();
            this.applyIndustryPersonalization();
        } catch (error) {
            console.warn('EnhancedSegmentation initialization failed:', error);
        }
    }
    
    detectSegment() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('segment')) return params.get('segment');
        return 'general';
    }
    
    detectCountry() {
        return 'NG'; // Default to Nigeria
    }
    
    detectIndustry() {
        const params = new URLSearchParams(window.location.search);
        return params.get('industry') || 'general';
    }
    
    detectIndustryRole() {
        const params = new URLSearchParams(window.location.search);
        const role = params.get('role');
        if (role && this.industry && IndustryPersonas[this.industry]?.roles[role]) {
            return role;
        }
        
        // Default role based on industry
        const defaultRoles = {
            healthcare: 'hospital_admin',
            retail: 'mall_manager',
            hospitality: 'hotel_manager',
            transportation: 'airport_operations',
            education: 'university_admin'
        };
        
        return defaultRoles[this.industry] || null;
    }
    
    applyIndustryPersonalization() {
        if (!this.industry || !this.industryRole) return;
        
        const persona = IndustryPersonas[this.industry]?.roles[this.industryRole];
        if (!persona) return;
        
        // Override hero content with industry-specific messaging
        this.updateHeroWithIndustryContent(persona);
        this.updateUseCasesWithIndustryContent(persona);
        this.trackIndustrySegmentation();
    }
    
    updateHeroWithIndustryContent(persona) {
        const heroTitle = document.querySelector('.hero h1, .hero-title');
        const heroSubtitle = document.querySelector('.hero p, .hero-subtitle');
        const heroCTA = document.querySelector('.hero .cta-button, .hero-cta');
        
        if (heroTitle) heroTitle.textContent = persona.title;
        if (heroSubtitle) heroSubtitle.textContent = persona.subtitle;
        if (heroCTA) heroCTA.textContent = persona.cta;
    }
    
    updateUseCasesWithIndustryContent(persona) {
        if (!persona.useCases) return;
        
        const useCaseContainer = document.querySelector('.use-cases, .features');
        if (useCaseContainer) {
            this.renderUseCases(useCaseContainer, persona.useCases);
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
    
    trackIndustrySegmentation() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'industry_segmentation', {
                industry: this.industry,
                role: this.industryRole,
                segment: this.segment,
                confidence: this.confidence
            });
        }
        
        // Enhanced localStorage tracking
        localStorage.setItem('waide_visitor_segment', JSON.stringify({
            segment: this.segment,
            industry: this.industry,
            role: this.industryRole,
            timestamp: Date.now()
        }));
    }
}

// URL-based segmentation for marketing campaigns
const SegmentationURLs = {
    // NGO campaigns
    'unicef': { segment: 'ngo', industry: 'healthcare', role: 'patient_experience' },
    'who': { segment: 'ngo', industry: 'healthcare', role: 'medical_director' },
    'worldbank': { segment: 'ngo', industry: 'general', role: null },
    
    // Professional campaigns
    'linkedin-healthcare': { segment: 'professional', industry: 'healthcare', role: 'hospital_admin' },
    'linkedin-retail': { segment: 'professional', industry: 'retail', role: 'mall_manager' },
    'linkedin-hospitality': { segment: 'professional', industry: 'hospitality', role: 'hotel_manager' },
    
    // Industry-specific campaigns
    'hospital-admin': { segment: 'professional', industry: 'healthcare', role: 'hospital_admin' },
    'mall-manager': { segment: 'professional', industry: 'retail', role: 'mall_manager' },
    'hotel-manager': { segment: 'professional', industry: 'hospitality', role: 'hotel_manager' },
    'airport-ops': { segment: 'professional', industry: 'transportation', role: 'airport_operations' }
};

// Initialize enhanced segmentation
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check for campaign parameter
        const params = new URLSearchParams(window.location.search);
        const campaign = params.get('campaign');
        
        if (campaign && SegmentationURLs[campaign]) {
            const config = SegmentationURLs[campaign];
            // Set URL parameters for the segmentation system
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('segment', config.segment);
            newUrl.searchParams.set('industry', config.industry);
            if (config.role) newUrl.searchParams.set('role', config.role);
            
            // Update URL without page reload
            window.history.replaceState({}, '', newUrl);
        }
        
        // Initialize enhanced segmentation
        window.waideSegmentation = new EnhancedSegmentation();
        if (window.waideSegmentation.trackBehavior) {
            window.waideSegmentation.trackBehavior();
        }
    } catch (error) {
        console.warn('Segmentation initialization failed:', error);
    }
});