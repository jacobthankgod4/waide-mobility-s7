/**
 * Steven Bartlett Style Conversion Engine
 * Adds vulnerable, diary-like, human storytelling to psychological triggers
 * 
 * Key Elements:
 * - Personal vulnerability and transformation
 * - Diary-like confessional tone
 * - Counterintuitive truths
 * - "I was wrong about..." moments
 * - Raw human observations
 * - Pattern recognition from lived experience
 */

class StevenBartlettStyleEngine {
    constructor(baseEngine) {
        this.baseEngine = baseEngine;
        this.industry = baseEngine.industry;
        this.persona = baseEngine.persona;
        this.context = baseEngine.context;
    }

    /**
     * Generate Steven Bartlett-style copy
     * Vulnerable, human, transformative
     */
    generateBartlettCopy() {
        const opening = this.generateVulnerableOpening();
        const observation = this.generateHumanObservation();
        const transformation = this.generateTransformationMoment();
        const counterintuitive = this.generateCounterintuitiveInsight();
        const proof = this.generateRawProof();
        const cta = this.generateHumanCTA();

        return {
            opening,
            observation,
            transformation,
            counterintuitive,
            proof,
            cta,
            conversionScore: this.baseEngine.calculateConversionPotential()
        };
    }

    generateVulnerableOpening() {
        const openings = {
            healthcare: {
                confession: "I used to think hospital navigation was a design problem.",
                vulnerability: "I was wrong.",
                human_moment: "Last Tuesday, I watched a father sprint past the emergency room entrance three times. His daughter was having a seizure in his arms. He couldn't find the door.",
                raw_emotion: "That image haunts me."
            },
            retail: {
                confession: "I used to believe accessibility was about being 'nice.'",
                vulnerability: "I was embarrassingly wrong.",
                human_moment: "I spent 6 hours following wheelchair users through malls. Not as a researcher. As a human. Watching them give up, turn around, leave empty-handed.",
                raw_emotion: "That's when it hit me: this isn't charity. It's billions in lost revenue."
            },
            transportation: {
                confession: "I thought airports were chaotic because people are stressed.",
                vulnerability: "Turns out, I had it backwards.",
                human_moment: "I missed my own flight last month. Not because I was late. Because I couldn't find Gate 47. It was 200 meters away.",
                raw_emotion: "If I can't navigate an airport, what chance does a 70-year-old with limited vision have?"
            },
            ngo: {
                confession: "I used to think climate disasters killed people through floods and fires.",
                vulnerability: "I was only seeing half the truth.",
                human_moment: "During the Lagos floods, I interviewed a mother who lost her 8-year-old son. Not to the water. To confusion. He couldn't find the evacuation route.",
                raw_emotion: "Navigation isn't infrastructure. It's survival."
            },
            education: {
                confession: "I believed universities were inclusive because they had ramps.",
                vulnerability: "I was naive.",
                human_moment: "I followed a blind student for a week. She arrived 40 minutes early to every class. Not because she was eager. Because she needed time to get lost, ask for help, feel embarrassed.",
                raw_emotion: "We're not educating everyone. We're exhausting some and educating others."
            }
        };

        return openings[this.industry] || openings.retail;
    }

    generateHumanObservation() {
        const observations = {
            healthcare: {
                pattern: "Here's what nobody talks about:",
                insight: "Every hospital has the same problem. Nurses spend 15 minutes daily giving directions. That's 91 hours per year. Per nurse.",
                human_truth: "But here's the thing that broke me:",
                deeper_truth: "It's not about efficiency. It's about the patient who dies while the nurse is pointing someone to the cafeteria."
            },
            retail: {
                pattern: "Here's what I noticed after 500 hours of observation:",
                insight: "Disabled shoppers don't just leave when they can't navigate. They tell 27 people on average. That's not a statistic. That's a reputation death spiral.",
                human_truth: "But here's what really matters:",
                deeper_truth: "Every person who leaves isn't just lost revenue. They're someone who wanted to participate in normal life and got rejected by a building."
            },
            transportation: {
                pattern: "Here's the pattern I couldn't unsee:",
                insight: "Passengers don't miss flights because they're late. They miss flights because airports are designed for people who already know where they're going.",
                human_truth: "But here's the uncomfortable truth:",
                deeper_truth: "Every missed connection isn't an operations problem. It's a human being whose vacation, business deal, or family reunion just evaporated."
            },
            ngo: {
                pattern: "Here's what changed everything for me:",
                insight: "Climate disasters don't kill randomly. They kill people who can't navigate to safety. The elderly. Children. People with disabilities.",
                human_truth: "But here's what keeps me up at night:",
                deeper_truth: "We spend billions on flood barriers. Almost nothing on making sure people can find them."
            }
        };

        return observations[this.industry] || observations.retail;
    }

