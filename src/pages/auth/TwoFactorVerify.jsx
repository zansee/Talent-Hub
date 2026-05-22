import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck, ArrowRight, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';

export const TwoFactorVerify = () => {
  const navigate = useNavigate();
  const { profile, logout, isSeeker, isPoster } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length !== 6 || isNaN(code)) {
      setError('Please enter a valid 6-digit numeric verification code.');
      return;
    }
    setError('');
    setLoading(true);

    // Mock 2FA validation (accept any code for testing, e.g. 123456)
    setTimeout(() => {
      setLoading(false);
      if (isSeeker || isPoster) {
        navigate('/mobile/feed');
      } else {
        if (profile?.role === 'admin') navigate('/admin/dashboard');
        else if (profile?.role === 'partner') navigate('/partner/dashboard');
        else navigate('/company/dashboard');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6 transition-colors duration-200 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl p-8 flex flex-col gap-6 animate-slide-up">
        
        {/* Title */}
        <div className="flex flex-col gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <ShieldCheck size={22} />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Security Verification</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
            Two-factor authentication is enabled. Please enter the 6-digit verification code from your authenticator app.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-medium text-red-600 dark:text-red-400 animate-slide-up">
              {error}
            </div>
          )}

          <Input
            label="Enter Verification Code"
            name="code"
            type="text"
            placeholder="000 000"
            value={code}
            onChange={(e) => setCode(e.target.value.substring(0, 6))}
            required
            disabled={loading}
            className="text-center font-mono tracking-widest text-lg"
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            fullWidth
            className="py-2.5"
          >
            Verify & Sign In <ArrowRight size={16} />
          </Button>

          <button
            type="button"
            onClick={logout}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-red-500 mt-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut size={12} />
            Sign Out from Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
