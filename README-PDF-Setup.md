# 🎨 Waide Mobility PDF Generator Setup

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file:
```env
# Resend Email Configuration
RESEND_API_KEY=re_your_resend_api_key

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Configuration
PORT=3001
NODE_ENV=production
```

### 3. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

## 📧 Resend Email Setup

### 1. Get Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Create API key in dashboard
3. Add to `.env` file

### 2. Verify Domain (Production)
1. Add your domain in Resend dashboard
2. Add DNS records for verification
3. Update `from` email in pdf-api.js

## 🗄️ Supabase Database Setup

### 1. Create ROI Leads Table
```sql
CREATE TABLE roi_leads (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    job_title VARCHAR(255),
    venue_type VARCHAR(100) NOT NULL,
    plan_selected VARCHAR(50) NOT NULL,
    monthly_visitors INTEGER,
    avg_spend DECIMAL(10,2),
    conversion_rate DECIMAL(5,2),
    current_revenue INTEGER,
    projected_revenue INTEGER,
    monthly_increase INTEGER,
    annual_increase INTEGER,
    plan_cost INTEGER,
    roi_percentage INTEGER,
    consent_marketing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Set Row Level Security
```sql
ALTER TABLE roi_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for authenticated users" ON roi_leads
    FOR INSERT WITH CHECK (true);
```

## 🎯 Features Implemented

### ✅ Visual Design
- **Magazine-quality** layouts with CSS Grid/Flexbox
- **Brand-consistent** styling matching website
- **Professional charts** and data visualizations
- **Gradient backgrounds** and modern aesthetics
- **Custom fonts** (Inter) for premium look

### ✅ Dynamic Content
- **Personalized** company and contact information
- **Real-time ROI** calculations and metrics
- **Plan-specific** features and recommendations
- **Visual charts** showing revenue comparison
- **Professional branding** throughout

### ✅ Technical Excellence
- **High-resolution** PDF output (print-ready)
- **Responsive design** that scales perfectly
- **Fast generation** with Puppeteer optimization
- **Error handling** and validation
- **Email delivery** with professional templates

## 🔧 Customization

### Brand Colors
Update in `pdf-generator.js`:
```css
:root {
  --primary-color: #00e6ff;
  --secondary-color: #06b6d4;
  --background: #000;
}
```

### Email Template
Modify email body in `pdf-api.js` line 45

### PDF Layout
Edit HTML template in `pdf-generator.js` generateHTMLTemplate method

## 📊 Sample Output

The generated PDF includes:
- **Executive Summary** with ROI circle and key metrics
- **Revenue Comparison** with visual bar charts
- **Plan Details** with feature breakdown
- **Professional branding** and contact information
- **Personalized content** for each lead

## 🚀 Deployment

### Heroku
```bash
git add .
git commit -m "Add PDF generator"
git push heroku main
```

### AWS Lambda
Use `serverless` framework with puppeteer-lambda layer

### Docker
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
COPY . .
RUN npm install
CMD ["npm", "start"]
```

## 🎯 Integration Benefits

### ✅ Resend Advantages
- **99.9% deliverability** - Better than traditional SMTP
- **Real-time analytics** - Track opens, clicks, bounces
- **Professional templates** - HTML email support
- **Scalable** - Handle high volume easily
- **Developer-friendly** - Simple API integration

### ✅ Supabase Advantages
- **Real-time database** - Instant lead tracking
- **Built-in auth** - Secure API access
- **Dashboard views** - Easy lead management
- **Automatic backups** - Data protection
- **Scalable** - Grows with your business

### 🔄 Data Flow
```
ROI Calculator → Lead Capture → Supabase DB → PDF Generation → Resend Email
```

## 📈 Performance Optimization

- **PDF caching** for identical requests
- **Image optimization** for faster loading
- **Concurrent generation** for multiple requests
- **Memory management** for Puppeteer instances

## 🚀 Quick Setup Commands

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Resend and Supabase credentials

# Run database migrations (create roi_leads table)
npm run setup-db

# Start the server
npm run dev
```

Your PDF generator is now integrated with **Resend + Supabase** for professional email delivery and lead management! 🎨✨