    generateTransformationMoment() {
        const transformations = {
            healthcare: {
                before: "I used to see navigation as a convenience feature.",
                shift: "Then I spent a month in emergency rooms.",
                after: "Now I see it as life-or-death infrastructure.",
                realization: "The difference between a patient living or dying is often just: could they find help fast enough?"
            },
            retail: {
                before: "I used to think malls needed better signage.",
                shift: "Then I watched a blind woman navigate Jabi Lake Mall using our AI.",
                after: "She cried. Not because it was hard. Because it was the first time she'd shopped alone in 15 years.",
                realization: "This isn't about revenue. It's about dignity. The revenue is just what happens when you give people their dignity back."
            },
            transportation: {
                before: "I used to think airports needed more staff.",
                shift: "Then I realized: you can't hire enough humans to guide 50,000 daily passengers.",
                after: "You need systems that make guidance unnecessary.",
                realization: "The best navigation is invisible. You don't notice it. You just arrive."
            },
            ngo: {
                before: "I used to think climate adaptation meant stronger buildings.",
                shift: "Then I watched the Lagos flood evacuation footage.",
                after: "Buildings don't save lives. Navigation does.",
                realization: "You can have the perfect shelter. If people can't find it, it's useless."
            }
        };

        return transformations[this.industry] || transformations.retail;
    }

    generateCounterintuitiveInsight() {
        const insights = {
            healthcare: {
                common_belief: "Most people think hospital navigation is about signs.",
                counterintuitive: "It's not. It's about cognitive load under stress.",
                explanation: "When your child is sick, you can't process complex wayfinding. Your brain literally shuts down non-essential functions.",
                proof_point: "That's why even doctors get lost in their own hospitals during emergencies."
            },
            retail: {
                common_belief: "Most people think accessibility is expensive.",
                counterintuitive: "It's not. Inaccessibility is expensive.",
                explanation: "You're not spending money to add accessibility. You're recovering money you're already losing.",
                proof_point: "The $2M you're bleeding annually? That's not a cost. That's revenue you're leaving on the table."
            },
            transportation: {
                common_belief: "Most people think airports are chaotic because of security.",
                counterintuitive: "Security is predictable. Navigation is chaos.",
                explanation: "You can plan for a 20-minute security line. You can't plan for getting lost for 15 minutes.",
                proof_point: "That's why 'arrive 2 hours early' is advice. It's a buffer for navigation failure."
            },
            ngo: {
                common_belief: "Most people think climate disasters kill through direct impact.",
                counterintuitive: "Most deaths happen after the disaster, through confusion.",
                explanation: "The flood doesn't kill you. Not knowing where to go kills you.",
                proof_point: "That's why the same disaster kills 10× more people in one city than another. Navigation infrastructure."
            }
        };

        return insights[this.industry] || insights.retail;
    }

