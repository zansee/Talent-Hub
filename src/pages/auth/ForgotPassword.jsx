import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import { supabase } from '../../lib/supabase';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send recovery email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl p-8 flex flex-col gap-6 animate-slide-up">
        
        {/* Back Link */}
        <Link
          to="/login"
          className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Sign In
        </Link>

        {/* Icon & Title */}
        <div className="flex flex-col gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <KeyRound size={22} />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Recover Password</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans leading-relaxed">
            Enter your email address and we'll send you a recovery link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col gap-4 animate-slide-up">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-xs font-medium text-green-700 dark:text-green-400">
              Recovery link sent! Please check your email inbox for further instructions.
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              fullWidth
            >
              Return to Login
            </Button>
          </div>
        ) : (
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
              placeholder="zandi@mail.co.bw"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
              className="py-2.5 mt-2"
            >
              Send Reset Link <ArrowRight size={16} />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
