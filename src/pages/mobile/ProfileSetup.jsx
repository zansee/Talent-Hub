import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Upload, Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Teemane from '../../components/shared/Teemane';
import Button from '../../components/shared/Button';
import { supabase } from '../../lib/supabase';

// Controlled vocabularies
const towns = ['Gaborone', 'Francistown', 'Maun', 'Mogoditshane', 'Molepolole', 'Serowe', 'Palapye', 'Selebi-Phikwe', 'Jwaneng', 'Kasane', 'Lobatse', 'Kanye', 'Mochudi', 'Orapa'];
const qualifications = ['BGCSE', 'Junior Certificate (JC)', 'Diploma / Associate Degree', "Bachelor's Degree", "Master's Degree", 'PhD / Doctorate', 'Professional Certifications'];
const professionalCertsList = ['ACCA', 'CIMA', 'BICA', 'AAT', 'CIPS', 'PMP', 'Prince2'];
const experienceRanges = [
  { label: '0-2 years (Entry level)', value: '0-2' },
  { label: '3-5 years (Intermediate)', value: '3-5' },
  { label: '6-9 years (Senior)', value: '6-9' },
  { label: '10+ years (Expert)', value: '10+' },
];
const industriesList = ['Mining & Diamonds', 'Tourism & Hospitality', 'Agriculture & Beef', 'Banking, Finance & Insurance', 'Telecommunications & ICT', 'Government & Public Sector', 'Manufacturing', 'Education & Training', 'Health & Medical Services', 'Construction & Infrastructure', 'Retail & Wholesale'];
const languagesList = ['Setswana', 'English', 'Kalanga', 'Sekgalagadi', 'Seherero', 'Sibirwa'];
const skillsSuggestions = {
  'Banking, Finance & Insurance': ['ACCA', 'CIMA', 'BICA', 'AAT', 'Financial Analysis', 'Credit Risk Assessment', 'Auditing', 'Bookkeeping'],
  'Procurement & Supply Chain': ['CIPS', 'Supply Chain Logistics', 'Strategic Sourcing', 'Warehouse Management'],
  'Telecommunications & ICT': ['Python', 'React / JavaScript', 'SQL Database Design', 'Cloud Computing (AWS/Azure)', 'Network Administration', 'Cybersecurity'],
  'Mining & Diamonds': ['Heavy Plant Maintenance', 'Geological Mapping', 'Mineral Processing', 'Mine Safety (SHE)'],
  'Tourism & Hospitality': ['Ecotourism Guest Relations', 'Wilderness First Aid', 'Travel Planning', 'Culinary Services'],
};

