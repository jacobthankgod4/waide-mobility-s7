// Use the existing comprehensive PDF generation from roi-calculator.html

// Extract the key functions you need:

// 1. Generate PDF with form data
function generateComprehensivePDF(formData) {
    const leadData = {
        company: formData.company,
        firstName: formData.firstName,
        email: formData.email,
        venueType: formData.industry || 'retail',
        monthlyVisitors: formData.visitors,
        avgSpend: formData.avgSpend,
        conversionRate: formData.conversionRate,
        venueSize: formData.venueSize,
        staffHours: formData.staffHours,
        currentRevenue: formData.currentRevenue,
        projectedRevenue: formData.projectedRevenue,
        roi: formData.roi
    };
    
    // Call the existing generatePDFInBackground function
    generatePDFInBackground(leadData);
}

// 2. Simple trigger function
function triggerPDFGeneration() {
    // Get data from your form
    const formData = {
        company: document.getElementById('company')?.value || 'Demo Company',
        firstName: document.getElementById('firstName')?.value || 'John',
        email: document.getElementById('email')?.value || 'john@company.com',
        industry: 'retail',
        visitors: 10000,
        avgSpend: 45,
        conversionRate: 15,
        venueSize: 25000,
        staffHours: 15,
        currentRevenue: '37,500',
        projectedRevenue: '46,875',
        roi: '125'
    };
    
    generateComprehensivePDF(formData);
}

// 3. Button click handler
function handlePDFDownload() {
    // Check if ROI calculation exists
    const roiResults = document.getElementById('roiResults');
    if (!roiResults || roiResults.style.display === 'none') {
        alert('Please calculate ROI first');
        return;
    }
    
    // Open the existing download modal
    openDownloadModal();
}