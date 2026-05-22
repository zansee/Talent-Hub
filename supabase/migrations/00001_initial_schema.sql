-- ============================================================
-- TALENTHUB BOTSWANA INITIAL SCHEMA MIGRATION
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up any existing triggers
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Auto-updating updated_at timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. PROFILES (Extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'job_seeker'
    CHECK (role IN ('job_seeker','quick_job_poster','admin',
                    'company_admin','hiring_manager','recruiter','partner')),
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,

  -- Location
  location TEXT,  -- From Botswana towns
  residential_address TEXT,
  postal_address TEXT,

  -- Education
  highest_qualification TEXT,
  institution_name TEXT,
  graduation_year INT,
  field_of_study TEXT,

  -- Work
  current_job_title TEXT,
  years_of_experience TEXT  -- Range: '0-2', '3-5', '6-9', '10+'
    CHECK (years_of_experience IN ('0-2','3-5','6-9','10+')),
  preferred_industries TEXT[],
  skills TEXT[],
  languages TEXT[],

  -- CV
  cv_url TEXT,
  cv_score INT CHECK (cv_score >= 0 AND cv_score <= 100),
  cv_score_feedback JSONB DEFAULT '{}'::jsonb,

  -- Subscription
  subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free','graduate','premium')),
  subscription_price DECIMAL(10,2) DEFAULT 0.00,
  graduate_approved_at TIMESTAMPTZ,
  graduate_doc_url TEXT,
  graduate_verification_status TEXT DEFAULT 'none'
    CHECK (graduate_verification_status IN ('none','pending','approved','rejected')),
  monthly_application_count INT DEFAULT 0,
  application_count_reset_at TIMESTAMPTZ DEFAULT NOW(),

  -- Profile completion
  profile_completion_pct INT DEFAULT 0 CHECK (profile_completion_pct >= 0 AND profile_completion_pct <= 100),

  -- Referral
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referral_reward_months INT DEFAULT 0,

  -- Theme & Appearance
  theme_color TEXT DEFAULT '#6B7C3A',
  dark_mode TEXT DEFAULT 'system'
    CHECK (dark_mode IN ('light','dark','system')),

  -- Visibility
  profile_visibility TEXT DEFAULT 'active'
    CHECK (profile_visibility IN ('active','open','hidden')),
  hide_employer BOOLEAN DEFAULT false,
  show_city_only BOOLEAN DEFAULT true,
  show_photo_to_companies BOOLEAN DEFAULT true,
  allow_company_contact BOOLEAN DEFAULT true,

  -- AI opt-out
  ai_cv_processing_enabled BOOLEAN DEFAULT true,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_checklist JSONB DEFAULT '{}'::jsonb,

  -- 2FA (for future setup)
  mfa_enabled BOOLEAN DEFAULT false,

  -- Company association (FK added later after companies table created)
  company_id UUID,

  -- Digest preferences
  digest_frequency TEXT DEFAULT 'weekly'
    CHECK (digest_frequency IN ('daily','weekly','fortnightly','off')),
  digest_day TEXT DEFAULT 'monday',

  -- Deactivation/Deletion
  deactivated_at TIMESTAMPTZ,
  scheduled_deletion_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 2. COMPANIES
-- ============================================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  industry TEXT,
  description TEXT,
  website TEXT,
  location TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add the circular constraint to profiles
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- ============================================================
-- 3. MASTER SKILLS LIST
-- ============================================================
CREATE TABLE public.master_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  industry TEXT,
  status TEXT DEFAULT 'approved'
    CHECK (status IN ('approved','pending','rejected')),
  suggested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. FIELD OF STUDY OPTIONS
-- ============================================================
CREATE TABLE public.field_of_study_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(industry, name)
);

-- ============================================================
-- 5. JOBS
-- ============================================================
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  posted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,  -- From Botswana towns dropdown
  industry TEXT,
  employment_type TEXT CHECK (employment_type IN ('Full-time','Part-time','Contract','Internship','Graduate-Programme','Temporary')),
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  required_skills TEXT[],
  required_experience TEXT CHECK (required_experience IN ('0-2','3-5','6-9','10+')),
  required_qualification TEXT,
  required_languages TEXT[],
  field_of_study TEXT,
  application_deadline TIMESTAMPTZ,
  application_email TEXT,  -- Admin-posted fallback
  public_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('draft','active','closed','deleted')),
  view_count INT DEFAULT 0,
  is_admin_posted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 6. SCREENING QUESTIONS