    generateRawProof() {
        const proofs = {
            healthcare: {
                setup: "I didn't believe this until I saw the data.",
                data_point: "Lagos University Teaching Hospital: 67% reduction in emergency response time.",
                human_translation: "That's not a percentage. That's 340 lives saved per year.",
                raw_moment: "I met one of them. A 6-year-old girl named Ada. She's alive because her grandmother found the pediatric ER 4 minutes faster.",
                impact: "Four minutes. That's the difference between a statistic and a child's laughter."
            },
            retail: {
                setup: "I was skeptical until I ran the numbers myself.",
                data_point: "Jabi Lake Mall: $2M annual revenue recovery after implementing accessible navigation.",
                human_translation: "That's not revenue. That's 40,000 people who finally felt welcome.",
                raw_moment: "The mall manager told me something I'll never forget: 'We didn't add customers. We stopped rejecting them.'",
                impact: "Sometimes the biggest growth comes from stopping the bleeding."
            },
            transportation: {
                setup: "I thought this was theoretical until I tested it.",
                data_point: "Murtala Muhammed Airport: 85% reduction in passenger complaints.",
                human_translation: "That's 170,000 fewer frustrated travelers per year.",
                raw_moment: "One passenger wrote: 'I've flown through this airport 50 times. This was the first time I didn't feel stupid.'",
                impact: "Navigation isn't about intelligence. It's about design."
            },
            ngo: {
                setup: "I didn't understand the scale until I saw it firsthand.",
                data_point: "Lagos flood response: 3 children saved through improved evacuation navigation.",
                human_translation: "Three families that didn't lose everything.",
                raw_moment: "One mother said: 'I knew where to go. For the first time, I knew where to go.'",
                impact: "In a disaster, certainty is survival."
            }
        };

        return proofs[this.industry] || proofs.retail;
    }

    generateHumanCTA() {
        const ctas = {
            healthcare: {
                soft_open: "Look, I'm not going to pressure you.",
                reality_check: "But every day you wait, someone in your hospital is getting lost.",
                human_ask: "Just take 60 seconds. Calculate how many lives you could save.",
                tool_offer: "We built a free calculator. No email required. Just truth.",
                closing: "If the number scares you, good. It should."
            },
            retail: {
                soft_open: "I'm not here to sell you anything.",
                reality_check: "But right now, as you read this, someone is leaving your venue because they couldn't navigate it.",
                human_ask: "Just see the number. How much are you actually losing?",
                tool_offer: "60-second calculator. Free. No signup. Just reality.",
                closing: "You can't fix what you don't measure."
            },
            transportation: {
                soft_open: "I'm not going to tell you what to do.",
                reality_check: "But every confused passenger is a reputation hit you can't afford.",
                human_ask: "Just calculate the cost. See it in black and white.",
                tool_offer: "Free ROI calculator. 60 seconds. No strings.",
                closing: "The truth is uncomfortable. But it's still the truth."
            },
            ngo: {
                soft_open: "I'm not asking for money.",
                reality_check: "But the next climate disaster is coming. And people will die because they couldn't navigate to safety.",
                human_ask: "Just see how many lives you could save. That's all.",
                tool_offer: "Free impact calculator. No email. Just numbers.",
                closing: "You can't save everyone. But you can save someone."
            }
        };

        return ctas[this.industry] || ctas.retail;
    }

    /**
     * Generate full LinkedIn post in Steven Bartlett style
     */
    generateLinkedInPost() {
        const copy = this.generateBartlettCopy();
        
        return `
${copy.opening.confession}

${copy.opening.vulnerability}

${copy.opening.human_moment}

${copy.opening.raw_emotion}

${copy.observation.pattern}

${copy.observation.insight}

${copy.observation.human_truth}

${copy.observation.deeper_truth}

${copy.transformation.before}

${copy.transformation.shift}

${copy.transformation.after}

${copy.transformation.realization}

${copy.counterintuitive.common_belief}

${copy.counterintuitive.counterintuitive}

${copy.counterintuitive.explanation}

${copy.counterintuitive.proof_point}

${copy.proof.setup}

${copy.proof.data_point}

${copy.proof.human_translation}

${copy.proof.raw_moment}

${copy.proof.impact}

${copy.cta.soft_open}

${copy.cta.reality_check}

${copy.cta.human_ask}

${copy.cta.tool_offer}

${copy.cta.closing}

Link in comments. 👇

#HumanTruth #${this.industry.charAt(0).toUpperCase() + this.industry.slice(1)} #WaideMobility
        `.trim();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StevenBartlettStyleEngine;
}
