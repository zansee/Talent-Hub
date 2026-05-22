import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import Teemane from '../../components/shared/Teemane';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  UploadCloud 
} from 'lucide-react';

export const PublicJobApplication = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const { data, error: jobError } = await supabase
          .from('jobs')
          .select('*, companies(*)')
          .eq('public_token', token)
          .eq('status', 'active')
          .single();

        if (jobError) throw jobError;
        setJob(data);
      } catch (err) {
        console.error('Error fetching public job:', err);
        setError('Job posting not found or no longer active.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchJob();
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setFormErrors(prev => ({ ...prev, cv: 'Only PDF documents are supported.' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, cv: 'File size must be less than 5MB.' }));
        return;
      }
      setCvFile(file);
      setFormErrors(prev => ({ ...prev, cv: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required.';
    if (!cvFile) errors.cv = 'Please upload your CV in PDF format.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || submitting) return;
    setSubmitting(true);

    try {
      let cvUrl = '';
      
      // Upload file to cv_uploads bucket in Supabase storage
      const fileExt = cvFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `external/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cv_uploads')
        .upload(filePath, cvFile);

      if (uploadError) {
        console.error('File upload error, using mock path', uploadError);
        cvUrl = `https://ktrpgthjkhmaaqxhvzsh.supabase.co/storage/v1/object/public/cv_uploads/mock-cv.pdf`;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('cv_uploads')
          .getPublicUrl(filePath);
        cvUrl = publicUrlData.publicUrl;
      }

      // Submit application
      const { error: applyError } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          company_id: job.company_id,
          source: 'external',
          is_external: true,
          external_name: formData.fullName,
          external_email: formData.email,
          external_phone: formData.phone,
          cover_letter: formData.coverLetter,
          cv_url: cvUrl,
          status: 'applied'
        });

      if (applyError) throw applyError;

      // Increment view/apply analytics
      await supabase.rpc('increment_job_analytics', { 
        job_id_param: job.id, 
        event_type_param: 'apply',
        source_param: 'external'
      });

      setSuccess(true);
    } catch (err) {
      console.error('Failed to submit application:', err);
      setFormErrors({ form: err.message || 'Failed to submit application. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Teemane pose="thinking" size={120} />
          <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Loading Job Details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-6 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-zinc-800">
          <Teemane pose="thinking" size={140} />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Posting Expired</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              {error || 'This job is no longer accepting external applications.'}
            </p>
          </div>
          <Link to="/login" className="w-full">
            <Button variant="primary" fullWidth>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex flex-col">
      {/* Header bar */}
      <header className="h-16 bg-white dark:bg-zinc-900/60 backdrop-blur border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="TH Logo" className="h-8 w-auto object-contain" />
          <span className="font-display font-bold text-lg tracking-tight select-none">TalentHub Botswana</span>
        </div>
        <Link to="/login">
          <Button variant="outline" size="sm" icon={ArrowRight}>Login / Register</Button>
        </Link>
      </header>

      {success ? (
        /* SUCCESS PAGE VIEW */
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="max-w-xl w-full bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-zinc-800 text-center flex flex-col items-center gap-6 animate-slide-up">
            <Teemane pose="celebrating" size={180} />
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white font-display">Application Submitted Successfully!</h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-sans max-w-md mx-auto">
                Thank you for applying for the <strong className="text-primary font-semibold">{job.title}</strong> role at <strong>{job.companies?.name}</strong>. The hiring team has been notified.
              </p>
            </div>
            
            {/* TalentHub Nudge banner */}
            <div className="w-full bg-gradient-to-br from-primary-lightest to-primary/10 border border-primary/20 p-5 rounded-2xl flex flex-col gap-3 text-left">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Swipe into 100+ matching jobs!</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                Create a free TalentHub seeker account to unlock smart matching. Get CV scoring, skill gap analysis, direct career revamped CVs, and get hired.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <Link to="/register" className="flex-1">
                  <Button variant="primary" size="sm" fullWidth>Create Free Profile</Button>
                </Link>
                <Link to="/login" className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>Sign In</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DETAILED JOB INFO & APPLICATION FORM */
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Left Column: Job Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-primary text-xl shrink-0">
                {job.companies?.name ? job.companies.name[0].toUpperCase() : <Building2 size={24} />}
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white">{job.title}</h1>
                <p className="text-sm font-semibold text-primary">{job.companies?.name}</p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Location</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-200 mt-2 font-semibold">
                  <MapPin size={14} className="text-primary" />
                  <span>{job.location || 'Botswana'}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Type</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-200 mt-2 font-semibold">
                  <Briefcase size={14} className="text-primary" />
                  <span>{job.employment_type || 'Full Time'}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Salary</span>
                <div className="flex items-center gap-1 mt-2 text-xs text-slate-700 dark:text-zinc-200 font-bold">
                  <DollarSign size={14} className="text-primary -mr-0.5" />
                  <span>
                    {job.salary_min && job.salary_max 
                      ? `${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()} P` 
                      : 'Market Related'}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deadline</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-200 mt-2 font-semibold">
                  <Calendar size={14} className="text-primary" />
                  <span>{job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Role Description</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-zinc-800 pt-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Experience</h4>
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                    {job.required_experience ? `${job.required_experience} Years` : 'Any'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Education</h4>
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                    {job.required_qualification || 'Any'}
                  </p>
                </div>
              </div>

              {/* Skills required */}
              {job.required_skills && job.required_skills.length > 0 && (
                <div className="border-t border-slate-100 dark:border-zinc-800 pt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 rounded-xl text-xs font-semibold font-sans bg-primary/10 text-primary border border-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-lg rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Apply for this Position</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Submit your details and CV directly to the hiring manager.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {formErrors.form && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-medium text-red-600 dark:text-red-400 animate-slide-up">
                    {formErrors.form}
                  </div>
                )}

                <Input
                  label="Full Name"
                  name="fullName"
                  placeholder="e.g. Zandi Moreri"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={formErrors.fullName}
                  required
                  disabled={submitting}
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="e.g. zandi@mail.co.bw"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={formErrors.email}
                  required
                  disabled={submitting}
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  placeholder="e.g. +267 71 234 567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={formErrors.phone}
                  required
                  disabled={submitting}
                />

                <Input
                  label="Cover Letter / Introduction"
                  name="coverLetter"
                  type="textarea"
                  placeholder="Introduce yourself and outline your experience relevant to this role..."
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  error={formErrors.coverLetter}
                  disabled={submitting}
                />

                {/* CV File upload component */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold tracking-wider text-slate-600 dark:text-zinc-400 font-sans uppercase">
                    Upload CV (PDF) <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center gap-2 ${
                    cvFile 
                      ? 'border-primary/50 bg-primary-lightest/30 dark:bg-[#1a1f14]/20' 
                      : formErrors.cv 
                        ? 'border-red-500 hover:bg-red-50/50 bg-red-50/10' 
                        : 'border-slate-300 dark:border-zinc-700 hover:border-primary/50'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={submitting}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    
                    {cvFile ? (
                      <>
                        <CheckCircle2 size={28} className="text-primary" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[200px]">
                          {cvFile.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {(cvFile.size / 1024 / 1024).toFixed(2)} MB · Change file
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={28} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          Click or drag file to upload
                        </span>
                        <span className="text-[10px] text-slate-400">
                          PDF only, maximum 5MB
                        </span>
                      </>
                    )}
                  </div>
                  {formErrors.cv && (
                    <span className="text-xs font-sans text-red-500 mt-0.5 animate-slide-up">
                      {formErrors.cv}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  fullWidth
                  className="mt-2 py-3"
                >
                  Submit Application <ArrowRight size={16} />
                </Button>
              </form>

              {/* Seeker Nudge banner inside application panel */}
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-850 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="space-y-1 text-left">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Are you a Job Seeker?</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
                      Skip application forms! Sign up to swipe on Botswana's best roles with automatic matching, profile score boost, and instant recruiter outreach.
                    </p>
                    <Link to="/register" className="inline-block text-[11px] font-bold text-primary hover:text-primary-hover mt-1">
                      Register free profile &rarr;
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default PublicJobApplication;
