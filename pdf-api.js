const express = require('express');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const ROIPDFGenerator = require('./pdf-generator');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const pdfGenerator = new ROIPDFGenerator();
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// PDF Generation Endpoint
app.post('/api/generate-roi-pdf', async (req, res) => {
    try {
        const leadData = req.body;
        
        // Validate required fields
        if (!leadData.firstName || !leadData.lastName || !leadData.email || !leadData.company) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }

        // Generate PDF
        console.log('Generating PDF for:', leadData.company);
        const pdfBuffer = await pdfGenerator.generateROIReport(leadData);
        
        // Prepare email
        const emailSubject = `Your ROI Analysis Report - ${leadData.company}`;
        const emailBody = `
Dear ${leadData.firstName},

Thank you for your interest in Waide Mobility's AI-powered indoor navigation solutions.

Please find attached your personalized ROI analysis report based on the metrics you provided:
• Monthly Visitors: ${leadData.roiData.monthlyVisitors}
• Average Spend: $${leadData.roiData.avgSpend}
• Conversion Rate: ${leadData.roiData.conversionRate}%

Key Findings:
• Projected Annual ROI: ${leadData.roiData.roi}%
• Monthly Revenue Increase: $${leadData.roiData.monthlyIncrease}
• Annual Revenue Increase: $${leadData.roiData.annualIncrease}

Our ${leadData.roiData.plan} plan is perfectly suited for your ${leadData.venueType} venue.

Next Steps:
1. Review your detailed ROI analysis in the attached PDF
2. Schedule a personalized demo to see our technology in action
3. Discuss implementation timeline and custom requirements

Ready to transform your venue? Reply to this email or visit our demo page:
https://waidemobility.com/demo.html

Best regards,
The Waide Mobility Team

---
Waide Mobility
The future of smart navigation, powered by artificial intelligence.
hello@waidemobility.com | www.waidemobility.com
        `;

        // Store lead in Supabase database
        const { data: dbResult, error: dbError } = await supabase
            .from('roi_leads')
            .insert([
                {
                    first_name: leadData.firstName,
                    last_name: leadData.lastName,
                    email: leadData.email,
                    company: leadData.company,
                    job_title: leadData.jobTitle,
                    venue_type: leadData.venueType,
                    plan_selected: leadData.roiData.plan,
                    monthly_visitors: parseInt(leadData.roiData.monthlyVisitors),
                    avg_spend: parseFloat(leadData.roiData.avgSpend),
                    conversion_rate: parseFloat(leadData.roiData.conversionRate),
                    current_revenue: parseInt(leadData.roiData.currentRevenue.replace(/,/g, '')),
                    projected_revenue: parseInt(leadData.roiData.projectedRevenue.replace(/,/g, '')),
                    monthly_increase: parseInt(leadData.roiData.monthlyIncrease.replace(/,/g, '')),
                    annual_increase: parseInt(leadData.roiData.annualIncrease.replace(/,/g, '')),
                    plan_cost: parseInt(leadData.roiData.planCost.replace(/,/g, '')),
                    roi_percentage: parseInt(leadData.roiData.roi),
                    consent_marketing: leadData.consent || false,
                    created_at: new Date().toISOString()
                }
            ]);

        if (dbError) {
            console.error('Database error:', dbError);
            // Continue with email even if DB fails
        }

        // Send email with PDF attachment using Resend
        const filename = `${leadData.company.replace(/[^a-zA-Z0-9]/g, '-')}-ROI-Analysis.pdf`;
        
        await resend.emails.send({
            from: 'Waide Mobility <hello@waidemobility.com>',
            to: [leadData.email],
            subject: emailSubject,
            text: emailBody,
            attachments: [
                {
                    filename: filename,
                    content: pdfBuffer.toString('base64')
                }
            ]
        });
        
        // Log successful lead capture
        console.log('ROI Lead captured:', {
            id: dbResult?.[0]?.id,
            name: `${leadData.firstName} ${leadData.lastName}`,
            email: leadData.email,
            company: leadData.company,
            plan: leadData.roiData.plan,
            roi: leadData.roiData.roi
        });

        res.json({ 
            success: true, 
            message: 'PDF generated and sent successfully' 
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate PDF',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Waide Mobility PDF Generator' });
});

// Start server
app.listen(port, () => {
    console.log(`PDF Generator API running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
});

module.exports = app;