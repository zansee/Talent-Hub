import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Teemane from '../../components/shared/Teemane';
import Button from '../../components/shared/Button';
import { 
  User, 
  Settings, 
  Award, 
  Link as LinkIcon, 
  Upload, 
  Check, 
  ShieldCheck,
  RefreshCw,
  FileText,
  Copy
} from 'lucide-react';

export const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [cvHistory, setCvHistory] = useState([]);
  const [loadingCv, setLoadingCv] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCvHistory();
    }
  }, [user]);

  const fetchCvHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('cv_versions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCvHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadCV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingCv(true);
    try {
      // Mock upload path
      const fileUrl = `https://storage.supabase.com/cvs/mock-${user.id}-${Date.now()}.pdf`;
      const aiScore = Math.floor(Math.random() * 30) + 65; // Simulated AI CV analysis score 65-95

      // Add cv history
      const { error: historyError } = await supabase
        .from('cv_versions')
        .insert({
          user_id: user.id,
          cv_url: fileUrl,
          label: file.name,
          ai_score: aiScore,
          is_active: true
        });

      if (historyError) throw historyError;

      // Update main profile active cv
      await supabase
        .from('profiles')
        .update({
          cv_url: fileUrl,
          cv_score: aiScore
        })
        .eq('id', user.id);

      await refreshProfile();
      await fetchCvHistory();
    } catch (err) {
      console.error('CV upload error:', err);
    } finally {
      setLoadingCv(false);
    }
  };

  const handleCopyReferral = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Helper to calculate completion percentage dynamically
  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.full_name) score += 15;
    if (profile.phone) score += 10;
    if (profile.location) score += 10;
    if (profile.highest_qualification) score += 20;
    if (profile.current_job_title) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 15;
    if (profile.cv_url) score += 15;
    return score;
  };

  const completionPct = calculateCompletion();

  return (
    <div className="min-h-full bg-[#12160d] text-white flex flex-col font-sans p-4">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
        <h1 className="text-lg font-display font-bold">Seeker Profile</h1>
        <button
          onClick={() => navigate('/mobile/settings')}
          className="p-1.5 hover:bg-zinc-800/40 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Profile summary card */}
      <div className="bg-[#1a1f14] border border-zinc-800/60 rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* Circular progress bar */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-zinc-800"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-primary transition-all duration-500"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - completionPct / 100)}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-white">{completionPct}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-bold font-display text-white">{profile?.full_name || 'Anonymous User'}</h2>
            <span className="text-[10px] text-zinc-400">{profile?.email}</span>
            <span className="text-[10px] text-zinc-500 font-medium capitalize">
              Role: {profile?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Credentials / Verification */}
        {profile?.graduate_verification_status === 'approved' ? (
          <div className="p-2.5 rounded-xl bg-green-950/20 border border-green-900/20 text-[10px] text-green-400 flex items-center gap-1.5 font-sans font-semibold">
            <ShieldCheck size={14} />
            <span>Verified Graduate Tier active</span>
          </div>
        ) : profile?.graduate_verification_status === 'pending' ? (
          <div className="p-2.5 rounded-xl bg-yellow-950/20 border border-yellow-900/20 text-[10px] text-yellow-400 flex items-center gap-1.5 font-sans font-semibold">
            <RefreshCw size={14} className="animate-spin" />
            <span>Graduate verification pending review</span>
          </div>
        ) : null}
      </div>

      {/* CV Version History */}
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">CV Management</h3>
          <label className="text-[10px] font-bold text-primary hover:text-white transition-colors uppercase cursor-pointer flex items-center gap-0.5">
            <Upload size={12} /> Upload New
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadCV} className="hidden" disabled={loadingCv} />
          </label>
        </div>

        {loadingCv && (
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/20 flex items-center gap-2 text-xs text-zinc-400">
            <RefreshCw size={14} className="animate-spin text-primary" />
            <span>AI analyzing and grading CV...</span>
          </div>
        )}

        {cvHistory.length === 0 ? (
          <div className="p-5 border border-zinc-900 bg-zinc-950/20 text-center text-xs text-zinc-500 rounded-2xl font-sans">
            No CV uploaded. Add one to activate matching.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {cvHistory.map((cv) => (
              <div 
                key={cv.id} 
                className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-3 flex justify-between items-center"
              >
                <div className="flex items-center gap-2 min-w-0 pr-4">
                  <FileText size={16} className="text-zinc-500 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-white truncate">{cv.label}</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">
                      Uploaded {new Date(cv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {cv.ai_score && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      Score: {cv.ai_score}
                    </span>
                  )}
                  {cv.is_active && <Check size={14} className="text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referral Section */}
      <div className="mt-6 bg-[#1a1f14] border border-zinc-800/60 rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Award size={20} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-bold font-display text-white">Refer & Earn Premium Months</h3>
            <span className="text-[10px] text-zinc-400 font-sans mt-0.5">
              Get 1 month free premium for every friend who joins!
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-2.5 flex justify-between items-center font-mono text-xs select-all text-zinc-300">
            <span>{profile?.referral_code || 'Generating...'}</span>
            <button
              onClick={handleCopyReferral}
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              {copySuccess ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-900/40 pt-3">
          <span>Active referred accounts</span>
          <span className="font-bold text-white">{profile?.referral_reward_months || 0} friends</span>
        </div>
      </div>

    </div>
  );
};

export default Profile;
