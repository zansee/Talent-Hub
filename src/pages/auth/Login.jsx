import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, ArrowRight, Sparkles, Building2, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';

export const Login = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, name: value, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      if (data?.user) {
        // Fetch profile to do role-based dispatching
        // Wait, onAuthStateChange in AuthContext will trigger loading and redirecting automatically,
        // but let's also query directly to speed up navigation.
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (!pErr && profile) {
          const role = profile.role;
          if (role === 'job_seeker' || role === 'quick_job_poster') {
            navigate('/mobile/feed');
          } else if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'partner') {
            navigate('/partner/dashboard');
          } else {
            navigate('/company/dashboard');
          }
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Safe import of supabase just in case direct query is used
  // Note: we can import supabase from src/lib/supabase.js
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
            <span>Smart Career Matching</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
            Connecting Botswana's Top Talents with Great Employers.
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed font-sans">
            Swipe to match on high-impact roles, explore verified qualifications, access career revamp services, and hire locally.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-xs text-zinc-500 font-sans">
          &copy; {new Date().getFullYear()} TalentHub Botswana. All rights reserved.
        </div>
      </div>

      {/* Auth Form Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-md flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            {/* Show logo on mobile only */}
            <div className="flex items-center gap-2 md:hidden mb-4">
              <img src="/assets/logo.png" alt="TH Logo" className="h-8 w-auto object-contain" />
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white">TalentHub BW</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-sans">
              Enter your credentials to access your dashboard or mobile view.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-medium text-red-600 dark:text-red-400 animate-slide-up">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. zandi@talenthub.co.bw"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
              disabled={loading}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
              disabled={loading}
            />

            <div className="flex justify-between items-center text-xs font-sans mt-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 dark:border-zinc-700 text-primary focus:ring-primary w-4 h-4 bg-white dark:bg-zinc-950" 
                />
                Remember me
              </label>
              <Link 
                to="/forgot-password" 
                className="text-primary hover:text-primary-hover font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading || authLoading}
              fullWidth
              className="mt-2 py-3"
            >
              Sign In <ArrowRight size={16} />
            </Button>
          </form>

          {/* Call to action */}
          <div className="text-center text-xs text-slate-500 dark:text-zinc-400 font-sans border-t border-slate-200 dark:border-zinc-800 pt-6">
            New to TalentHub?{' '}
            <Link 
              to="/register" 
              className="text-primary hover:text-primary-hover font-bold transition-colors"
            >
              Create an Account
            </Link>
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500">
              <Link to="/request-access" className="flex items-center gap-1 hover:text-primary justify-center">
                <Building2 size={12} /> Company Access Request
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Import supabase from file
import { supabase } from '../../lib/supabase';
export default Login;