-- ============================================================
CREATE TABLE public.screening_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice','free_text')),
  options JSONB DEFAULT '[]'::jsonb, -- Array of strings for choices
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. JOB SWIPES
-- ============================================================
CREATE TABLE public.job_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('left','right')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- ============================================================
-- 8. APPLICATIONS
-- ============================================================
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'internal' CHECK (source IN ('internal','external')),
  status TEXT DEFAULT 'applied'
    CHECK (status IN ('applied','reviewed','shortlisted','interviewed','offer','rejected','withdrawn')),
  cover_letter TEXT,
  cv_url TEXT,
  supporting_docs JSONB DEFAULT '[]'::jsonb, -- [{name, url}]
  screening_answers JSONB DEFAULT '{}'::jsonb, -- {question_id: answer}
  
  -- External applicants
  is_external BOOLEAN DEFAULT false,
  external_name TEXT,
  external_email TEXT,
  external_phone TEXT,

  -- Withdrawal
  withdrawn_at TIMESTAMPTZ,
  withdrawal_reason TEXT,
  withdrawal_reason_custom TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 9. QUICK JOB CATEGORIES
-- ============================================================
CREATE TABLE public.quick_job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. QUICK JOBS
-- ============================================================
CREATE TABLE public.quick_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  pay_amount DECIMAL(10,2),
  category_id UUID REFERENCES public.quick_job_categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','closed','expired')),
  expires_at TIMESTAMPTZ,
  renewed_at TIMESTAMPTZ,
  renewal_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_quick_jobs_updated_at
  BEFORE UPDATE ON public.quick_jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 11. QUICK JOB INTERESTS
-- ============================================================
CREATE TABLE public.quick_job_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quick_job_id UUID REFERENCES public.quick_jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quick_job_id, user_id)
);

-- ============================================================
-- 12. CV VERSION HISTORY
-- ============================================================
CREATE TABLE public.cv_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  cv_url TEXT NOT NULL,
  label TEXT,
  ai_score INT CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_feedback JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'upload' CHECK (source IN ('upload','revamp')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. CV REVAMP REQUESTS
-- ============================================================
CREATE TABLE public.cv_revamp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','assigned','in_progress','completed')),
  experience_level TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  cv_url TEXT,
  certificates_urls JSONB DEFAULT '[]'::jsonb,
  professional_certs_urls JSONB DEFAULT '[]'::jsonb,
  licences_urls JSONB DEFAULT '[]'::jsonb,
  references_urls JSONB DEFAULT '[]'::jsonb,
  completed_cv_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_cv_revamp_updated_at
  BEFORE UPDATE ON public.cv_revamp_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 14. INTERVIEW PREP REQUESTS
-- ============================================================
CREATE TABLE public.interview_prep_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_type TEXT CHECK (service_type IN ('script_only','virtual_plus_script')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','assigned','in_progress','completed')),
  price DECIMAL(10,2) DEFAULT 0.00,
  preferred_interview_date TIMESTAMPTZ,
  script_url TEXT,
  meeting_link TEXT,
  confirmed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_interview_prep_updated_at
  BEFORE UPDATE ON public.interview_prep_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 15. SERVICE REQUEST MESSAGES (CV Revamp & Interview Prep Chats)
-- ============================================================
CREATE TABLE public.request_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL, -- UUID of cv_revamp_requests or interview_prep_requests
  request_type TEXT NOT NULL CHECK (request_type IN ('cv_revamp','interview_prep')),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb, -- [{name, url}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 16. PARTNER DOCUMENT REQUESTS
-- ============================================================
CREATE TABLE public.partner_doc_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('cv_revamp','interview_prep')),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('certificates','cv','reference','id','custom')),
  custom_description TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','uploaded','cancelled')),
  uploaded_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_partner_doc_requests_updated_at
  BEFORE UPDATE ON public.partner_doc_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 17. CV REQUESTS (Headhunting/Company Search)
-- ============================================================
CREATE TABLE public.cv_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_seeker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_cv_requests_updated_at
  BEFORE UPDATE ON public.cv_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 18. INTERVIEW INVITATIONS (For candidates)
-- ============================================================
CREATE TABLE public.interview_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  sent_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  proposed_date TIMESTAMPTZ NOT NULL,
  proposed_time TEXT,
  format TEXT CHECK (format IN ('in_person','video_call','phone_call')),
  location_or_link TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','alternative_proposed','confirmed','cancelled')),
  alternative_slots JSONB DEFAULT '[]'::jsonb, -- [{date, time}]
  alternative_message TEXT,
  confirmed_date TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_interview_invitations_updated_at
  BEFORE UPDATE ON public.interview_invitations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 19. APPROVAL REQUESTS (Recruiter approvals)
-- ============================================================
CREATE TABLE public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('delete_job','reject_candidate','bulk_reject')),
  target_type TEXT,
  target_id UUID,
  target_ids UUID[],  -- For bulk actions
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','denied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_approval_requests_updated_at
  BEFORE UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 20. CANDIDATE NOTES (Company Internal Only)
