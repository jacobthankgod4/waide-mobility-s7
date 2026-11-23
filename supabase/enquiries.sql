-- Waide Mobility - website enquiries
-- Run in the Supabase SQL editor (or `supabase db push`).
-- The public site never reads this table. Only the server-side service role
-- key used by /api/enquiry can insert, so a browser cannot enumerate leads.

create table if not exists public.enquiries (
  id            bigint generated always as identity primary key,
  reference     text        not null unique,
  created_at    timestamptz not null default now(),
  status        text        not null default 'new',
  name          text        not null,
  organisation  text,
  email         text        not null,
  category      text        not null,
  subject       text        not null,
  message       text        not null,
  source_page   text,
  user_agent    text,
  notes         text
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status);
create index if not exists enquiries_email_idx on public.enquiries (lower(email));

alter table public.enquiries enable row level security;

-- No policy is granted to anon or authenticated. RLS therefore denies every
-- browser request; the service role key bypasses RLS for the API function.
revoke all on public.enquiries from anon, authenticated;

comment on table public.enquiries is
  'Website enquiries captured by /api/enquiry. Service role only.';
