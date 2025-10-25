import { Resend } from 'resend';

const resend = new Resend('re_BZcJDCb3_Lmhu1nQYVtyvNzx9tBFfmqFQ');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, company, roi, industry, monthlyVisitors, projectedRevenue, pdfData } = req.body;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: #000; color: #fff; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
        <h1 style="color: #00e6ff; margin: 0 0 10px 0;">URGENT: Your ${roi}% ROI Window is Open</h1>
        <p style="color: #ff6b6b; margin: 0; font-weight: bold;">Limited Time Analysis for ${company}</p>
      </div>
      
      <div style="background: #fff; padding: 25px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #ff6b6b;">
        <h2 style="color: #333; margin-top: 0;">${firstName}, your competitors don't know this yet...</h2>
        <p style="color: #555; line-height: 1.6;">While other ${industry} venues struggle with lost visitors and declining revenue, you're about to discover the <strong>secret weapon</strong> that's generating ${roi}% ROI for smart venue owners.</p>
        
        <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">What This Means for ${company}:</h3>
          <ul style="color: #856404; line-height: 1.8; margin: 0;">
            <li><strong>${monthlyVisitors} visitors</strong> currently getting frustrated and leaving</li>
            <li><strong>First-mover advantage</strong> - Be the ONLY ${industry} venue in your area with this technology</li>
            <li><strong>90-day payback</strong> - Start profiting before your competitors even know what hit them</li>
          </ul>
        </div>
        
        <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0;">
          <h4 style="color: #0c5460; margin-top: 0;">TIME-SENSITIVE OPPORTUNITY</h4>
          <p style="color: #0c5460; margin: 0;">Your analysis reveals you're in the <strong>perfect position</strong> to implement before your market gets saturated. But this window won't stay open forever...</p>
        </div>
        
        <p style="color: #555; line-height: 1.6;">Your exclusive 8-page blueprint reveals:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 3px solid #28a745;">
            <strong style="color: #28a745;">Hidden Revenue Streams</strong><br>
            <span style="color: #666; font-size: 14px;">3 ways to monetize navigation data</span>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 3px solid #dc3545;">
            <strong style="color: #dc3545;">Competitive Blind Spots</strong><br>
            <span style="color: #666; font-size: 14px;">Why 87% of ${industry} venues fail at this</span>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 3px solid #ffc107;">
            <strong style="color: #e0a800;">Implementation Secrets</strong><br>
            <span style="color: #666; font-size: 14px;">Avoid the 3 costly mistakes others make</span>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 3px solid #6f42c1;">
            <strong style="color: #6f42c1;">Risk-Free Guarantee</strong><br>
            <span style="color: #666; font-size: 14px;">94% success rate + money-back promise</span>
          </div>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, #ff6b6b, #ffa500); padding: 25px; border-radius: 12px; text-align: center; color: #fff; margin-bottom: 20px;">
        <h3 style="margin-top: 0;">CLAIM YOUR ${roi}% ROI ADVANTAGE</h3>
        <p style="margin-bottom: 20px; font-size: 18px;"><strong>Before your competitors catch on...</strong></p>
        <a href="mailto:jacob@waidemobility.org?subject=URGENT: ${company} ROI Implementation&body=Hi Jacob, I just reviewed my ${roi}% ROI analysis and I'm ready to move fast. Let's schedule my priority consultation immediately." style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">SECURE MY ADVANTAGE NOW</a>
        <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">Priority consultation slots filling fast</p>
      </div>
      
      <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="color: #155724; margin-top: 0;">EXCLUSIVE BONUS (Worth $5,000)</h4>
        <p style="color: #155724; margin: 0;">Reply within 48 hours and receive our <strong>"${industry} Revenue Optimization Playbook"</strong> - the same strategies our $50M+ clients use to dominate their markets.</p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #888; font-size: 14px;">
        <p><strong>Questions?</strong> Reply immediately or call Jacob directly: jacob@waidemobility.org</p>
        <p style="font-size: 12px;">This analysis was generated exclusively for ${company}. Confidential & proprietary.</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'ROI Analysis <noreply@waidemobility.org>',
      to: email,
      subject: `URGENT: Your ${roi}% ROI Window is Open - ${company}`,
      html: emailHtml,
      attachments: [{
        filename: `${company}-ROI-Analysis.pdf`,
        content: pdfData
      }]
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}