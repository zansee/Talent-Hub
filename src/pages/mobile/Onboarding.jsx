import React from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, ArrowRight } from 'lucide-react';
import Teemane from '../../components/shared/Teemane';
import Button from '../../components/shared/Button';
import useAuth from '../../hooks/useAuth';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleStart = () => {
    navigate('/mobile/profile-setup');
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-6 bg-[#12160d] text-white">
      {/* Top Section */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">TalentHub Botswana</span>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-[10px] font-bold text-primary border border-primary/20">
          <Sparkles size={10} />
          <span>Interactive Onboarding</span>
        </div>
      </div>

      {/* Mascot Waving and Welcome */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 my-8 text-center animate-slide-up">
        <Teemane pose="waving" size={180} animate={true} />
        
        <div className="flex flex-col gap-2 max-w-sm">
          <h1 className="text-2xl font-bold font-display text-white">
            Dumela, {profile?.full_name ? profile.full_name.split(' ')[0] : 'there'}!
          </h1>
          <p className="text-sm text-zinc-400 font-sans leading-relaxed">
            I am **Teemane**, your personal TalentHub Botswana guide. Let's set up your profile in a few quick steps to matching you with local opportunities.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-4 text-xs text-zinc-400 font-sans leading-relaxed">
          💡 **Why set up your profile?** Roles matching your qualifications (like ACCA, CIPS) and experience are scored in real time. We filter out lower matches to save your time!
        </div>

        <Button
          onClick={handleStart}
          variant="primary"
          fullWidth
          className="py-3.5"
        >
          Let's Begin Setup <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
