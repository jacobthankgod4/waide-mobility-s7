-- Create partnership_requests table
CREATE TABLE partnership_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL,
  partnership_type TEXT NOT NULL,
  country TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE partnership_requests ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can submit partnership requests)
CREATE POLICY "Enable insert for public" ON partnership_requests
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read their own submissions
CREATE POLICY "Enable read for authenticated users" ON partnership_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create roi_leads table
CREATE TABLE roi_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contact Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  job_title TEXT,
  venue_type TEXT NOT NULL,
  consent BOOLEAN DEFAULT false,
  
  -- ROI Data
  plan TEXT NOT NULL,
  monthly_visitors INTEGER,
  avg_spend DECIMAL,
  conversion_rate DECIMAL,
  venue_size INTEGER,
  staff_hours DECIMAL,
  
  -- Calculated Results
  current_revenue DECIMAL,
  projected_revenue DECIMAL,
  monthly_increase DECIMAL,
  annual_increase DECIMAL,
  plan_cost DECIMAL,
  roi_percentage DECIMAL,
  staff_savings DECIMAL,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  source TEXT DEFAULT 'roi_calculator'
);

-- Enable Row Level Security for roi_leads
ALTER TABLE roi_leads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can submit ROI leads)
CREATE POLICY "Enable insert for public" ON roi_leads
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read ROI leads
CREATE POLICY "Enable read for authenticated users" ON roi_leads
  FOR SELECT USING (auth.role() = 'authenticated');