// Minimal PDF Generation Module for Waide Mobility
class WaidePDFGenerator {
    constructor() {
        this.brandColors = {
            primary: [0, 230, 255],
            secondary: [0, 255, 136],
            accent: [255, 170, 0],
            background: [0, 0, 0],
            text: [255, 255, 255],
            lightText: [204, 204, 204]
        };
    }

    async generateROIPDF(leadData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set dark background
        doc.setFillColor(...this.brandColors.background);
        doc.rect(0, 0, 210, 297, 'F');
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(...this.brandColors.primary);
        doc.text('WAIDE MOBILITY', 20, 25);
        doc.setFontSize(12);
        doc.setTextColor(...this.brandColors.secondary);
        doc.text('ROI Analysis Report', 20, 35);
        
        // Company info
        let y = 60;
        doc.setFontSize(16);
        doc.setTextColor(...this.brandColors.primary);
        doc.text('Executive Summary', 20, y);
        y += 20;
        
        doc.setFontSize(10);
        doc.setTextColor(...this.brandColors.text);
        doc.text(`Company: ${leadData.company}`, 20, y);
        y += 8;
        doc.text(`Current Monthly Revenue: $${leadData.currentRevenue}`, 20, y);
        y += 8;
        doc.text(`Projected Monthly Revenue: $${leadData.projectedRevenue}`, 20, y);
        y += 8;
        doc.text(`ROI: ${leadData.roi}%`, 20, y);
        y += 20;
        
        // Simple chart
        this.addSimpleChart(doc, leadData, y);
        
        // Add implementation page
        doc.addPage();
        doc.setFillColor(...this.brandColors.background);
        doc.rect(0, 0, 210, 297, 'F');
        
        doc.setFontSize(16);
        doc.setTextColor(...this.brandColors.primary);
        doc.text('Implementation Strategy', 20, 30);
        
        doc.setFontSize(10);
        doc.setTextColor(...this.brandColors.text);
        doc.text('90-day phased implementation approach:', 20, 50);
        doc.text('• Phase 1 (Days 1-30): Infrastructure setup', 20, 65);
        doc.text('• Phase 2 (Days 31-60): Feature launch', 20, 80);
        doc.text('• Phase 3 (Days 61-90): Optimization', 20, 95);
        
        // Contact info
        doc.setFontSize(14);
        doc.setTextColor(...this.brandColors.primary);
        doc.text('Contact Information', 20, 130);
        doc.setFontSize(10);
        doc.setTextColor(...this.brandColors.secondary);
        doc.text('Email: jacob@waidemobility.org', 20, 145);
        doc.text('Website: www.waidemobility.org', 20, 155);
        
        return doc;
    }
    
    addSimpleChart(doc, leadData, startY) {
        // Simple bar chart
        doc.setFontSize(12);
        doc.setTextColor(...this.brandColors.primary);
        doc.text('Revenue Comparison', 20, startY);
        
        const currentRev = parseInt(leadData.currentRevenue.replace(/,/g, ''));
        const projectedRev = parseInt(leadData.projectedRevenue.replace(/,/g, ''));
        const maxValue = Math.max(currentRev, projectedRev);
        
        // Current revenue bar
        const currentWidth = (currentRev / maxValue) * 80;
        doc.setFillColor(...this.brandColors.accent);
        doc.rect(40, startY + 20, currentWidth, 15, 'F');
        doc.setTextColor(...this.brandColors.text);
        doc.setFontSize(8);
        doc.text('Current', 20, startY + 30);
        
        // Projected revenue bar
        const projectedWidth = (projectedRev / maxValue) * 80;
        doc.setFillColor(...this.brandColors.secondary);
        doc.rect(40, startY + 40, projectedWidth, 15, 'F');
        doc.text('Projected', 20, startY + 50);
    }
    
    async downloadPDF(leadData, filename) {
        const doc = await this.generateROIPDF(leadData);
        doc.save(filename || `${leadData.company}-ROI-Analysis.pdf`);
    }
}

// Export for use
window.WaidePDFGenerator = WaidePDFGenerator;