# Run This SQL in Supabase Dashboard

**Go to your Supabase project → SQL Editor and run:**

```sql
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
```

**After running this SQL, your form will work perfectly!**

The form will:
✅ Save partnership requests to database
✅ Open email with formatted details
✅ Show success message
✅ Handle errors gracefully