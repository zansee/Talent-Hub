import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Teemane from '../../components/shared/Teemane';
import Button from '../../components/shared/Button';
import { 
  Award, 
  Check, 
  Upload, 
  ArrowLeft, 
  ShieldCheck, 
  Crown,
  Sparkles
} from 'lucide-react';

export const Subscription = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Graduate Upload flow
  const [gradFile, setGradFile] = useState(null);
  const [gradInstitution, setGradInstitution] = useState('');
  const [gradSuccess, setGradSuccess] = useState(false);

  const handleApplyGraduate = async (e) => {
    e.preventDefault();
    if (!gradFile || !gradInstitution) return;

    setLoading(true);
    try {
      // Mock document url
      const mockDocUrl = `https://storage.supabase.com/certificates/${user.id}-${Date.now()}.pdf`;

      // Update profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          graduate_verification_status: 'pending',
          graduate_doc_url: mockDocUrl,
          institution_name: gradInstitution
        })
        .eq('id', user.id);

      if (error) throw error;
      setGradSuccess(true);
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePremium = async () => {
    setLoading(true);
    try {
      // Upgrade immediately for simulated experience
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'premium',
          subscription_price: 100.00
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      alert('Premium access activated successfully! (Simulated payment complete)');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#12160d] text-white flex flex-col font-sans p-4 relative">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-3 mb-4">
        <button
          onClick={() => navigate('/mobile/profile')}
          className="p-1 hover:bg-zinc-800/40 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-display font-bold">Premium Upgrades</h1>
      </div>

      {/* Current plan detail */}
      <div className="bg-[#1a1f14] border border-zinc-800/60 rounded-3xl p-5 flex flex-col gap-1 mb-5">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Current Membership Plan</span>
        <div className="flex justify-between items-center mt-1">
          <h2 className="text-base font-bold font-display text-white capitalize">
            {profile?.subscription_tier === 'free' ? 'Standard Free Account' : `${profile?.subscription_tier} membership`}
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#6B7C3A]/20 text-primary border border-primary/20 capitalize">
            Active
          </span>
        </div>
      </div>

      {/* Upgrade Options */}
      <div className="flex flex-col gap-4">
        
        {/* Graduate tier option */}
        {profile?.subscription_tier !== 'graduate' && profile?.subscription_tier !== 'premium' && (
          <div className="bg-[#1a1f14] border border-zinc-800/60 rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-950/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold font-display text-white">Graduate Tier</h3>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Free for 6 Months</span>
                <p className="text-xs text-zinc-400 font-sans leading-normal mt-1">
                  Exclusively for recent graduates. Unlocks unlimited job applications, match tracking, and premium career guides.
                </p>
              </div>
            </div>

            {profile?.graduate_verification_status === 'pending' ? (
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-850 text-[10px] text-zinc-400 text-center">
                Your graduate proof is currently pending verification.
              </div>
            ) : gradSuccess ? (
              <div className="p-3 rounded-xl bg-green-950/20 border border-green-900/20 text-[10px] text-green-400 text-center font-bold">
                Application submitted! Verification takes up to 24 hours.
              </div>
            ) : (
              <form onSubmit={handleApplyGraduate} className="flex flex-col gap-3 border-t border-zinc-900/40 pt-3">
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="Enter Institution (e.g. University of Botswana)"
                    value={gradInstitution}
                    onChange={(e) => setGradInstitution(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs font-sans rounded-xl bg-zinc-950/60 border border-zinc-800 text-white focus:outline-none focus:border-primary placeholder-zinc-700"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex-1 px-3 py-2 text-center text-[10px] font-bold text-zinc-400 hover:text-white bg-zinc-950/60 border border-dashed border-zinc-800 hover:border-primary rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1">
                    <Upload size={12} />
                    <span>{gradFile ? gradFile.name : 'Upload Certificate (PDF)'}</span>
                    <input type="file" accept=".pdf" onChange={(e) => setGradFile(e.target.files[0])} className="hidden" required />
                  </label>
                  
                  <Button variant="primary" size="sm" type="submit" loading={loading} disabled={!gradFile || !gradInstitution}>
                    Apply Tier
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Premium tier option */}
        {profile?.subscription_tier !== 'premium' && (
          <div className="bg-[#1a1f14] border border-zinc-800/60 rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-2xl bg-yellow-950/20 text-yellow-500 flex items-center justify-center shrink-0">
                <Crown size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold font-display text-white">TalentHub Premium</h3>
                <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">P100.00 BWP / Month</span>
                <p className="text-xs text-zinc-400 font-sans leading-normal mt-1">
                  Maximize your job search! Get highlighted applications, AI cover letter generator assistance, custom CV revamps, and immediate alerts.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-zinc-900/40 pt-4">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Check size={14} className="text-primary shrink-0" />
                <span>AI-Assisted Cover Letters</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Check size={14} className="text-primary shrink-0" />
                <span>Unlimited Swipes & Feed Filters</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Check size={14} className="text-primary shrink-0" />
                <span>Priority HR Consultant Matching</span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handlePurchasePremium}
              loading={loading}
              className="mt-2 w-full flex items-center justify-center gap-1.5 bg-yellow-600 hover:bg-yellow-750 text-white"
            >
              <Crown size={14} /> Upgrade to Premium
            </Button>
          </div>
        )}

        {profile?.subscription_tier === 'premium' && (
          <div className="bg-[#1a1f14] border border-zinc-800/60 rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-4">
            <Teemane pose="celebrating" size={100} animate />
            <h3 className="text-base font-bold font-display text-white">You're a Premium Member!</h3>
            <p className="text-xs text-zinc-400 max-w-xs font-sans leading-relaxed">
              Thank you for supporting TalentHub Botswana. All premium features, filters, AI cover letters, and consulting tools are unlocked.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};

export default Subscription;
