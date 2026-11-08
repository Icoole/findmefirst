ALTER TABLE public.graduate_profiles ADD COLUMN candidate_type text NOT NULL DEFAULT 'graduate';
ALTER TABLE public.graduate_profiles ADD COLUMN current_city text;
ALTER TABLE public.graduate_profiles ADD COLUMN open_to_any_location boolean NOT NULL DEFAULT false;
ALTER TABLE public.graduate_profiles ADD COLUMN preferred_locations text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.graduate_profiles ADD COLUMN cgpa_scale numeric(3,1) NOT NULL DEFAULT 5.0;
ALTER TABLE public.graduate_profiles ADD COLUMN experience_years numeric(4,1) NOT NULL DEFAULT 0;
ALTER TABLE public.graduate_profiles ADD COLUMN industry text;
ALTER TABLE public.graduate_profiles ADD COLUMN certifications text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.graduate_profiles ADD CONSTRAINT graduate_profiles_candidate_type_check CHECK (candidate_type IN ('graduate', 'experienced'));
ALTER TABLE public.graduate_profiles ADD CONSTRAINT graduate_profiles_cgpa_scale_check CHECK (cgpa_scale IN (4.0, 5.0));

ALTER TABLE public.documents ADD COLUMN verification_status text NOT NULL DEFAULT 'pending verification';
ALTER TABLE public.documents ADD COLUMN verification_note text;
ALTER TABLE public.documents ADD COLUMN reviewed_at timestamptz;
ALTER TABLE public.documents ADD CONSTRAINT documents_verification_status_check CHECK (verification_status IN ('uploaded', 'pending verification', 'verified', 'inconclusive', 'rejected'));

CREATE TABLE public.demo_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL UNIQUE,
  candidate_type text NOT NULL CHECK (candidate_type IN ('graduate', 'experienced')),
  current_city text NOT NULL,
  state_of_residence text NOT NULL,
  open_to_any_location boolean NOT NULL DEFAULT false,
  preferred_locations text[] NOT NULL DEFAULT '{}',
  institution text NOT NULL,
  institution_type text NOT NULL,
  course text NOT NULL,
  qualification text NOT NULL,
  degree_class text NOT NULL,
  cgpa numeric(3,2) NOT NULL,
  cgpa_scale numeric(3,1) NOT NULL CHECK (cgpa_scale IN (4.0, 5.0)),
  graduation_year integer NOT NULL,
  experience_years numeric(4,1) NOT NULL DEFAULT 0,
  industry text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  certifications text[] NOT NULL DEFAULT '{}',
  credential_status text NOT NULL DEFAULT 'Sample record · not verified',
  profile_summary text NOT NULL DEFAULT 'Synthetic profile for demonstration only; not a real person.',
  sample_label text NOT NULL DEFAULT 'DEMO · FICTIONAL',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT demo_candidates_name_marker CHECK (display_name LIKE 'Demo Candidate %')
);
GRANT SELECT ON public.demo_candidates TO authenticated;
GRANT ALL ON public.demo_candidates TO service_role;
ALTER TABLE public.demo_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users read demo candidates" ON public.demo_candidates FOR SELECT TO authenticated USING (true);
CREATE INDEX demo_candidates_search_idx ON public.demo_candidates (candidate_type, state_of_residence, institution, degree_class);
CREATE INDEX demo_candidates_skills_idx ON public.demo_candidates USING gin (skills);

CREATE TABLE public.demo_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL UNIQUE,
  industry text NOT NULL,
  location_state text NOT NULL,
  company_size text NOT NULL,
  recruitment_focus text[] NOT NULL DEFAULT '{}',
  sample_label text NOT NULL DEFAULT 'DEMO · FICTIONAL',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT demo_companies_name_marker CHECK (display_name LIKE 'Demo Employer %')
);
GRANT SELECT ON public.demo_companies TO authenticated;
GRANT ALL ON public.demo_companies TO service_role;
ALTER TABLE public.demo_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users read demo companies" ON public.demo_companies FOR SELECT TO authenticated USING (true);
CREATE INDEX demo_companies_industry_state_idx ON public.demo_companies (industry, location_state);

COMMENT ON TABLE public.demo_candidates IS 'Fictional demonstration data only; never maps to real accounts, documents, or invitations.';
COMMENT ON TABLE public.demo_companies IS 'Fictional demonstration listings only; never maps to real organizations or employer accounts.';