-- ============================================================
CREATE TABLE public.candidate_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_candidate_notes_updated_at
  BEFORE UPDATE ON public.candidate_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 21. APPLICATION TAGS (Company Internal)
-- ============================================================
CREATE TABLE public.application_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 22. NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 23. AUDIT LOG
-- ============================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 24. JOB ANALYTICS EVENTS
-- ============================================================
CREATE TABLE public.job_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('view','apply','shortlist','reject','withdraw','offer')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source TEXT CHECK (source IN ('internal','external')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 25. TEAM INVITATIONS (For company portal onboarding)
-- ============================================================
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('recruiter','hiring_manager')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 26. FEATURE FLAGS
-- ============================================================
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 27. PLATFORM SETTINGS
-- ============================================================
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 28. SAVED DOCUMENTS (CVs, cover letters, certificates etc.)
-- ============================================================
CREATE TABLE public.saved_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 29. TRANSACTIONS
-- ============================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT,
  amount DECIMAL(10,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'BWP',
  status TEXT DEFAULT 'pending',
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 30. ACCOUNT DELETIONS (Grace periods)
-- ============================================================
CREATE TABLE public.account_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_deletion_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 31. ACCOUNT UPGRADE LOG (Poster → Seeker)
-- ============================================================
CREATE TABLE public.account_upgrade_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_type TEXT NOT NULL,
  to_type TEXT NOT NULL,
  upgraded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 32. REFERRAL TRACKING
-- ============================================================
CREATE TABLE public.referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMPTZ,
  reward_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 33. COMPANY ACCESS REQUESTS
-- ============================================================
CREATE TABLE public.company_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  website TEXT,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  reason TEXT,
  registration_doc_url TEXT,
  logo_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_company_access_requests_updated_at
  BEFORE UPDATE ON public.company_access_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 34. BATCH JOB IMPORTS
-- ============================================================
CREATE TABLE public.batch_job_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  total_rows INT DEFAULT 0,
  successful_rows INT DEFAULT 0,
  failed_rows INT DEFAULT 0,
  status TEXT DEFAULT 'processing'
    CHECK (status IN ('processing','preview','confirmed','completed','failed')),
  parsed_data JSONB DEFAULT '[]'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_batch_job_imports_updated_at
  BEFORE UPDATE ON public.batch_job_imports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 35. COMPANY SETTINGS
-- ============================================================
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  candidate_comparison_enabled BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_company_member(target_company UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND company_id = target_company
    AND role IN ('company_admin','hiring_manager','recruiter')
  );
$$;

-- Enable RLS on all 35 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_of_study_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_job_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_revamp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_prep_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_doc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_upgrade_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_job_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- BASIC RLS POLICIES
-- ============================================================

-- PROFILES
CREATE POLICY "Profiles are readable by owner" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Profiles are readable by admins" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Job seeker profiles are readable by company members for headhunting" ON public.profiles
  FOR SELECT USING (
    public.get_user_role() IN ('company_admin','hiring_manager','recruiter')
    AND role = 'job_seeker'
    AND profile_visibility != 'hidden'
  );
CREATE POLICY "Profiles are editable by owner" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- COMPANIES
CREATE POLICY "Companies are readable by all authenticated users" ON public.companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Companies are editable by company admins" ON public.companies FOR ALL USING (public.is_company_member(id));
CREATE POLICY "Companies are editable by admins" ON public.companies FOR ALL USING (public.is_admin());

-- JOBS
CREATE POLICY "Active jobs are readable by all authenticated users" ON public.jobs FOR SELECT USING (status = 'active');
CREATE POLICY "Jobs are editable by company members" ON public.jobs FOR ALL USING (public.is_company_member(company_id));
CREATE POLICY "Jobs are editable by admins" ON public.jobs FOR ALL USING (public.is_admin());

-- APPLICATIONS
CREATE POLICY "Applications are readable by candidate" ON public.applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Applications are readable by company members" ON public.applications FOR SELECT USING (public.is_company_member(company_id));
CREATE POLICY "Applications are editable by candidate" ON public.applications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Applications are editable by company members" ON public.applications FOR UPDATE USING (public.is_company_member(company_id));

-- NOTIFICATIONS
CREATE POLICY "Notifications readable by owner" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Notifications editable by owner" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
