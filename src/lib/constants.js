/**
 * TalentHub Botswana — Controlled Vocabularies
 * Single source of truth for all dropdown/chip options
 */

export const BOTSWANA_TOWNS = [
  'Gaborone',
  'Francistown',
  'Maun',
  'Mogoditshane',
  'Molepolole',
  'Serowe',
  'Palapye',
  'Selebi-Phikwe',
  'Jwaneng',
  'Kasane',
  'Lobatse',
  'Kanye',
  'Mochudi',
  'Orapa',
];

export const INDUSTRIES = [
  'Mining & Diamonds',
  'Tourism & Hospitality',
  'Agriculture & Beef',
  'Banking, Finance & Insurance',
  'Telecommunications & ICT',
  'Government & Public Sector',
  'Manufacturing',
  'Education & Training',
  'Health & Medical Services',
  'Construction & Infrastructure',
  'Retail & Wholesale',
  'Procurement & Supply Chain',
  'Legal & Compliance',
  'Media & Communications',
  'NGO & Non-Profit',
];

export const QUALIFICATIONS = [
  'Junior Certificate (JC)',
  'BGCSE',
  'Diploma / Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD / Doctorate',
  'Professional Certifications',
];

export const PROFESSIONAL_CERTS = [
  'ACCA',
  'CIMA',
  'BICA',
  'AAT',
  'CIPS',
  'PMP',
  'Prince2',
  'CFA',
  'CIPD',
  'SHRM',
  'CompTIA',
  'AWS Certified',
  'Microsoft Certified',
  'ITIL',
];

export const EXPERIENCE_RANGES = [
  { label: '0–2 years (Entry level)', value: '0-2' },
  { label: '3–5 years (Intermediate)', value: '3-5' },
  { label: '6–9 years (Senior)', value: '6-9' },
  { label: '10+ years (Expert)', value: '10+' },
];

export const LANGUAGES = [
  'Setswana',
  'English',
  'Kalanga',
  'Sekgalagadi',
  'Seherero',
  'Sibirwa',
  'Ndebele',
  'Zulu',
];

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship / Attachment',
  'Graduate Trainee',
  'Freelance',
];

export const SKILLS_BY_INDUSTRY = {
  'Banking, Finance & Insurance': [
    'ACCA', 'CIMA', 'BICA', 'AAT', 'Financial Analysis', 'Credit Risk Assessment',
    'Auditing', 'Bookkeeping', 'Treasury Management', 'Tax Compliance',
  ],
  'Procurement & Supply Chain': [
    'CIPS', 'Supply Chain Logistics', 'Strategic Sourcing', 'Warehouse Management',
    'Vendor Management', 'ERP Systems',
  ],
  'Telecommunications & ICT': [
    'Python', 'React / JavaScript', 'SQL Database Design', 'Cloud Computing (AWS/Azure)',
    'Network Administration', 'Cybersecurity', 'Mobile Development', 'DevOps',
  ],
  'Mining & Diamonds': [
    'Heavy Plant Maintenance', 'Geological Mapping', 'Mineral Processing',
    'Mine Safety (SHE)', 'Blasting', 'Survey & Measurement',
  ],
  'Tourism & Hospitality': [
    'Ecotourism Guest Relations', 'Wilderness First Aid', 'Travel Planning',
    'Culinary Services', 'Safari Guiding', 'Front Office Operations',
  ],
  'Health & Medical Services': [
    'Clinical Nursing', 'Patient Care', 'First Aid & CPR', 'Pharmacy Dispensing',
    'Medical Records Management', 'Community Health',
  ],
  'Education & Training': [
    'Curriculum Development', 'Primary Education Pedagogy', 'STEM Teaching',
    'Special Needs Education', 'Adult Literacy Training', 'E-learning Facilitation',
  ],
  'Agriculture & Beef': [
    'Veterinary Science Assistant', 'Beef Quality Grading', 'Crop Production',
    'Irrigation Management', 'Livestock Husbandry', 'Agribusiness Management',
  ],
  'Construction & Infrastructure': [
    'Solar System Installation', 'Plumbing & Sanitation', 'Civil Engineering',
    'AutoCAD Drafting', 'Project Scheduling', 'Site Safety Management',
  ],
  'Government & Public Sector': [
    'Policy Analysis', 'Public Administration', 'Grant Writing',
    'Community Development', 'Statistics & Research', 'Records Management',
  ],
  'Retail & Wholesale': [
    'Customer Service Excellence', 'Merchandising & Inventory Control',
    'Point of Sale Systems', 'Visual Merchandising', 'Sales Strategy',
  ],
  'Manufacturing': [
    'Welders Certification', 'Quality Control & Assurance', 'Machine Operation',
    'Lean Manufacturing', 'Health & Safety Compliance',
  ],
};

export const USER_ROLES = {
  JOB_SEEKER: 'job_seeker',
  QUICK_JOB_POSTER: 'quick_job_poster',
  ADMIN: 'admin',
  COMPANY_ADMIN: 'company_admin',
  HIRING_MANAGER: 'hiring_manager',
  RECRUITER: 'recruiter',
  PARTNER: 'partner',
};

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  GRADUATE: 'graduate',
  PREMIUM: 'premium',
};

export const MATCH_WEIGHTS = {
  PREFERRED_INDUSTRY: 15,
  SKILLS: 10,
  QUALIFICATIONS: 25,
  EXPERIENCE: 30,
  FIELD_OF_STUDY: 20,
  LOCATION: 0, // contextual only
};

export const RELEVANCE_THRESHOLD = 50; // jobs below this % hidden by default

export const FIELDS_OF_STUDY = [
  'Bachelor of Accountancy',
  'BSc in Finance',
  'Diploma in Accounting and Business',
  'Diploma in Procurement and Supply (CIPS)',
  'Bachelor of Business Administration in Logistics',
  'BSc in Computer Science',
  'BSc in Information Technology',
  'Diploma in Network Administration',
  'BEng in Mining Engineering',
  'BSc in Geology',
  'Bachelor of Tourism Management',
  'Diploma in Hospitality Operations',
  'BSc in Agriculture',
  'Diploma in Animal Health and Production',
  'Bachelor of Nursing Science',
  'Diploma in General Nursing',
  'Bachelor of Education (Primary)',
  'Diploma in Secondary Education',
  'Bachelor of Laws (LLB)',
  'Bachelor of Engineering (Civil)',
  'BSc in Architecture',
  'Bachelor of Social Work',
  'Diploma in Public Administration',
  'Bachelor of Commerce',
  'Other',
];

export const WITHDRAWAL_REASONS = [
  'Accepted another offer',
  'Role no longer matches my goals',
  'Salary expectations not aligned',
  'Location is too far',
  'Found a better opportunity',
  'Personal reasons',
  'Other',
];

export const PIPELINE_STAGES = [
  'applied',
  'reviewed',
  'shortlisted',
  'interviewed',
  'offer',
  'rejected',
];

export const CV_SCORE_BANDS = [
  { min: 80, label: 'Excellent', color: '#22c55e' },
  { min: 65, label: 'Good', color: '#6B7C3A' },
  { min: 50, label: 'Average', color: '#f59e0b' },
  { min: 0, label: 'Needs Work', color: '#ef4444' },
];
