-- ============================================================
-- DATABASE SEED DATA — TALENTHUB BOTSWANA
-- ============================================================

-- 1. QUICK JOB CATEGORIES
INSERT INTO public.quick_job_categories (name, description, icon) VALUES
('Domestic Help', 'Cleaning, laundry, cooking, and babysitting services', 'Home'),
('Transport & Delivery', 'Driving, goods transport, courier, and moving help', 'Truck'),
('General Labor', 'Loading, construction help, lifting, and basic tasks', 'Hammer'),
('Gardening & Landscaping', 'Lawn mowing, weeding, planting, and garden care', 'Leaf'),
('Tutoring & Lessons', 'School subjects support, music lessons, and language training', 'BookOpen'),
('Photography & Video', 'Event coverage, portraits, editing, and commercial shoots', 'Camera'),
('Hair & Beauty', 'Braiding, haircuts, makeup, and nail services', 'Sparkles'),
('Events & Catering', 'Serving, cooking, setup, and event assistance', 'GlassWater'),
('Tech Support & Repair', 'Phone/PC repair, software install, and networking help', 'Cpu'),
('Solar & Electrical', 'Solar panel install, wiring, battery setups, and diagnostics', 'Zap')
ON CONFLICT (name) DO NOTHING;

-- 2. MASTER SKILLS
INSERT INTO public.master_skills (name, industry, status) VALUES
('ACCA', 'Banking, Finance & Insurance', 'approved'),
('CIMA', 'Banking, Finance & Insurance', 'approved'),
('BICA', 'Banking, Finance & Insurance', 'approved'),
('AAT', 'Banking, Finance & Insurance', 'approved'),
('CIPS', 'Procurement & Supply Chain', 'approved'),
('PMP', 'Project Management', 'approved'),
('Prince2', 'Project Management', 'approved'),
('Financial Analysis', 'Banking, Finance & Insurance', 'approved'),
('Credit Risk Assessment', 'Banking, Finance & Insurance', 'approved'),
('Supply Chain Logistics', 'Procurement & Supply Chain', 'approved'),
('Strategic Sourcing', 'Procurement & Supply Chain', 'approved'),
('Setswana (Fluent)', 'General', 'approved'),
('English (Fluent)', 'General', 'approved'),
('Kalanga (Fluent)', 'General', 'approved'),
('Heavy Duty Driver License', 'Transport & Delivery', 'approved'),
('Public Service Vehicle (PSV) License', 'Transport & Delivery', 'approved'),
('Python', 'Telecommunications & ICT', 'approved'),
('React / JavaScript', 'Telecommunications & ICT', 'approved'),
('SQL Database Design', 'Telecommunications & ICT', 'approved'),
('Cloud Computing (AWS/Azure)', 'Telecommunications & ICT', 'approved'),
('Solar System Installation', 'Construction & Infrastructure', 'approved'),
('Welders Certification', 'Manufacturing', 'approved'),
('Heavy Plant Maintenance', 'Mining & Diamonds', 'approved'),
('Geological Mapping', 'Mining & Diamonds', 'approved'),
('Ecotourism Guest Relations', 'Tourism & Hospitality', 'approved'),
('Wilderness First Aid', 'Tourism & Hospitality', 'approved'),
('Setswana Traditional Catering', 'Events & Catering', 'approved'),
('Customer Service Excellence', 'Retail & Wholesale', 'approved'),
('Merchandising & Inventory Control', 'Retail & Wholesale', 'approved'),
('Beef Quality Grading', 'Agriculture & Beef', 'approved'),
('Veterinary Science Assistant', 'Agriculture & Beef', 'approved'),
('First Aid & CPR', 'Health & Medical Services', 'approved'),
('Primary Education Pedagogy', 'Education & Training', 'approved')
ON CONFLICT (name) DO NOTHING;

-- 3. FIELD OF STUDY OPTIONS
INSERT INTO public.field_of_study_options (industry, name) VALUES
('Banking, Finance & Insurance', 'Bachelor of Accountancy'),
('Banking, Finance & Insurance', 'BSc in Finance'),
('Banking, Finance & Insurance', 'Diploma in Accounting and Business'),
('Procurement & Supply Chain', 'Diploma in Procurement and Supply (CIPS)'),
('Procurement & Supply Chain', 'Bachelor of Business Administration in Logistics'),
('Telecommunications & ICT', 'BSc in Computer Science'),
('Telecommunications & ICT', 'BSc in Information Technology'),
('Telecommunications & ICT', 'Diploma in Network Administration'),
('Mining & Diamonds', 'BEng in Mining Engineering'),
('Mining & Diamonds', 'BSc in Geology'),
('Tourism & Hospitality', 'Bachelor of Tourism Management'),
('Tourism & Hospitality', 'Diploma in Hospitality Operations'),
('Agriculture & Beef', 'BSc in Agriculture'),
('Agriculture & Beef', 'Diploma in Animal Health and Production'),
('Health & Medical Services', 'Bachelor of Nursing Science'),
('Health & Medical Services', 'Diploma in General Nursing'),
('Education & Training', 'Bachelor of Education (Primary)'),
('Education & Training', 'Diploma in Secondary Education')
ON CONFLICT (industry, name) DO NOTHING;

-- 4. FEATURE FLAGS
INSERT INTO public.feature_flags (name, is_enabled, description) VALUES
('payments_enabled', false, 'Toggle mock payment system on or off globally across the platform'),
('ai_cv_scoring_enabled', true, 'Enable automatic AI extraction and scoring on CV upload'),
('ai_cover_letter_enabled', true, 'Allow job seekers to generate AI-tailored cover letters on applications'),
('graduate_tier_verification_enabled', true, 'Require graduates to upload academic documents for verification')
ON CONFLICT (name) DO NOTHING;

-- 5. PLATFORM SETTINGS
INSERT INTO public.platform_settings (key, value) VALUES
('quick_job_expiry_days', '30'::jsonb),
('free_tier_monthly_application_limit', '3'::jsonb),
('match_notification_daily_limit', '3'::jsonb),
('match_notification_min_score', '60'::jsonb),
('relevance_score_threshold', '50'::jsonb)
ON CONFLICT (key) DO NOTHING;
