import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Sparkles, Flame, Star, Zap, Clock } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Button from '../../components/shared/Button';
import Teemane from '../../components/shared/Teemane';

const SEEKER_FEATURES = [
  { icon: Flame, text: 'Access the full Job Swipe Feed with AI matching' },
  { icon: Star, text: 'AI CV scoring with personalised feedback' },
  { icon: Zap, text: 'Career Services: CV Revamp & Interview Prep' },
  { icon: CheckCircle2, text: 'Track formal job applications with status updates' },
  { icon: Sparkles, text: 'Weekly personalised job digest emails' },
];

const POSTER_FEATURES = [
  { icon: CheckCircle2, text: 'Post casual & quick gigs only' },
  { icon: Clock, text: 'No access to the main job swipe feed' },
];

export const UpgradeAccount = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(
    !!profile?.onboarding_checklist?.upgrade_requested
  );

  const handleRequest = async () => {
    setLoading(true);
    try {
      await updateProfile({
        onboarding_checklist: {
          ...(profile?.onboarding_checklist || {}),
          upgrade_requested: true,
          upgrade_requested_at: new Date().toISOString(),
        },
      });
      await supabase.from('notifications').insert({
        user_id: profile.id,
        title: '⬆️ Upgrade Request Sent!',
        body: 'Our team will review your upgrade request and notify you when approved.',
        type: 'system',
      });
      setRequested(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#12160d] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-900">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display font-bold text-sm">Upgrade to Job Seeker</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-6 pb-10">
        {/* Mascot */}
        <div className="flex justify-center">
          <Teemane pose="waving" size={140} animate />
        </div>

        <div className="text-center">
          <h2 className="font-display font-bold text-xl">Unlock Your Full Potential</h2>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Upgrade your account to a <span className="text-primary font-semibold">Job Seeker</span> profile and access the complete TalentHub Botswana experience.
          </p>
        </div>

        {/* Comparison */}
        <div className="flex flex-col gap-3">
          {/* Current Plan */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Your Current Plan — Quick Poster</p>
            <div className="flex flex-col gap-2">
              {POSTER_FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-xs text-zinc-400">
                  <Icon size={14} className="text-zinc-600 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Plan */}
          <div className="bg-primary/5 border border-primary/30 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute -top-3 -right-3 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1">
              <Sparkles size={10} /> Job Seeker Plan
            </p>
            <div className="flex flex-col gap-2.5">
              {SEEKER_FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <Icon size={14} className="text-primary shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {requested ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-primary/10 border border-primary/30 rounded-2xl text-center flex flex-col gap-2"
          >
            <CheckCircle2 size={28} className="text-primary mx-auto" />
            <p className="font-bold text-white text-sm">Request Submitted!</p>
            <p className="text-xs text-zinc-400">Our team will review and upgrade your account soon. You'll receive a notification once approved.</p>
          </motion.div>
        ) : (
          <Button onClick={handleRequest} variant="primary" loading={loading} fullWidth className="py-3.5">
            <Sparkles size={16} />
            Request Upgrade to Job Seeker
          </Button>
        )}

        <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
          Upgrades are typically processed within 24 hours. There is no additional cost for the base Job Seeker plan.
        </p>
      </div>
    </div>
  );
};

export default UpgradeAccount;
