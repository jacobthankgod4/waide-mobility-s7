const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class ROIPDFGenerator {
    constructor() {
        this.templatePath = path.join(__dirname, 'roi-report-template.html');
    }

    async generateROIReport(leadData) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            
            // Set viewport for consistent rendering
            await page.setViewport({ width: 1200, height: 1600 });
            
            // Generate HTML content
            const htmlContent = await this.generateHTMLTemplate(leadData);
            
            // Set content and wait for fonts/images to load
            await page.setContent(htmlContent, { 
                waitUntil: ['networkidle0', 'domcontentloaded'] 
            });
            
            // Generate PDF with high quality settings
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                preferCSSPageSize: true
            });

            return pdf;
        } finally {
            await browser.close();
        }
    }

    async generateHTMLTemplate(leadData) {
        const { roiData } = leadData;
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ROI Analysis Report - ${leadData.company}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #000 0%, #111 50%, #000 100%);
            color: white;
            line-height: 1.6;
        }

        .report-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }

        /* Header Section */
        .report-header {
            text-align: center;
            padding: 3rem 0;
            background: linear-gradient(135deg, #001a1a, #002626);
            border-radius: 20px;
            margin-bottom: 3rem;
            position: relative;
            overflow: hidden;
        }

        .report-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #00e6ff, #06b6d4, #00e6ff);
        }

        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 1rem;
            background: #00e6ff;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.5rem;
            color: #000;
        }

        .report-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #00e6ff, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .report-subtitle {
            font-size: 1.2rem;
            color: #ccc;
            margin-bottom: 2rem;
        }

        .client-info {
            background: rgba(0, 230, 255, 0.1);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid rgba(0, 230, 255, 0.3);
        }

        .client-company {
            font-size: 1.8rem;
            font-weight: 700;
            color: #00e6ff;
            margin-bottom: 0.5rem;
        }

        /* Executive Summary */
        .executive-summary {
            background: linear-gradient(135deg, #111, #222);
            padding: 3rem;
            border-radius: 20px;
            margin-bottom: 3rem;
            border: 1px solid #333;
        }

        .summary-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 2rem;
            text-align: center;
        }

        .roi-showcase {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 3rem;
            flex-wrap: wrap;
        }

        .roi-circle {
            width: 200px;
            height: 200px;
            border: 8px solid #00e6ff;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: radial-gradient(circle, rgba(0, 230, 255, 0.1), transparent);
            position: relative;
            margin: 0 auto;
        }

        .roi-circle::before {
            content: '';
            position: absolute;
            width: 220px;
            height: 220px;
            border: 2px solid rgba(0, 230, 255, 0.3);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.1); opacity: 0; }
        }

        .roi-number {
            font-size: 3rem;
            font-weight: 800;
            color: #00e6ff;
            line-height: 1;
        }

        .roi-label {
            font-size: 1rem;
            color: #ccc;
            margin-top: 0.5rem;
        }

        .key-metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            flex: 1;
        }

        .metric-card {
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
            border: 1px solid #00e6ff;
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 230, 255, 0.1);
            position: relative;
            overflow: hidden;
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #00e6ff, #06b6d4);
        }

        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: #00e6ff;
            margin-bottom: 0.5rem;
        }

        .metric-label {
            font-size: 0.9rem;
            color: #ccc;
        }

        /* Charts Section */
        .charts-section {
            margin-bottom: 3rem;
        }

        .chart-container {
            background: linear-gradient(135deg, #111, #222);
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            border: 1px solid #333;
        }

        .chart-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            text-align: center;
            color: #00e6ff;
        }

        .chart-canvas {
            width: 100%;
            height: 300px;
        }

        /* Revenue Comparison */
        .revenue-comparison {
            display: flex;
            justify-content: center;
            align-items: end;
            gap: 4rem;
            padding: 2rem;
            background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
            border-radius: 12px;
            margin: 2rem 0;
        }

        .revenue-bar {
            text-align: center;
            position: relative;
        }

        .bar {
            width: 60px;
            border-radius: 6px 6px 0 0;
            margin: 0 auto 1rem;
            position: relative;
        }

        .current-bar {
            background: linear-gradient(180deg, #666, #444);
            height: ${Math.max((parseInt(roiData.currentRevenue.replace(/,/g, '')) / Math.max(parseInt(roiData.currentRevenue.replace(/,/g, '')), parseInt(roiData.projectedRevenue.replace(/,/g, '')))) * 120, 20)}px;
        }

        .projected-bar {
            background: linear-gradient(180deg, #00e6ff, #06b6d4);
            height: ${Math.max((parseInt(roiData.projectedRevenue.replace(/,/g, '')) / Math.max(parseInt(roiData.currentRevenue.replace(/,/g, '')), parseInt(roiData.projectedRevenue.replace(/,/g, '')))) * 120, 20)}px;
        }

        .bar-label {
            font-size: 0.9rem;
            color: #ccc;
            margin-bottom: 0.5rem;
        }

        .bar-value {
            font-size: 1.2rem;
            font-weight: 600;
        }

        .current-value { color: #ccc; }
        .projected-value { color: #00e6ff; }

        /* Plan Details */
        .plan-details {
            background: linear-gradient(135deg, #111, #222);
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            border: 1px solid #333;
        }

        .plan-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #00e6ff;
        }

        .plan-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        .plan-feature {
            padding: 1rem;
            background: rgba(0, 230, 255, 0.05);
            border-radius: 8px;
            border-left: 3px solid #00e6ff;
        }

        /* Footer */
        .report-footer {
            text-align: center;
            padding: 2rem;
            border-top: 1px solid #333;
            margin-top: 3rem;
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: #00e6ff;
            margin-bottom: 1rem;
        }

        .footer-text {
            color: #888;
            font-size: 0.9rem;
        }

        /* Print Styles */
        @media print {
            body { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="report-header">
            <div class="logo">W</div>
            <h1 class="report-title">ROI Analysis Report</h1>
            <p class="report-subtitle">AI-Powered Indoor Navigation Investment Analysis</p>
            <div class="client-info">
                <div class="client-company">${leadData.company}</div>
                <p>Prepared for: ${leadData.firstName} ${leadData.lastName}</p>
                <p>Date: ${currentDate}</p>
                <p>Venue Type: ${leadData.venueType}</p>
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary">
            <h2 class="summary-title">Executive Summary</h2>
            <div class="roi-showcase">
                <div class="roi-circle">
                    <span class="roi-number">${roiData.roi}%</span>
                    <span class="roi-label">Annual ROI</span>
                </div>
                <div class="key-metrics">
                    <div class="metric-card">
                        <div class="metric-value">$${roiData.monthlyIncrease}</div>
                        <div class="metric-label">Monthly Revenue Increase</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${roiData.annualIncrease}</div>
                        <div class="metric-label">Annual Revenue Increase</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${roiData.planCost}</div>
                        <div class="metric-label">${roiData.plan} Plan Cost</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${Math.round(parseInt(roiData.annualIncrease.replace(/,/g, '')) / parseInt(roiData.planCost.replace(/,/g, '')) * 100) / 100}x</div>
                        <div class="metric-label">Return Multiple</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Revenue Comparison -->
        <div class="chart-container">
            <h3 class="chart-title">Monthly Revenue Comparison</h3>
            <div class="revenue-comparison">
                <div class="revenue-bar">
                    <div class="bar current-bar"></div>
                    <div class="bar-label">Current Revenue</div>
                    <div class="bar-value current-value">$${roiData.currentRevenue}</div>
                </div>
                <div class="revenue-bar">
                    <div class="bar projected-bar"></div>
                    <div class="bar-label">With Waide Mobility</div>
                    <div class="bar-value projected-value">$${roiData.projectedRevenue}</div>
                </div>
            </div>
        </div>

        <!-- Plan Details -->
        <div class="plan-details">
            <h3 class="plan-title">${roiData.plan} Plan Features</h3>
            <div class="plan-grid">
                <div class="plan-feature">
                    <h4>Coverage Area</h4>
                    <p>${roiData.plan === 'Starter' ? 'Up to 5,000 sq ft' : roiData.plan === 'Professional' ? 'Up to 50,000 sq ft' : 'Unlimited coverage'}</p>
                </div>
                <div class="plan-feature">
                    <h4>Navigation Technology</h4>
                    <p>${roiData.plan === 'Starter' ? 'Basic AR wayfinding' : roiData.plan === 'Professional' ? 'Advanced AR + Analytics' : 'Full AI navigation suite'}</p>
                </div>
                <div class="plan-feature">
                    <h4>Analytics & Insights</h4>
                    <p>${roiData.plan === 'Starter' ? 'Basic visitor flow' : roiData.plan === 'Professional' ? 'Heat maps & conversion tracking' : 'Custom analytics dashboard'}</p>
                </div>
                <div class="plan-feature">
                    <h4>Support Level</h4>
                    <p>${roiData.plan === 'Starter' ? 'Email support' : roiData.plan === 'Professional' ? 'Priority support + success manager' : '24/7 dedicated support team'}</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="report-footer">
            <div class="footer-logo">Waide Mobility</div>
            <p class="footer-text">The future of smart navigation, powered by artificial intelligence.</p>
            <p class="footer-text">Contact us at hello@waidemobility.com | www.waidemobility.com</p>
        </div>
    </div>
</body>
</html>`;
    }
}

module.exports = ROIPDFGenerator;