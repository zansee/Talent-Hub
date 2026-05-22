import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, User, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, PlusCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import PasswordStrength from '../../components/shared/PasswordStrength';

export const Register = () => {
  const { register, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Select Role, Step 2: Fill Details
  const [role, setRole] = useState('job_seeker'); // 'job_seeker' or 'quick_job_poster'
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for that field when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setStep(2); // Auto-advance to details step
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.fullName, role);
      // Auth state listener in AuthContext will handle state updates,
      // let's direct them to mobile onboarding sequence
      navigate('/mobile/onboarding');
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ form: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row justify-center items-center p-4 md:p-0 transition-colors duration-200">
      {/* Brand panel on the left (visible on desktop) */}
      <div className="hidden md:flex md:w-1/2 min-h-screen bg-[#12160d] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary-hover/10 blur-[100px] pointer-events-none"></div>

        {/* Header logo */}
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="TH Logo" className="h-10 w-auto object-contain" />
          <h2 className="font-display font-bold text-xl tracking-tight">TalentHub Botswana</h2>
        </div>

        {/* Hero copy */}
        <div className="max-w-md my-auto flex flex-col gap-6 animate-slide-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-primary">
            <Sparkles size={12} />
            <span>Join the Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
            Create Your Account & Get Discovered.
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed font-sans">
            Job seekers: build your profile, test your CV score, and swipe for matching jobs.
            <br />
            Quick posters: post casual gigs, hire helpers, and manage projects.
          </p>
        </div>

        <div className="text-xs text-zinc-500 font-sans">
          &copy; {new Date().getFullYear()} TalentHub Botswana. All rights reserved.
        </div>
      </div>

      {/* Form Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-md flex flex-col gap-8">
          
          {/* Back button for Step 2 */}
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors cursor-pointer group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Change Role
            </button>
          )}

          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 md:hidden mb-4">
              <img src="/assets/logo.png" alt="TH Logo" className="h-8 w-auto object-contain" />
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white">TalentHub BW</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              {step === 1 ? 'Choose Your Path' : 'Create Account Details'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-sans">
              {step === 1 
                ? 'Select how you want to interact with TalentHub Botswana to get started.' 
                : `Signing up as a ${role === 'job_seeker' ? 'Job Seeker' : 'Quick Job Poster'}.`
              }
            </p>
          </div>

          {errors.form && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-medium text-red-600 dark:text-red-400 animate-slide-up">
              {errors.form}
            </div>
          )}

          {/* STEP 1: ROLE SELECTOR CARDS */}
          {step === 1 && (
            <div className="flex flex-col gap-4 animate-slide-up">
              
              {/* Job Seeker Card */}
              <button
                onClick={() => handleSelectRole('job_seeker')}
                className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-primary dark:border-zinc-800 dark:hover:border-primary/50 bg-white dark:bg-zinc-900/40 hover:bg-slate-50/50 dark:hover:bg-zinc-900/60 shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 group cursor-pointer flex items-start gap-4"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <User size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                    I want to Find a Job / Career
                    <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Build a professional profile, evaluate your CV, matching score swipe feed, apply to roles, and chat with tutors.
                  </p>
                </div>
              </button>

              {/* Quick Job Poster Card */}
              <button
                onClick={() => handleSelectRole('quick_job_poster')}
                className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-primary dark:border-zinc-800 dark:hover:border-primary/50 bg-white dark:bg-zinc-900/40 hover:bg-slate-50/50 dark:hover:bg-zinc-900/60 shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 group cursor-pointer flex items-start gap-4"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <PlusCircle size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                    I want to Hire Quick / Casual Help
                    <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Post casual gigs (tutoring, domestic, deliveries) instantly. Select verified local candidates and manage hires.
                  </p>
                </div>
              </button>
              
            </div>
          )}

          {/* STEP 2: FILL REGISTRATION FORM */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-slide-up">
              
              <Input
                label="Full Name"
                name="fullName"
                type="text"
                placeholder="e.g. Zandi Moreri"
                value={formData.fullName}
                onChange={handleChange}
                icon={User}
                error={errors.fullName}
                required
                disabled={loading}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. zandi@mail.co.bw"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                error={errors.email}
                required
                disabled={loading}
              />

              <Input
                label="Create Password"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                error={errors.password}
                required
                disabled={loading}
              />

              {/* Password strength meter wrapper */}
              <PasswordStrength password={formData.password} />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={ShieldCheck}
                error={errors.confirmPassword}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                loading={loading || authLoading}
                fullWidth
                className="mt-3 py-3"
              >
                Register & Onboard <ArrowRight size={16} />
              </Button>
            </form>
          )}

          {/* Bottom redirection Link */}
          <div className="text-center text-xs text-slate-500 dark:text-zinc-400 font-sans border-t border-slate-200 dark:border-zinc-800 pt-6">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary hover:text-primary-hover font-bold transition-colors"
            >
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