export const ProfileSetup = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvScoreState, setCvScoreState] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    location: profile?.location || '',
    phone: profile?.phone || '',
    highest_qualification: profile?.highest_qualification || '',
    professional_certs: [],
    field_of_study: profile?.field_of_study || '',
    institution_name: profile?.institution_name || '',
    current_job_title: profile?.current_job_title || '',
    years_of_experience: profile?.years_of_experience || '',
    preferred_industries: profile?.preferred_industries || [],
    skills: profile?.skills || [],
    languages: profile?.languages || ['Setswana', 'English'],
    profile_visibility: profile?.profile_visibility || 'active',
    cv_url: profile?.cv_url || '',
  });

  const [inputVal, setInputVal] = useState(''); // Text temp holder
  const [error, setError] = useState('');

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    setError('');
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setInputVal('');
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError('');
      setInputVal('');
    }
  };

  const validateCurrentStep = () => {
    const q = questions[currentStep];
    const val = formData[q.key];

    if (q.required) {
      if (Array.isArray(val) && val.length === 0) {
        setError(`Please select at least one option.`);
        return false;
      }
      if (!val || val.toString().trim() === '') {
        setError(`This field is required to build your matching index.`);
        return false;
      }
    }
    return true;
  };

  // Toggle array item helper
  const toggleArrayItem = (key, item) => {
    setFormData(prev => {
      const arr = prev[key] || [];
      const updated = arr.includes(item) 
        ? arr.filter(i => i !== item) 
        : [...arr, item];
      return { ...prev, [key]: updated };
    });
    setError('');
  };

  // File CV Upload & mock AI score
  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCvFile(file);
    setCvUploading(true);
    setError('');

    try {
      // Simulate file upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id || Math.random().toString()}_${Date.now()}.${fileExt}`;
      const filePath = `cvs/${fileName}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      let publicUrl = '';
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      // Simulate AI score calculation
      setTimeout(async () => {
        const score = Math.floor(Math.random() * 30) + 65; // Mock score 65-95
        const feedback = {
          grammar_formatting: 90,
          keyword_relevance: score - 5,
          experience_impact: score + 2,
          recommendations: ['Add quantitative achievements for your Botswana roles', 'Incorporate missing skills: ACCA/CIPS if applicable', 'Highlight Setswana bilingual capabilities']
        };

        setCvScoreState(score);
        setFormData(prev => ({ 
          ...prev, 
          cv_url: publicUrl || 'https://ktrpgthjkhmaaqxhvzsh.supabase.co/storage/v1/object/public/documents/mock_cv.pdf',
        }));

        // Update in DB versions
        await supabase.from('cv_versions').insert({
          user_id: profile.id,
          cv_url: publicUrl || 'https://ktrpgthjkhmaaqxhvzsh.supabase.co/storage/v1/object/public/documents/mock_cv.pdf',
          label: file.name,
          ai_score: score,
          ai_feedback: feedback,
          is_active: true
        });

        // Save on profile directly
        await updateProfile({
          cv_url: publicUrl || 'https://ktrpgthjkhmaaqxhvzsh.supabase.co/storage/v1/object/public/documents/mock_cv.pdf',
          cv_score: score,
          cv_score_feedback: feedback
        });

        setCvUploading(false);
      }, 2000);

    } catch (err) {
      console.error(err);
      setError('Failed to process CV with AI. We set up a mock record.');
      setCvUploading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. Combine professional_certs into skills if desired, or save specifically
      const finalSkills = [...new Set([...formData.skills, ...formData.professional_certs])];
      
      // Calculate completion %
      let completePct = 40; // Initial
      if (formData.location) completePct += 10;
      if (formData.highest_qualification) completePct += 10;
      if (finalSkills.length > 0) completePct += 20;
      if (formData.cv_url) completePct += 20;

      const onboardingChecklist = {
        account_created: true,
        profile_setup: true,
        cv_uploaded: !!formData.cv_url,
        referral_shared: false
      };

      await updateProfile({
        location: formData.location,
        phone: formData.phone,
        highest_qualification: formData.highest_qualification,
        field_of_study: formData.field_of_study,
        institution_name: formData.institution_name,
        current_job_title: formData.current_job_title,
        years_of_experience: formData.years_of_experience,
        preferred_industries: formData.preferred_industries,
        skills: finalSkills,
        languages: formData.languages,
        profile_visibility: formData.profile_visibility,
        onboarding_completed: true,
        profile_completion_pct: completePct,
        onboarding_checklist: onboardingChecklist
      });

      setLoading(false);
      navigate('/mobile/feed');
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  // Onboarding questions definition
  const questions = [
    {
      key: 'location',
      title: 'Where in Botswana are you located?',
      subtitle: 'We use town locations to find roles near you.',
      type: 'select',
      options: towns,
      required: true,
      pose: 'waving',
    },
    {
      key: 'phone',
      title: 'What is your contact number?',
      subtitle: 'Employers will use this to call or SMS you.',
      type: 'phone',
      placeholder: 'e.g. 71234567',
      required: true,
      pose: 'default',
    },
    {
      key: 'highest_qualification',
      title: 'What is your highest level of qualification?',
      subtitle: 'This holds 25% weight in matching you to jobs.',
      type: 'select',
      options: qualifications,
      required: true,
      pose: 'thinking',
    },
    {
      key: 'professional_certs',
      title: 'Select any professional credentials:',
      subtitle: 'Include CIPS, ACCA, BICA, etc.',
      type: 'chips',
      options: professionalCertsList,
      required: false,
      pose: 'default',
    },
    {
      key: 'field_of_study',
      title: 'What was your field of study?',
      subtitle: 'This holds 20% weight in job matches.',
      type: 'text',
      placeholder: 'e.g. Accounting, Computer Science, Procurement',
      required: true,
      pose: 'thinking',
    },
    {
      key: 'years_of_experience',
      title: 'How many years of work experience do you have?',
      subtitle: 'This holds 30% weight in matching calculations.',
      type: 'radio',
      options: experienceRanges,
      required: true,
      pose: 'default',
    },
    {
      key: 'preferred_industries',
      title: 'Which industries are you interested in?',
      subtitle: 'This holds 15% weight. Select up to 3.',
      type: 'chips',
      options: industriesList,
      required: true,
      pose: 'thinking',
    },
    {
      key: 'skills',
      title: 'Select or add your professional skills:',
      subtitle: 'This holds 10% weight. Select matching skills.',
      type: 'skills_multi',
      required: true,
      pose: 'default',
    },
    {
      key: 'languages',
      title: 'Which languages are you fluent in?',
      subtitle: 'Help local employers know your language skills.',
      type: 'chips',
      options: languagesList,
      required: true,
      pose: 'waving',
    },
    {
      key: 'cv_url',
      title: 'Upload your CV for instant AI analysis',
      subtitle: 'Get an immediate score out of 100 with improvement feedback!',
      type: 'cv_upload',
      required: false,
      pose: 'celebrating',
    },
  ];

  const q = questions[currentStep];
  const progressPct = Math.round(((currentStep + 1) / questions.length) * 100);

  return (
    <div className="min-h-full flex flex-col justify-between p-6 bg-[#12160d] text-white">
      
      {/* Top Header Bar */}
      <div className="flex flex-col gap-2 z-10">
        <div className="flex justify-between items-center text-xs">
          <button 
            onClick={prevStep} 
            disabled={currentStep === 0}
            className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30 p-1 cursor-pointer flex items-center gap-1 font-semibold"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span className="text-zinc-400 font-semibold font-sans">
            Question {currentStep + 1} of {questions.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Mascot bubble & Question */}
      <div className="flex-1 flex flex-col justify-center my-6 z-10 animate-slide-up">
        
        {/* Waving/Thinking Teemane mascot wrapper */}
        <div className="flex items-start gap-3 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300 leading-relaxed font-sans relative flex-1">
            <span className="font-bold text-white block mb-1">Teemane says:</span>
            {q.subtitle}
            {/* Speech bubble notch */}
            <div className="absolute right-[-6px] top-6 w-3 h-3 bg-zinc-900 border-r border-t border-zinc-800 rotate-45"></div>
          </div>
          <Teemane pose={q.pose} size={70} animate={true} className="shrink-0" />
        </div>

        {/* Dynamic Question Title */}
        <h2 className="text-xl font-bold font-display leading-snug mb-6 text-white">
          {q.title}
        </h2>

        {/* Errors */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/20 border border-red-900/30 text-xs font-semibold text-red-400 animate-slide-up">
            {error}
          </div>
        )}

        {/* DYNAMIC INPUTS RENDER */}
        <div className="flex flex-col gap-4">
          
          {/* SELECT DROPDOWN */}
          {q.type === 'select' && (
            <div className="relative">
              <select
                value={formData[q.key]}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, [q.key]: e.target.value }));
                  setError('');
                }}
                className="w-full bg-zinc-900 border-b-2 border-zinc-800 focus:border-primary text-white text-base py-3 px-1 transition-colors outline-none cursor-pointer"
              >
                <option value="">Select an option...</option>
                {q.options.map(opt => (
                  <option key={opt} value={opt} className="bg-zinc-950 text-white">{opt}</option>
                ))}
              </select>
            </div>
          )}

          {/* TEXT / PHONE UNDERLINE INPUT */}
          {(q.type === 'text' || q.type === 'phone') && (
            <div className="relative">
              {q.type === 'phone' && (
                <span className="absolute left-1 bottom-3 text-zinc-500 font-sans text-base font-bold select-none">
                  +267
                </span>
              )}
              <input
                type={q.type === 'phone' ? 'tel' : 'text'}
                placeholder={q.placeholder}
                value={formData[q.key]}
                onChange={(e) => {
                  let val = e.target.value;
                  if (q.type === 'phone') {
                    // numbers only
                    val = val.replace(/\D/g, '').substring(0, 8);
                  }
                  setFormData(prev => ({ ...prev, [q.key]: val }));
                  setError('');
                }}
                className={`w-full bg-transparent border-b-2 border-zinc-800 focus:border-primary text-white text-base py-3 transition-all outline-none font-sans font-medium ${
                  q.type === 'phone' ? 'pl-11' : 'pl-1'
                }`}
                autoFocus
              />
            </div>
          )}

          {/* RADIO BUTTONS LIST */}
          {q.type === 'radio' && (
            <div className="flex flex-col gap-2.5">
              {q.options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, [q.key]: opt.value }));
                    setError('');
                  }}
                  className={`w-full text-left p-4 rounded-xl border font-medium text-xs font-sans transition-all duration-200 cursor-pointer flex justify-between items-center ${
                    formData[q.key] === opt.value
                      ? 'border-primary bg-primary/10 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/50'
                  }`}
                >
                  {opt.label}
                  {formData[q.key] === opt.value && <CheckCircle2 size={16} className="text-primary fill-current" />}
                </button>
              ))}
            </div>
          )}

          {/* MULTI SELECT CHIPS */}
          {q.type === 'chips' && (
            <div className="flex flex-wrap gap-2">
              {q.options.map(opt => {
                const isSelected = formData[q.key].includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleArrayItem(q.key, opt)}
                    className={`px-4 py-2 rounded-xl text-xs font-sans font-medium transition-all duration-250 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white shadow-md shadow-primary/10'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* SKILLS MULTI-SELECT WITH SUGGESTIONS */}
          {q.type === 'skills_multi' && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a skill and hit add"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (inputVal.trim()) {
                        toggleArrayItem('skills', inputVal.trim());
                        setInputVal('');
                      }
                    }
                  }}
                  className="flex-1 bg-transparent border-b-2 border-zinc-800 focus:border-primary text-white text-sm py-2 px-1 outline-none font-sans"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (inputVal.trim()) {
                      toggleArrayItem('skills', inputVal.trim());
                      setInputVal('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>

              {/* Suggestions list based on selected industries */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Suggested Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {/* Gather suggestions */}
                  {formData.preferred_industries.flatMap(ind => skillsSuggestions[ind] || []).slice(0, 8).map(skill => {
                    const isSelected = formData.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleArrayItem('skills', skill)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-sans font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
                        }`}
                      >
                        {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active selections */}
              {formData.skills.length > 0 && (
                <div className="mt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Your Selected Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] text-white"
                      >
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => toggleArrayItem('skills', skill)}
                          className="hover:text-red-400 text-zinc-500 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CV FILE UPLOAD */}
          {q.type === 'cv_upload' && (
            <div className="flex flex-col gap-4">
              <div className="relative border-2 border-dashed border-zinc-800 rounded-2xl p-6 text-center hover:border-primary transition-colors bg-zinc-900/10">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCVUpload}
                  disabled={cvUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  {cvUploading ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-zinc-500" />
                  )}
                  <span className="text-xs font-semibold text-white">
                    {cvUploading ? 'Teemane is analyzing your CV...' : 'Tap to upload PDF, DOCX'}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Max size: 5MB
                  </span>
                </div>
              </div>

              {/* AI scoring results display */}
              {cvScoreState !== null && (
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col gap-2.5 animate-slide-up">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Teemane AI Score:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-xs font-bold text-primary border border-primary/20">
                      {cvScoreState}/100 Fit
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                    💡 **Improvement tip:** Add metrics to your work descriptions (e.g. "managed BWP 100k budget").
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex gap-3 z-10 pt-4 border-t border-zinc-900">
        <Button
          onClick={nextStep}
          variant="primary"
          loading={loading}
          fullWidth
          className="py-3.5"
        >
          {currentStep === questions.length - 1 ? 'Finish Profile Setup' : 'Continue'} 
          <ArrowRight size={16} className="ml-1" />
        </Button>
      </div>

    </div>
  );
};

export default ProfileSetup;
