# EmailJS Setup for Direct Email Sending

## 1. Create EmailJS Account
- Go to [emailjs.com](https://www.emailjs.com)
- Sign up for free account
- Create email service (Gmail/Outlook/etc)

## 2. Create Email Template
Template ID: `template_partnership`
```
Subject: Partnership Request from {{organization}}

Partnership Request Details:

Name: {{from_name}}
Email: {{from_email}}
Organization: {{organization}}
Partnership Type: {{partnership_type}}
Country/Region: {{country}}

Message:
{{message}}

---
Sent to: jacob@waidemobility.org
```

## 3. Get Your Keys
- Service ID: `service_waide`
- Template ID: `template_partnership`
- User ID: Found in EmailJS dashboard

## 4. Update Form
Replace `YOUR_EMAILJS_USER_ID` in partner-form.html with your actual User ID.

## Benefits
✅ Sends emails automatically without opening email client
✅ Professional email templates
✅ Delivery tracking
✅ Free tier: 200 emails/month