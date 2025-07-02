-- Clean schema for FairPlay NIL

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  role text,
  university text,
  sport text,
  avatar_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.deals (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  user_id uuid,
  
  -- Deal Identification
  deal_nickname text,
  status text DEFAULT 'draft'::text,
  
  -- Deal Terms Document
  deal_terms_url text,
  deal_terms_file_name text,
  deal_terms_file_type text,
  deal_terms_file_size bigint,
  
  -- Payor Information
  payor_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  
  -- Deal Details
  activities jsonb DEFAULT '[]'::jsonb,
  obligations jsonb DEFAULT '{}'::jsonb,
  
  -- Compliance
  uses_school_ip boolean,
  grant_exclusivity text,
  licenses_nil text,
  is_group_deal boolean DEFAULT false,
  is_paid_to_llc boolean DEFAULT false,
  
  -- Compensation
  compensation_cash numeric,
  compensation_goods jsonb DEFAULT '[]'::jsonb,
  compensation_other jsonb DEFAULT '[]'::jsonb,
  fmv numeric,
  
  -- Constraints
  CONSTRAINT deals_pkey PRIMARY KEY (id),
  CONSTRAINT deals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  CONSTRAINT valid_file_type CHECK (
    deal_terms_file_type IS NULL OR 
    deal_terms_file_type IN ('pdf', 'docx', 'png', 'jpg', 'jpeg')
  )
);

-- Indexes for performance
CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_deals_status ON public.deals(status);
CREATE INDEX idx_deals_created_at ON public.deals(created_at); 