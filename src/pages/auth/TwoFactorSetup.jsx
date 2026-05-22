import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ShieldAlert, ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';

export const TwoFactorSetup = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, isSeeker, isPoster } = useAuth();
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const secretKey = 'THBW MFA SECRETMOCK 7777';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6 || isNaN(code)) {
      setError('Please enter a valid 6-digit numeric verification code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Mock code verification - accept 123456 or any code for testing
      setTimeout(async () => {
        try {
          await updateProfile({ mfa_enabled: true });
          setSuccess(true);
          setLoading(false);
        } catch (err) {
          setError('Failed to update MFA settings. Please try again.');
          setLoading(false);
        }
      }, 1000);
    } catch (err) {
      setError('Verification failed. Try code 123456.');
      setLoading(false);
    }
  };

  const handleDone = () => {
    if (isSeeker || isPoster) {
      navigate('/mobile/profile');
    } else {
      navigate('/company/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6 transition-colors duration-200 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl p-8 flex flex-col gap-6 animate-slide-up">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Go Back
        </button>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <ShieldAlert size={22} />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Configure 2FA</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Enhance account security by adding Google Authenticator or another MFA client code.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col gap-4 animate-slide-up">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-xs font-medium text-green-700 dark:text-green-400">
              ✓ Two-factor authentication has been successfully set up on your account!
            </div>
            <Button
              variant="primary"
              onClick={handleDone}
              fullWidth
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Mock QR code container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <div className="w-40 h-40 bg-zinc-800 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                {/* Visual mockup of a QR code using boxes */}
                <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-80">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded ${
                        (i % 2 === 0 && i % 3 !== 0) || i === 0 || i === 4 || i === 20 || i === 24
                          ? 'bg-white' 
                          : 'bg-zinc-900'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none"></div>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 font-medium">
                Scan with your Authenticator app
              </span>
            </div>

            {/* Secret key code display */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Or enter code manually
              </label>
              <div className="flex gap-2">
                <code className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-xl text-xs text-slate-700 dark:text-zinc-300 font-mono flex items-center select-all">
                  {secretKey}
                </code>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-slate-100 dark:border-zinc-850 pt-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-medium text-red-600 dark:text-red-400 animate-slide-up">
                  {error}
                </div>
              )}

              <Input
                label="Enter 6-digit Code"
                name="code"
                type="text"
                placeholder="e.g. 123456"
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
                Verify & Activate <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
