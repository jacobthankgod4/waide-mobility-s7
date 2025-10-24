# Deployment Instructions

## 1. SQL Commands (Run in Supabase Dashboard → SQL Editor)
```sql
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

ALTER TABLE partnership_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts" ON partnership_requests
  FOR INSERT WITH CHECK (true);
```

## 2. Terminal Commands (Run in your terminal/command line)
```bash
# Install Supabase CLI (choose one method)
npm install -g supabase
# OR
brew install supabase/tap/supabase

# Login and deploy
supabase login
supabase link --project-ref elkkokyluvibctjqkjus
supabase functions deploy send-partnership-email
supabase secrets set RESEND_API_KEY=re_gsoXEWL7_3JYwcaF7MnFiCGCXi6UqcQYJ
```

## 3. Test
Visit `partner-form.html` - it will save to database and send emails to partnerships@waidemobility.org